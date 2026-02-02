import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Author, Publisher, Genre, Book } from '@cmpc-test/shared';
import {
  SEED_GENRES,
  SEED_AUTHORS,
  SEED_PUBLISHERS,
  SEED_BOOKS,
} from '@cmpc-test/utils';

@Injectable()
export class CatalogSeeder implements OnModuleInit {
  private readonly logger = new Logger(CatalogSeeder.name);

  constructor(
    @InjectRepository(Author)
    private readonly authorsRepository: Repository<Author>,
    @InjectRepository(Publisher)
    private readonly publishersRepository: Repository<Publisher>,
    @InjectRepository(Genre)
    private readonly genresRepository: Repository<Genre>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    const nodeEnv = process.env.NODE_ENV;
    // Solo ejecutar automáticamente en desarrollo
    if (nodeEnv === 'development') {
      await this.seedCatalog();
    }
  }

  async seedCatalog(): Promise<void> {
    // Usar QueryRunner para manejar transacciones manualmente
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar si ya existen datos
      const existingBooks = await queryRunner.manager.count(Book);
      if (existingBooks > 0) {
        this.logger.log('El catálogo ya contiene datos, saltando seed');
        await queryRunner.release();
        return;
      }

      this.logger.log('Iniciando seed del catálogo...');

      // Crear géneros dentro de la transacción
      const genres = await queryRunner.manager.save(Genre, SEED_GENRES);

      // Crear autores dentro de la transacción
      const authors = await queryRunner.manager.save(Author, SEED_AUTHORS);

      // Crear editoriales dentro de la transacción
      const publishers = await queryRunner.manager.save(Publisher, SEED_PUBLISHERS);

      // Crear libros con relaciones dentro de la transacción
      const books = await queryRunner.manager.save(
        Book,
        SEED_BOOKS.map((book) => ({
          title: book.title,
          price: book.price,
          available: book.available,
          authorId: authors[book.authorIndex].id,
          publisherId: publishers[book.publisherIndex].id,
          genreId: genres[book.genreIndex].id,
          imageUrl: book.imageUrl,
        })),
      );

      // Si todo fue bien, commit de la transacción
      await queryRunner.commitTransaction();

      this.logger.log('✅ Catálogo creado exitosamente!');
      this.logger.log(`📚 Creados ${books.length} libros`);
      this.logger.log(`✍️ Creados ${authors.length} autores`);
      this.logger.log(`🏢 Creadas ${publishers.length} editoriales`);
      this.logger.log(`📖 Creados ${genres.length} géneros`);
    } catch (error) {
      // Si hay error, rollback de la transacción
      await queryRunner.rollbackTransaction();
      this.logger.error('Error al crear datos del catálogo (rollback realizado):', error);
      throw error;
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }
}
