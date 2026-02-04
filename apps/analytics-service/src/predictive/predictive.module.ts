import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 
  BookAnalytics, 
  Sale, 
  SaleItem, 
  Inventory, 
  StockMovement,
  Book 
} from '@cmpc-test/shared';
import { PredictiveService } from './predictive.service';
import { PredictiveController } from './predictive.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookAnalytics,
      Sale,
      SaleItem,
      Inventory,
      StockMovement,
      Book
    ])
  ],
  controllers: [PredictiveController],
  providers: [PredictiveService],
  exports: [PredictiveService],
})
export class PredictiveModule {}
