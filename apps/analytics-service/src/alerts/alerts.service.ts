import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  Alert,
  AlertType,
  AlertSeverity,
  AlertStatus,
  Inventory,
  BookAnalytics,
  Book,
  Sale
} from '@cmpc-test/shared';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepo: Repository<Alert>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(BookAnalytics)
    private readonly analyticsRepo: Repository<BookAnalytics>,
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,
  ) {}

  /**
   * Ejecutar verificación de alertas cada hora
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkAndGenerateAlerts() {
    this.logger.log('Running alert checks...');

    await Promise.all([
      this.checkLowStockAlerts(),
      this.checkOutOfStockAlerts(),
      this.checkHighDemandAlerts(),
      this.checkLowRotationAlerts(),
      this.checkRestockNeeded(),
    ]);

    this.logger.log('Alert checks completed');
  }

  /**
   * Obtener todas las alertas activas
   */
  async getActiveAlerts(limit: number = 50) {
    return this.alertRepo.find({
      where: { status: AlertStatus.ACTIVE },
      order: { 
        severity: 'DESC',
        createdAt: 'DESC' 
      },
      take: limit,
    });
  }

  /**
   * Obtener alertas por tipo
   */
  async getAlertsByType(type: AlertType) {
    return this.alertRepo.find({
      where: { type, status: AlertStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener alertas por severidad
   */
  async getAlertsBySeverity(severity: AlertSeverity) {
    return this.alertRepo.find({
      where: { severity, status: AlertStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Marcar alerta como reconocida
   */
  async acknowledgeAlert(alertId: string, userId: string) {
    const alert = await this.alertRepo.findOne({ where: { id: alertId } });
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();

    return this.alertRepo.save(alert);
  }

  /**
   * Marcar alerta como resuelta
   */
  async resolveAlert(alertId: string) {
    const alert = await this.alertRepo.findOne({ where: { id: alertId } });
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.status = AlertStatus.RESOLVED;
    alert.resolvedAt = new Date();

    return this.alertRepo.save(alert);
  }

  /**
   * Descartar alerta
   */
  async dismissAlert(alertId: string) {
    const alert = await this.alertRepo.findOne({ where: { id: alertId } });
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.status = AlertStatus.DISMISSED;
    return this.alertRepo.save(alert);
  }

  // Métodos privados para verificar diferentes tipos de alertas

  private async checkLowStockAlerts() {
    const inventories = await this.inventoryRepo.find({
      relations: ['book'],
    });

    for (const inv of inventories) {
      // Si el stock está entre minStock y minStock + 20%
      const threshold = inv.minStock * 1.2;
      
      if (inv.currentStock > 0 && inv.currentStock <= threshold && inv.currentStock > inv.minStock * 0.5) {
        await this.createOrUpdateAlert({
          type: AlertType.LOW_STOCK,
          severity: AlertSeverity.MEDIUM,
          bookId: inv.bookId,
          bookTitle: inv.book.title,
          message: `Stock bajo para "${inv.book.title}". Stock actual: ${inv.currentStock}, Stock mínimo: ${inv.minStock}`,
          metadata: {
            currentStock: inv.currentStock,
            minStock: inv.minStock,
            percentage: (inv.currentStock / inv.minStock) * 100,
          },
        });
      }
    }
  }

  private async checkOutOfStockAlerts() {
    const inventories = await this.inventoryRepo.find({
      relations: ['book'],
      where: { currentStock: 0 },
    });

    for (const inv of inventories) {
      await this.createOrUpdateAlert({
        type: AlertType.OUT_OF_STOCK,
        severity: AlertSeverity.HIGH,
        bookId: inv.bookId,
        bookTitle: inv.book.title,
        message: `¡Sin stock! "${inv.book.title}" no tiene unidades disponibles`,
        metadata: {
          currentStock: inv.currentStock,
        },
      });
    }
  }

  private async checkHighDemandAlerts() {
    const analytics = await this.analyticsRepo.find({
      relations: ['book'],
    });

    for (const analytic of analytics) {
      // Alta demanda si las ventas de los últimos 7 días son 50% más que el promedio
      const avgWeekly = analytic.salesLast30Days / 4;
      const recentWeekly = analytic.salesLast7Days;

      if (recentWeekly > avgWeekly * 1.5 && avgWeekly > 0) {
        const inventory = await this.inventoryRepo.findOne({
          where: { bookId: analytic.bookId },
        });

        await this.createOrUpdateAlert({
          type: AlertType.HIGH_DEMAND,
          severity: AlertSeverity.LOW,
          bookId: analytic.bookId,
          bookTitle: analytic.book.title,
          message: `Alta demanda detectada para "${analytic.book.title}". Ventas recientes: ${recentWeekly}, Promedio: ${Math.round(avgWeekly)}`,
          metadata: {
            salesLast7Days: recentWeekly,
            averageWeeklySales: avgWeekly,
            currentStock: inventory?.currentStock || 0,
            increasePercentage: ((recentWeekly - avgWeekly) / avgWeekly) * 100,
          },
        });
      }
    }
  }

  private async checkLowRotationAlerts() {
    const analytics = await this.analyticsRepo.find({
      relations: ['book'],
    });

    for (const analytic of analytics) {
      // Baja rotación si la tasa de rotación es menor a 1 y tiene stock
      if (analytic.rotationRate < 1 && analytic.rotationRate >= 0) {
        const inventory = await this.inventoryRepo.findOne({
          where: { bookId: analytic.bookId },
        });

        if (inventory && inventory.currentStock > 10) {
          await this.createOrUpdateAlert({
            type: AlertType.LOW_ROTATION,
            severity: AlertSeverity.LOW,
            bookId: analytic.bookId,
            bookTitle: analytic.book.title,
            message: `Baja rotación para "${analytic.book.title}". Tasa: ${analytic.rotationRate.toFixed(2)}, Stock: ${inventory.currentStock}`,
            metadata: {
              rotationRate: analytic.rotationRate,
              currentStock: inventory.currentStock,
              daysToSell: analytic.daysToSell,
              lastSaleDate: analytic.lastSaleDate,
            },
          });
        }
      }
    }
  }

  private async checkRestockNeeded() {
    const inventories = await this.inventoryRepo.find({
      relations: ['book'],
    });

    for (const inv of inventories) {
      const analytics = await this.analyticsRepo.findOne({
        where: { bookId: inv.bookId },
      });

      if (!analytics) continue;

      // Predicción simple: si con la demanda proyectada se agotará en menos de 7 días
      const dailyDemand = (analytics.predictedDemand30Days || 0) / 30;
      const daysUntilStockout = dailyDemand > 0 ? inv.currentStock / dailyDemand : 999;

      if (daysUntilStockout < 7 && daysUntilStockout > 0) {
        const severity = daysUntilStockout <= 3 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH;

        await this.createOrUpdateAlert({
          type: AlertType.RESTOCK_NEEDED,
          severity,
          bookId: inv.bookId,
          bookTitle: inv.book.title,
          message: `Reabastecimiento necesario para "${inv.book.title}". Se agotará en ~${Math.round(daysUntilStockout)} días`,
          metadata: {
            currentStock: inv.currentStock,
            predictedDemand30Days: analytics.predictedDemand30Days,
            daysUntilStockout: Math.round(daysUntilStockout),
            recommendedRestock: analytics.recommendedRestockQuantity,
          },
        });
      }
    }
  }

  private async createOrUpdateAlert(data: Partial<Alert>) {
    // Buscar si ya existe una alerta activa del mismo tipo para el mismo libro
    const existing = await this.alertRepo.findOne({
      where: {
        type: data.type,
        bookId: data.bookId,
        status: AlertStatus.ACTIVE,
      },
    });

    if (existing) {
      // Actualizar alerta existente
      Object.assign(existing, {
        severity: data.severity,
        message: data.message,
        metadata: data.metadata,
        updatedAt: new Date(),
      });
      return this.alertRepo.save(existing);
    } else {
      // Crear nueva alerta
      const alert = this.alertRepo.create(data);
      return this.alertRepo.save(alert);
    }
  }
}
