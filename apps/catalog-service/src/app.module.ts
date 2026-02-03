import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { 
  Author, 
  Book, 
  Genre, 
  Publisher, 
  DatabaseModule,
  AuditLog,
  Inventory,
  StockMovement,
  Sale,
  SaleItem,
  BookAnalytics,
  Alert,
  InventorySnapshot
} from '@cmpc-test/shared';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { GenresModule } from './genres/genres.module';
import { PublishersModule } from './publishers/publishers.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PredictiveModule } from './predictive/predictive.module';
import { ReportsModule } from './reports/reports.module';
import { AlertsModule } from './alerts/alerts.module';
import { CatalogSeeder } from './database/seeds/catalog.seeder';
import { DatabaseController } from './database/database.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    ScheduleModule.forRoot(),
    DatabaseModule.forRoot({
      entities: [
        Author, 
        Book, 
        Genre, 
        Publisher,
        AuditLog,
        Inventory,
        StockMovement,
        Sale,
        SaleItem,
        BookAnalytics,
        Alert,
        InventorySnapshot
      ],
    }),
    TypeOrmModule.forFeature([
      Author, 
      Book, 
      Genre, 
      Publisher,
      AuditLog,
      Inventory,
      StockMovement,
      Sale,
      SaleItem,
      BookAnalytics,
      Alert,
      InventorySnapshot
    ]),
    AuthModule,
    BooksModule,
    AuthorsModule,
    GenresModule,
    PublishersModule,
    AnalyticsModule,
    PredictiveModule,
    ReportsModule,
    AlertsModule,
  ],
  controllers: [DatabaseController],
  providers: [CatalogSeeder],
})
export class AppModule {}
