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
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

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
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
