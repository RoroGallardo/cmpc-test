import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book, CreateBookDto, UpdateBookDto, FilterBookDto, Author, Publisher, Genre } from '@cmpc-test/shared';

describe('BooksService', () => {
  let service: BooksService;
  let bookRepository: Repository<Book>;
  let authorRepository: Repository<Author>;
  let publisherRepository: Repository<Publisher>;
  let genreRepository: Repository<Genre>;
  let dataSource: DataSource;

  const mockAuthor: Author = {
    id: 'author-123',
    name: 'J.K. Rowling',
    biography: 'Famous British author',
    birthYear: 1965,
    books: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPublisher: Publisher = {
    id: 'publisher-123',
    name: 'Bloomsbury',
    country: 'United Kingdom',
    website: 'https://bloomsbury.com',
    books: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockGenre: Genre = {
    id: 'genre-123',
    name: 'Fantasy',
    description: 'Fantasy books',
    books: [],
    createdAt: new Date(),
    updatedAt: new Date(),    
    deletedAt: null,
  };

  const mockBook: Book = {
    id: 'book-123',
    title: 'Harry Potter',
    price: 29.99,
    available: true,
    imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
    authorId: 'author-123',
    publisherId: 'publisher-123',
    genreId: 'genre-123',
    author: mockAuthor,
    publisher: mockPublisher,
    genre: mockGenre,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockBookRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAuthorRepository = {
    findOne: jest.fn(),
  };

  const mockPublisherRepository = {
    findOne: jest.fn(),
  };

  const mockGenreRepository = {
    findOne: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockBookRepository,
        },
        {
          provide: getRepositoryToken(Author),
          useValue: mockAuthorRepository,
        },
        {
          provide: getRepositoryToken(Publisher),
          useValue: mockPublisherRepository,
        },
        {
          provide: getRepositoryToken(Genre),
          useValue: mockGenreRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    bookRepository = module.get<Repository<Book>>(getRepositoryToken(Book));
    authorRepository = module.get<Repository<Author>>(getRepositoryToken(Author));
    publisherRepository = module.get<Repository<Publisher>>(getRepositoryToken(Publisher));
    genreRepository = module.get<Repository<Genre>>(getRepositoryToken(Genre));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createBookDto: CreateBookDto = {
      title: 'Harry Potter',
      price: 29.99,
      available: true,
      imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      authorId: 'author-123',
      publisherId: 'publisher-123',
      genreId: 'genre-123',
    };

    it('debería crear un libro exitosamente', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockAuthor)
        .mockResolvedValueOnce(mockPublisher)
        .mockResolvedValueOnce(mockGenre);
      mockQueryRunner.manager.create.mockReturnValue(mockBook);
      mockQueryRunner.manager.save.mockResolvedValue(mockBook);
      mockBookRepository.findOne.mockResolvedValue(mockBook);

      const result = await service.create(createBookDto);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(mockBook);
    });

    it('debería lanzar BadRequestException si el autor no existe', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockPublisher)
        .mockResolvedValueOnce(mockGenre);

      await expect(service.create(createBookDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createBookDto)).rejects.toThrow(
        `Autor con ID ${createBookDto.authorId} no encontrado`
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si la editorial no existe', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockAuthor)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockGenre);

      await expect(service.create(createBookDto)).rejects.toThrow(
        `Editorial con ID ${createBookDto.publisherId} no encontrada`
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el género no existe', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockAuthor)
        .mockResolvedValueOnce(mockPublisher)
        .mockResolvedValueOnce(null);

      await expect(service.create(createBookDto)).rejects.toThrow(
        `Género con ID ${createBookDto.genreId} no encontrado`
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debería retornar libros paginados', async () => {
      const filterDto: FilterBookDto = { page: 1, limit: 10 };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockBook], 1]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(filterDto);

      expect(result).toEqual({
        data: [mockBook],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('debería aplicar filtros de búsqueda', async () => {
      const filterDto: FilterBookDto = { 
        search: 'Harry',
        genreId: 'genre-123',
        page: 1,
        limit: 10,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockBook], 1]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(book.title ILIKE :search OR author.name ILIKE :search)',
        { search: '%Harry%' }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'book.genreId = :genreId',
        { genreId: 'genre-123' }
      );
    });

    it('debería filtrar por autor', async () => {
      const filterDto: FilterBookDto = { 
        authorId: 'author-123',
        page: 1,
        limit: 10,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockBook], 1]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'book.authorId = :authorId',
        { authorId: 'author-123' }
      );
    });

    it('debería filtrar por editorial', async () => {
      const filterDto: FilterBookDto = { 
        publisherId: 'publisher-123',
        page: 1,
        limit: 10,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockBook], 1]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'book.publisherId = :publisherId',
        { publisherId: 'publisher-123' }
      );
    });

    it('debería filtrar por disponibilidad (true)', async () => {
      const filterDto: FilterBookDto = { 
        available: true,
        page: 1,
        limit: 10,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockBook], 1]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'book.available = :available',
        { available: true }
      );
    });

    it('debería filtrar por disponibilidad (false)', async () => {
      const filterDto: FilterBookDto = { 
        available: false,
        page: 1,
        limit: 10,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockBook], 1]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'book.available = :available',
        { available: false }
      );
    });

    it('debería aplicar ordenamiento personalizado', async () => {
      const filterDto: FilterBookDto = { 
        sortBy: 'title',
        sortOrder: 'ASC',
        page: 1,
        limit: 10,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockBook], 1]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll(filterDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('book.title', 'ASC');
    });

    it('debería calcular correctamente la paginación', async () => {
      const filterDto: FilterBookDto = { 
        page: 2,
        limit: 5,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockBook], 15]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(filterDto);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(result.meta).toEqual({
        total: 15,
        page: 2,
        limit: 5,
        totalPages: 3,
      });
    });
  });

  describe('findOne', () => {
    it('debería encontrar un libro por ID', async () => {
      mockBookRepository.findOne.mockResolvedValue(mockBook);

      const result = await service.findOne('book-123');

      expect(mockBookRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'book-123' },
        relations: ['author', 'publisher', 'genre'],
      });
      expect(result).toEqual(mockBook);
    });

    it('debería lanzar NotFoundException si el libro no existe', async () => {
      mockBookRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        'Libro con ID nonexistent-id no encontrado'
      );
    });
  });

  describe('update', () => {
    const updateBookDto: UpdateBookDto = {
      title: 'Updated Title',
      price: 39.99,
    };

    it('debería actualizar un libro exitosamente', async () => {
      const updatedBook = { ...mockBook, ...updateBookDto };
      mockQueryRunner.manager.findOne.mockResolvedValue(mockBook);
      mockQueryRunner.manager.save.mockResolvedValue(updatedBook);
      mockBookRepository.findOne.mockResolvedValue(updatedBook);

      const result = await service.update('book-123', updateBookDto);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(updatedBook);
    });

    it('debería lanzar NotFoundException si el libro no existe', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', updateBookDto)).rejects.toThrow(NotFoundException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('debería actualizar un libro con nuevo autor', async () => {
      const updateWithAuthor: UpdateBookDto = {
        title: 'Updated Title',
        authorId: 'new-author-123',
      };
      const newAuthor = { ...mockAuthor, id: 'new-author-123', name: 'New Author' };
      const updatedBook = { ...mockBook, ...updateWithAuthor, author: newAuthor };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockBook) // Buscar libro
        .mockResolvedValueOnce(newAuthor); // Buscar nuevo autor
      mockQueryRunner.manager.save.mockResolvedValue(updatedBook);
      mockBookRepository.findOne.mockResolvedValue(updatedBook);

      const result = await service.update('book-123', updateWithAuthor);

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(updatedBook);
    });

    it('debería actualizar un libro con nueva editorial', async () => {
      const updateWithPublisher: UpdateBookDto = {
        publisherId: 'new-publisher-123',
      };
      const newPublisher = { ...mockPublisher, id: 'new-publisher-123' };
      const updatedBook = { ...mockBook, ...updateWithPublisher, publisher: newPublisher };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockBook) // Buscar libro
        .mockResolvedValueOnce(newPublisher); // Buscar nueva editorial
      mockQueryRunner.manager.save.mockResolvedValue(updatedBook);
      mockBookRepository.findOne.mockResolvedValue(updatedBook);

      const result = await service.update('book-123', updateWithPublisher);

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(updatedBook);
    });

    it('debería actualizar un libro con nuevo género', async () => {
      const updateWithGenre: UpdateBookDto = {
        genreId: 'new-genre-123',
      };
      const newGenre = { ...mockGenre, id: 'new-genre-123' };
      const updatedBook = { ...mockBook, ...updateWithGenre, genre: newGenre };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockBook) // Buscar libro
        .mockResolvedValueOnce(newGenre); // Buscar nuevo género
      mockQueryRunner.manager.save.mockResolvedValue(updatedBook);
      mockBookRepository.findOne.mockResolvedValue(updatedBook);

      const result = await service.update('book-123', updateWithGenre);

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(updatedBook);
    });

    it('debería lanzar BadRequestException si el nuevo autor no existe', async () => {
      const updateWithAuthor: UpdateBookDto = {
        authorId: 'nonexistent-author',
      };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockBook) // Buscar libro
        .mockResolvedValueOnce(null); // Autor no encontrado

      await expect(service.update('book-123', updateWithAuthor)).rejects.toThrow(
        `Autor con ID ${updateWithAuthor.authorId} no encontrado`
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si la nueva editorial no existe', async () => {
      const updateWithPublisher: UpdateBookDto = {
        publisherId: 'nonexistent-publisher',
      };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockBook) // Buscar libro
        .mockResolvedValueOnce(null); // Editorial no encontrada

      await expect(service.update('book-123', updateWithPublisher)).rejects.toThrow(
        `Editorial con ID ${updateWithPublisher.publisherId} no encontrada`
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el nuevo género no existe', async () => {
      const updateWithGenre: UpdateBookDto = {
        genreId: 'nonexistent-genre',
      };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockBook) // Buscar libro
        .mockResolvedValueOnce(null); // Género no encontrado

      await expect(service.update('book-123', updateWithGenre)).rejects.toThrow(
        `Género con ID ${updateWithGenre.genreId} no encontrado`
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debería eliminar un libro (soft delete)', async () => {
      mockBookRepository.findOne.mockResolvedValue(mockBook);
      mockBookRepository.softDelete.mockResolvedValue({ affected: 1, raw: {} });

      await service.remove('book-123');

      expect(mockBookRepository.softDelete).toHaveBeenCalledWith('book-123');
    });

    it('debería lanzar NotFoundException si el libro no existe', async () => {
      mockBookRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportToCSV', () => {
    it('debería exportar libros a CSV', async () => {
      const filterDto: FilterBookDto = {};
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBook]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.exportToCSV(filterDto);

      expect(result).toContain('ID');
      expect(result).toContain('Título');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('debería exportar libros con filtro de búsqueda', async () => {
      const filterDto: FilterBookDto = { search: 'Harry' };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBook]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.exportToCSV(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(book.title ILIKE :search OR author.name ILIKE :search)',
        { search: '%Harry%' }
      );
    });

    it('debería exportar libros con filtro de género', async () => {
      const filterDto: FilterBookDto = { genreId: 'genre-123' };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBook]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.exportToCSV(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'book.genreId = :genreId',
        { genreId: 'genre-123' }
      );
    });

    it('debería exportar libros con filtro de autor', async () => {
      const filterDto: FilterBookDto = { authorId: 'author-123' };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBook]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.exportToCSV(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'book.authorId = :authorId',
        { authorId: 'author-123' }
      );
    });

    it('debería exportar libros con filtro de editorial', async () => {
      const filterDto: FilterBookDto = { publisherId: 'publisher-123' };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBook]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.exportToCSV(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'book.publisherId = :publisherId',
        { publisherId: 'publisher-123' }
      );
    });

    it('debería exportar libros con filtro de disponibilidad', async () => {
      const filterDto: FilterBookDto = { available: true };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBook]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.exportToCSV(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'book.available = :available',
        { available: true }
      );
    });

    it('debería aplicar ordenamiento personalizado en exportación', async () => {
      const filterDto: FilterBookDto = { sortBy: 'title', sortOrder: 'ASC' };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBook]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.exportToCSV(filterDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('book.title', 'ASC');
    });

    it('debería manejar libros sin relaciones en exportación', async () => {
      const bookWithoutRelations = {
        ...mockBook,
        author: null,
        publisher: null,
        genre: null,
        imageBase64: null,
      };
      const filterDto: FilterBookDto = {};
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([bookWithoutRelations]),
      };

      mockBookRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.exportToCSV(filterDto);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
