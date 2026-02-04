import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DatabaseModule,
  BookAnalytics,
  Inventory,
  StockMovement,
  Sale,
  SaleItem,
  Book,
  Author,
  Publisher,
  Genre,
  KafkaConsumerModule,
} from '@cmpc-test/shared';
import { SalesEventConsumer } from './consumers/sales-event.consumer';
import { AnalyticsService } from './services/analytics.service';
import { InventoryService } from './services/inventory.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    DatabaseModule.forRoot({
      entities: [
        BookAnalytics,
        Inventory,
        StockMovement,
        Sale,
        SaleItem,
        Book,
        Author,
        Publisher,
        Genre,
      ],
    }),
    TypeOrmModule.forFeature([
      BookAnalytics,
      Inventory,
      StockMovement,
      Sale,
      SaleItem,
      Book,
      Author,
      Publisher,
      Genre,
    ]),
    KafkaConsumerModule.register({
      groupId: process.env.KAFKA_GROUP_ID || 'analytics-group',
      clientId: process.env.KAFKA_CLIENT_ID || 'analytics-worker',
    }),
  ],
  controllers: [SalesEventConsumer],
  providers: [AnalyticsService, InventoryService],
})
export class AppModule {}
