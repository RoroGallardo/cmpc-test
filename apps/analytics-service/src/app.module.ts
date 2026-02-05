import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { 
  Author, 
  Book, 
  Genre, 
  Publisher, 
  User,
  DatabaseModule,
  Inventory,
  StockMovement,
  Sale,
  SaleItem,
  BookAnalytics,
  Alert,
  AuditLog
} from '@cmpc-test/shared';
import { AnalyticsModule } from './analytics/analytics.module';
import { PredictiveModule } from './predictive/predictive.module';
import { ReportsModule } from './reports/reports.module';
import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';

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
        User,
        Inventory,
        StockMovement,
        Sale,
        SaleItem,
        BookAnalytics,
        Alert,
        AuditLog
      ],
    }),
    TypeOrmModule.forFeature([
      Author, 
      Book, 
      Genre, 
      Publisher,
      User,
      Inventory,
      StockMovement,
      Sale,
      SaleItem,
      BookAnalytics,
      Alert,
      AuditLog
    ]),
    AuthModule,
    AnalyticsModule,
    PredictiveModule,
    ReportsModule,
    AlertsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
