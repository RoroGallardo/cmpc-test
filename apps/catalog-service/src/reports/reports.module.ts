import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 
  BookAnalytics, 
  Sale, 
  SaleItem, 
  Inventory, 
  StockMovement,
  Book,
  Author,
  Genre,
  Publisher,
  AuditLog
} from '@cmpc-test/shared';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookAnalytics,
      Sale,
      SaleItem,
      Inventory,
      StockMovement,
      Book,
      Author,
      Genre,
      Publisher,
      AuditLog
    ])
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
