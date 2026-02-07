import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { createWinstonConfig } from '@cmpc-test/shared';
import { AppModule } from './app.module';

async function bootstrap() {
  // Configurar Winston logger
  const logger = WinstonModule.createLogger(createWinstonConfig('catalog-service'));
  
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
    .setTitle('Catalog Service API')
    .setDescription('API de catálogo de libros, autores, géneros y editoriales')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['CATALOG_PORT'] || 3002;
  await app.listen(port);
  logger.log(`🚀 Catalog Service running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`, 'Bootstrap');
}
bootstrap();
