import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { createWinstonConfig } from '@cmpc-test/shared';
import { AppModule } from './app.module';

async function bootstrap() {
  // Configurar Winston logger
  const logger = WinstonModule.createLogger(createWinstonConfig('analytics-service'));
  
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  
  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar CORS
  app.enableCors();

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Analytics Service API')
    .setDescription('API de analytics, predicciones, reportes y alertas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3003;
  await app.listen(port);
  logger.log(`🚀 Analytics Service running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`📊 Swagger docs: http://localhost:${port}/api/docs`, 'Bootstrap');
}
bootstrap();
