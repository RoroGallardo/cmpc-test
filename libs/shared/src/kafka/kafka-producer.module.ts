import { Module, Global } from '@nestjs/common';
import { KafkaProducerService } from './kafka-producer.service';

/**
 * Módulo global para el producer de Kafka
 * Se puede importar una sola vez en el AppModule raíz
 */
@Global()
@Module({
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaProducerModule {}
