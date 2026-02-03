import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 
  Alert,
  Inventory,
  BookAnalytics,
  Book,
  Sale
} from '@cmpc-test/shared';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Alert,
      Inventory,
      BookAnalytics,
      Book,
      Sale
    ])
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
