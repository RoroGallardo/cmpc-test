// import { Controller, Logger } from '@nestjs/common';
// import { MessagePattern, Payload } from '@nestjs/microservices';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Inventory, StockMovement, MovementType, Sale } from '@cmpc-test/shared';

// @Controller()
// export class InventoryConsumer {
//   private readonly logger = new Logger(InventoryConsumer.name);

//   constructor(
//     @InjectRepository(Inventory)
//     private readonly inventoryRepo: Repository<Inventory>,
//     @InjectRepository(StockMovement)
//     private readonly movementRepo: Repository<StockMovement>,
//   ) {}

//   /**
//    * Actualizar inventario cuando se completa una venta
//    */
//   @MessagePattern('sale.completed')
//   async handleSaleCompleted(@Payload() message: any) {
//     const sale: Sale = message.value || message;
//     this.logger.log(`📦 Procesando inventario para venta ${sale.id}`);

//     try {
//       for (const item of sale.items) {
//         // Buscar inventario
//         const inventory = await this.inventoryRepo.findOne({
//           where: { bookId: item.bookId },
//         });

//         if (!inventory) {
//           this.logger.warn(`⚠️ No se encontró inventario para libro ${item.bookId}`);
//           continue;
//         }

//         const stockBefore = inventory.currentStock;
//         const stockAfter = stockBefore - item.quantity;

//         // Validar que hay stock suficiente
//         if (stockAfter < 0) {
//           this.logger.error(
//             `❌ Stock insuficiente para ${item.bookTitle}: ${stockBefore} disponible, ${item.quantity} solicitado`
//           );
//           continue;
//         }

//         // Actualizar inventario
//         inventory.currentStock = stockAfter;
  

//         await this.inventoryRepo.save(inventory);

//         // Crear movimiento de stock
//         const movement = this.movementRepo.create({
//           bookId: item.bookId,
//           type: MovementType.SALE,
//           quantity: -item.quantity,
//           stockBefore,
//           stockAfter,
//           unitPrice: item.unitPrice,
//           notes: `Venta ${sale.id} - Cliente: ${sale.customerName || 'N/A'}`,
//           referenceId: sale.id,
//           userId: sale.sellerId,
//         });

//         await this.movementRepo.save(movement);

//         this.logger.log(
//           `✅ Inventario actualizado para ${item.bookTitle}: ${stockBefore} → ${stockAfter} (-${item.quantity})`
//         );
//       }
//     } catch (error) {
//       this.logger.error(`❌ Error procesando inventario para venta ${sale.id}:`, error);
//       throw error;
//     }
//   }

//   /**
//    * Revertir inventario cuando se cancela una venta
//    */
//   @MessagePattern('sale.cancelled')
//   async handleSaleCancelled(@Payload() message: any) {
//     const sale: Sale = message.value || message;
//     this.logger.log(`🔄 Revirtiendo inventario para venta cancelada ${sale.id}`);

//     try {
//       for (const item of sale.items) {
//         const inventory = await this.inventoryRepo.findOne({
//           where: { bookId: item.bookId },
//         });

//         if (!inventory) {
//           this.logger.warn(`⚠️ No se encontró inventario para libro ${item.bookId}`);
//           continue;
//         }

//         const stockBefore = inventory.currentStock;
//         const stockAfter = stockBefore + item.quantity;

//         // Actualizar inventario
//         inventory.currentStock = stockAfter;

//         await this.inventoryRepo.save(inventory);

//         // Crear movimiento de ajuste
//         const movement = this.movementRepo.create({
//           bookId: item.bookId,
//           type: MovementType.ADJUSTMENT,
//           quantity: item.quantity,
//           stockBefore,
//           stockAfter,
//           unitPrice: item.unitPrice,
//           notes: `Cancelación de venta ${sale.id}`,
//           referenceId: sale.id,
//         });

//         await this.movementRepo.save(movement);

//         this.logger.log(
//           `✅ Inventario revertido para ${item.bookTitle}: ${stockBefore} → ${stockAfter} (+${item.quantity})`
//         );
//       }
//     } catch (error) {
//       this.logger.error(`❌ Error revirtiendo inventario para venta ${sale.id}:`, error);
//       throw error;
//     }
//   }
// }
