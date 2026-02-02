import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author, Book, Genre, Publisher, DatabaseModule } from '@cmpc-test/shared';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { GenresModule } from './genres/genres.module';
import { PublishersModule } from './publishers/publishers.module';
import { CatalogSeeder } from './database/seeds/catalog.seeder';
import { DatabaseController } from './database/database.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    DatabaseModule.forRoot({
      entities: [Author, Book, Genre, Publisher],
    }),
    TypeOrmModule.forFeature([Author, Book, Genre, Publisher]),
    AuthModule,
    BooksModule,
    AuthorsModule,
    GenresModule,
    PublishersModule,
  ],
  controllers: [DatabaseController],
  providers: [CatalogSeeder],
})
export class AppModule {}
