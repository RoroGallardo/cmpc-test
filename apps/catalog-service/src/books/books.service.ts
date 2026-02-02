import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Book, CreateBookDto, UpdateBookDto, FilterBookDto, Author, Publisher, Genre } from '@cmpc-test/shared';
import { Parser } from 'json2csv';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar que existan las relaciones dentro de la transacción
      const [author, publisher, genre] = await Promise.all([
        queryRunner.manager.findOne(Author, { where: { id: createBookDto.authorId } }),
        queryRunner.manager.findOne(Publisher, { where: { id: createBookDto.publisherId } }),
        queryRunner.manager.findOne(Genre, { where: { id: createBookDto.genreId } }),
      ]);

      if (!author) {
        throw new BadRequestException(`Autor con ID ${createBookDto.authorId} no encontrado`);
      }
      if (!publisher) {
        throw new BadRequestException(`Editorial con ID ${createBookDto.publisherId} no encontrada`);
      }
      if (!genre) {
        throw new BadRequestException(`Género con ID ${createBookDto.genreId} no encontrado`);
      }

      // Crear el libro dentro de la transacción
      const book = queryRunner.manager.create(Book, createBookDto);
      const savedBook = await queryRunner.manager.save(book);

      await queryRunner.commitTransaction();
      
      // Retornar el libro con sus relaciones cargadas
      return await this.bookRepository.findOne({
        where: { id: savedBook.id },
        relations: ['author', 'publisher', 'genre'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filterDto: FilterBookDto) {
    const { 
      search, 
      genreId, 
      authorId, 
      publisherId, 
      available, 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC'
    } = filterDto;

    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.author', 'author')
      .leftJoinAndSelect('book.publisher', 'publisher')
      .leftJoinAndSelect('book.genre', 'genre');

    // Filtros
    if (search) {
      queryBuilder.andWhere(
        '(book.title ILIKE :search OR author.name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (genreId) {
      queryBuilder.andWhere('book.genreId = :genreId', { genreId });
    }

    if (authorId) {
      queryBuilder.andWhere('book.authorId = :authorId', { authorId });
    }

    if (publisherId) {
      queryBuilder.andWhere('book.publisherId = :publisherId', { publisherId });
    }

    if (available !== undefined) {
      queryBuilder.andWhere('book.available = :available', { available });
    }

    // Ordenamiento
    queryBuilder.orderBy(`book.${sortBy}`, sortOrder);

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['author', 'publisher', 'genre'],
    });

    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar el libro dentro de la transacción
      const book = await queryRunner.manager.findOne(Book, {
        where: { id },
        relations: ['author', 'publisher', 'genre'],
      });

      if (!book) {
        throw new NotFoundException(`Libro con ID ${id} no encontrado`);
      }

      // Validar relaciones si se están actualizando
      if (updateBookDto.authorId || updateBookDto.publisherId || updateBookDto.genreId) {
        const [author, publisher, genre] = await Promise.all([
          updateBookDto.authorId 
            ? queryRunner.manager.findOne(Author, { where: { id: updateBookDto.authorId } })
            : Promise.resolve(book.author),
          updateBookDto.publisherId 
            ? queryRunner.manager.findOne(Publisher, { where: { id: updateBookDto.publisherId } })
            : Promise.resolve(book.publisher),
          updateBookDto.genreId 
            ? queryRunner.manager.findOne(Genre, { where: { id: updateBookDto.genreId } })
            : Promise.resolve(book.genre),
        ]);

        if (!author) {
          throw new BadRequestException(`Autor con ID ${updateBookDto.authorId} no encontrado`);
        }
        if (!publisher) {
          throw new BadRequestException(`Editorial con ID ${updateBookDto.publisherId} no encontrada`);
        }
        if (!genre) {
          throw new BadRequestException(`Género con ID ${updateBookDto.genreId} no encontrado`);
        }
      }

      // Actualizar el libro dentro de la transacción
      Object.assign(book, updateBookDto);
      const updatedBook = await queryRunner.manager.save(book);

      await queryRunner.commitTransaction();

      // Retornar el libro actualizado con sus relaciones cargadas
      return await this.bookRepository.findOne({
        where: { id: updatedBook.id },
        relations: ['author', 'publisher', 'genre'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.bookRepository.softDelete(id);
  }

  async exportToCSV(filterDto: FilterBookDto): Promise<string> {
    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.author', 'author')
      .leftJoinAndSelect('book.publisher', 'publisher')
      .leftJoinAndSelect('book.genre', 'genre');

    // Aplicar los mismos filtros que findAll
    const { search, genreId, authorId, publisherId, available, sortBy = 'createdAt', sortOrder = 'DESC' } = filterDto;

    if (search) {
      queryBuilder.andWhere(
        '(book.title ILIKE :search OR author.name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (genreId) {
      queryBuilder.andWhere('book.genreId = :genreId', { genreId });
    }

    if (authorId) {
      queryBuilder.andWhere('book.authorId = :authorId', { authorId });
    }

    if (publisherId) {
      queryBuilder.andWhere('book.publisherId = :publisherId', { publisherId });
    }

    if (available !== undefined) {
      queryBuilder.andWhere('book.available = :available', { available });
    }

    queryBuilder.orderBy(`book.${sortBy}`, sortOrder);

    const books = await queryBuilder.getMany();

    // Transformar datos para CSV
    const data = books.map(book => ({
      ID: book.id,
      Título: book.title,
      Precio: book.price,
      Autor: book.author?.name || '',
      Editorial: book.publisher?.name || '',
      Género: book.genre?.name || '',
      Disponible: book.available ? 'Sí' : 'No',
      'URL Imagen': book.imageUrl || '',
      'Fecha Creación': book.createdAt?.toISOString().split('T')[0] || '',
    }));

    const parser = new Parser();
    return parser.parse(data);
  }

  private async validateRelations(
    authorId: string,
    publisherId: string,
    genreId: string,
  ): Promise<void> {
    const [author, publisher, genre] = await Promise.all([
      this.authorRepository.findOne({ where: { id: authorId } }),
      this.publisherRepository.findOne({ where: { id: publisherId } }),
      this.genreRepository.findOne({ where: { id: genreId } }),
    ]);

    if (!author) {
      throw new BadRequestException(`Autor con ID ${authorId} no encontrado`);
    }
    if (!publisher) {
      throw new BadRequestException(`Editorial con ID ${publisherId} no encontrada`);
    }
    if (!genre) {
      throw new BadRequestException(`Género con ID ${genreId} no encontrado`);
    }
  }
}
