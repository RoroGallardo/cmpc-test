import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Analytics Worker');
  
  const brokers = (process.env['KAFKA_BROKERS'] || 'localhost:9092').split(',');
  const clientId = process.env['KAFKA_CLIENT_ID'] || 'analytics-worker';
  const groupId = process.env['KAFKA_GROUP_ID'] || 'analytics-group';

  logger.log('🔧 Configurando Analytics Worker...');
  logger.log(`📡 Brokers: ${brokers.join(', ')}`);
  logger.log(`🆔 Client ID: ${clientId}`);
  logger.log(`👥 Group ID: ${groupId}`);

  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      {
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId,
            brokers,
          },
          consumer: {
            groupId,
          },
        },
      },
    );

    await app.listen();
    logger.log('✅ Analytics Worker iniciado correctamente');
    logger.log('🎧 Escuchando eventos de Kafka...');
    logger.log('📋 Eventos suscritos: sale.completed, sale.cancelled');
  } catch (error) {
    logger.error('❌ Error iniciando Analytics Worker:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});
