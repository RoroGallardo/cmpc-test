import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Sale } from '@cmpc-test/shared';
import { AnalyticsService } from '../services/analytics.service';
import { InventoryService } from '../services/inventory.service';

@Controller()
export class SalesEventConsumer {
  private readonly logger = new Logger(SalesEventConsumer.name);

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly inventoryService: InventoryService,
  ) {
    this.logger.log('🔵 SalesEventConsumer inicializado y listo para recibir eventos');
  }

  /**
   * Consumir evento cuando se completa una venta
   * Orquesta el procesamiento de analytics e inventario
   */
  @MessagePattern('sale.completed')
  async handleSaleCompleted(@Payload() message: any) {
    const sale: Sale = message.value || message;
    this.logger.log(`📨 Evento sale.completed recibido: ${sale.id}`);

    try {
      // Ejecutar ambos procesos en paralelo
      await Promise.all([
        this.analyticsService.processSaleCompleted(sale),
        this.inventoryService.processSaleCompleted(sale),
      ]);

      this.logger.log(`✅ Venta ${sale.id} procesada completamente`);
    } catch (error) {
      this.logger.error(`❌ Error procesando venta ${sale.id}:`, error);
      throw error;
    }
  }

  /**
   * Consumir evento cuando se cancela una venta
   */
  @MessagePattern('sale.cancelled')
  async handleSaleCancelled(@Payload() message: any) {
    const sale: Sale = message.value || message;
    this.logger.log(`📨 Evento sale.cancelled recibido: ${sale.id}`);

    try {
      // Solo el inventario necesita revertirse cuando se cancela
      await this.inventoryService.processSaleCancelled(sale);

      this.logger.log(`✅ Venta cancelada ${sale.id} procesada completamente`);
    } catch (error) {
      this.logger.error(`❌ Error procesando cancelación de venta ${sale.id}:`, error);
      throw error;
    }
  }

  /**
   * Consumir evento cuando se crea una venta (para tracking)
   */
  @MessagePattern('sale.created')
  async handleSaleCreated(@Payload() message: any) {
    const sale: Sale = message.value || message;
    this.logger.log(`📝 Venta creada registrada: ${sale.id} (Status: ${sale.status})`);
  }
}
