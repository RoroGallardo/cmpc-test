import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book, Author, Publisher, Genre } from '@cmpc-test/shared';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author, Publisher, Genre])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
