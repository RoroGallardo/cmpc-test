import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 
  Sale, 
  SaleItem, 
  Book, 
  Inventory, 
  StockMovement,
  BookAnalytics,
  KafkaProducerModule,
} from '@cmpc-test/shared';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      SaleItem,
      Book,
      Inventory,
      StockMovement,
      BookAnalytics,
    ]),
    KafkaProducerModule,
  ],
  controllers: [SalesController],
  providers: [
    SalesService,
  ],
  exports: [SalesService],
})
export class SalesModule {}
