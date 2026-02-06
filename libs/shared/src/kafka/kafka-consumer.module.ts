import { Module, DynamicModule } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

export interface KafkaConsumerConfig {
  groupId: string;
  clientId?: string;
  brokers?: string[];
}

/**
 * Módulo configurable para consumidores de Kafka
 * Permite configurar el groupId y clientId según la aplicación
 */
@Module({})
export class KafkaConsumerModule {
  static register(config: KafkaConsumerConfig): DynamicModule {
    const {
      groupId,
      clientId = 'cmpc-consumer',
      brokers = (process.env['KAFKA_BROKERS'] || 'localhost:19092').split(','),
    } = config;

    return {
      module: KafkaConsumerModule,
      imports: [
        ClientsModule.register([
          {
            name: 'KAFKA_SERVICE',
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId,
                brokers,
              },
              consumer: {
                groupId,
                allowAutoTopicCreation: true,
              },
            },
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
