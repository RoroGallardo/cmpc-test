import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { 
  Author, 
  Book, 
  Genre, 
  Publisher, 
  User,
  DatabaseModule,
  AuditLog,
  Inventory,
  StockMovement,
  Sale,
  SaleItem,
} from '@cmpc-test/shared';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { GenresModule } from './genres/genres.module';
import { PublishersModule } from './publishers/publishers.module';
import { SalesModule } from './sales/sales.module';
import { CatalogSeeder } from './database/seeds/catalog.seeder';
import { DatabaseController } from './database/database.controller';
import { AuditInterceptor } from './interceptors/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    DatabaseModule.forRoot({
      entities: [
        Author, 
        Book, 
        Genre, 
        Publisher,
        User,
        AuditLog,
        Inventory,
        StockMovement,
        Sale,
        SaleItem,
      ],
    }),
    TypeOrmModule.forFeature([
      Author, 
      Book, 
      Genre, 
      Publisher,
      User,
      AuditLog,
      Inventory,
      StockMovement,
      Sale,
      SaleItem,
    ]),
    AuthModule,
    BooksModule,
    AuthorsModule,
    GenresModule,
    PublishersModule,
    SalesModule,
  ],
  controllers: [DatabaseController],
  providers: [
    CatalogSeeder,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
