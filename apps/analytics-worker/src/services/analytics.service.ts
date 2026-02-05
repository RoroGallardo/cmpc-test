import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookAnalytics, Sale, Inventory } from '@cmpc-test/shared';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(BookAnalytics)
    private readonly analyticsRepo: Repository<BookAnalytics>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  async processSaleCompleted(sale: Sale): Promise<void> {
    this.logger.log(`📊 Procesando analytics para venta ${sale.id}`);

    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      this.logger.log(`Items en la venta: ${sale.items?.length || 0}`);

      // Procesar cada item de la venta
      for (const item of sale.items) {
        this.logger.log(`Procesando item: ${item.bookId}`);

        let analytics = await this.analyticsRepo.findOne({
          where: { bookId: item.bookId },
        });

        if (!analytics) {
          // Crear nuevo registro de analytics
          analytics = this.analyticsRepo.create({
            bookId: item.bookId,
            totalUnitsSold: 0,
            totalRevenue: 0,
            salesLast7Days: 0,
            salesLast30Days: 0,
            salesLast90Days: 0,
            lastSaleDate: null,
            firstSaleDate: null,
          });
        }

        // Actualizar totales
        analytics.totalUnitsSold = (analytics.totalUnitsSold || 0) + item.quantity;
        analytics.totalRevenue = Number(analytics.totalRevenue || 0) + Number(item.subtotal);
        analytics.lastSaleDate = sale.createdAt || new Date();
        
        // Establecer firstSaleDate si es la primera venta
        if (!analytics.firstSaleDate) {
          analytics.firstSaleDate = sale.createdAt || new Date();
        }

        // Actualizar ventas por periodo
        const saleDate = sale.createdAt || new Date();
        
        if (saleDate >= sevenDaysAgo) {
          analytics.salesLast7Days = (analytics.salesLast7Days || 0) + item.quantity;
        }
        
        if (saleDate >= thirtyDaysAgo) {
          analytics.salesLast30Days = (analytics.salesLast30Days || 0) + item.quantity;
        }
        
        if (saleDate >= ninetyDaysAgo) {
          analytics.salesLast90Days = (analytics.salesLast90Days || 0) + item.quantity;
        }

        analytics.lastCalculatedAt = new Date();

        // Calcular rotación de inventario
        const inventory = await this.inventoryRepo.findOne({
          where: { bookId: item.bookId },
        });

        if (inventory) {
          if (inventory.currentStock > 0) {
            // Rotation rate: ventas últimos 30 días / stock actual
            const monthlyRotation = analytics.salesLast30Days / inventory.currentStock;
            analytics.rotationRate = monthlyRotation * 12; // Anualizado
            
            // Days to sell: días necesarios para vender el stock actual al ritmo actual
            if (analytics.salesLast30Days > 0) {
              const dailySales = analytics.salesLast30Days / 30;
              analytics.daysToSell = Math.ceil(inventory.currentStock / dailySales);
            } else {
              analytics.daysToSell = 999; // Sin ventas recientes
            }
          } else {
            // Stock en 0: mantener la última rotación calculada o calcular basándose solo en ventas
            // Si hay ventas en los últimos 30 días, significa alta rotación (se agotó)
            if (analytics.salesLast30Days > 0) {
              // Usar un valor alto que refleje que el stock se agotó por ventas
              analytics.rotationRate = Math.max(analytics.rotationRate || 0, 12); // Mínimo 12 rotaciones/año
            }
            analytics.daysToSell = 0; // Sin stock = 0 días para vender
          }
        } else {
          // No hay inventario registrado
          analytics.rotationRate = 0;
          analytics.daysToSell = 0;
        }

        await this.analyticsRepo.save(analytics);

        this.logger.log(
          `✅ Analytics actualizado para libro ${item.bookId}: +${item.quantity} unidades (Total: ${analytics.totalUnitsSold}, Rotación: ${analytics.rotationRate.toFixed(2)})`
        );
      }
    } catch (error) {
      this.logger.error(`❌ Error procesando analytics para venta ${sale.id}:`, error);
      throw error;
    }
  }
}
