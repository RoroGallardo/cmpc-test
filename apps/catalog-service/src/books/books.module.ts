import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book, Author, Publisher, Genre, Inventory } from '@cmpc-test/shared';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author, Publisher, Genre, Inventory])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
