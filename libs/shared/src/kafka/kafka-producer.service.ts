import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import { ClientKafka, Client, Transport } from '@nestjs/microservices';

/**
 * Singleton Kafka Producer Service
 * Se puede usar en cualquier aplicación que necesite publicar eventos a Kafka
 */
@Injectable({ scope: Scope.DEFAULT }) // Singleton por defecto
export class KafkaProducerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaProducerService.name);
  private static instance: KafkaProducerService;

  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: process.env.KAFKA_CLIENT_ID || 'cmpc-producer',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:19092').split(','),
      },
      producer: {
        allowAutoTopicCreation: true,
      },
    },
  })
  private client!: ClientKafka;

  constructor() {
    if (KafkaProducerService.instance) {
      return KafkaProducerService.instance;
    }
    KafkaProducerService.instance = this;
  }

  async onModuleInit() {
    const topics = ['sale.created', 'sale.completed', 'sale.cancelled'];
    
    topics.forEach(topic => {
      this.client.subscribeToResponseOf(topic);
    });

    await this.client.connect();
    this.logger.log('✅ Kafka producer connected (Singleton)');
  }

  /**
   * Emitir evento a Kafka
   */
  emit(topic: string, data: any) {
    this.logger.log(`📤 Publishing event to topic: ${topic}`);
    return this.client.emit(topic, data);
  }

  /**
   * Obtener la instancia singleton
   */
  static getInstance(): KafkaProducerService {
    if (!KafkaProducerService.instance) {
      KafkaProducerService.instance = new KafkaProducerService();
    }
    return KafkaProducerService.instance;
  }

  /**
   * Cerrar conexión
   */
  async close() {
    await this.client.close();
    this.logger.log('🔌 Kafka producer disconnected');
  }
}
