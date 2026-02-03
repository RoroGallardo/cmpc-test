import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { Author, CreateAuthorDto, UpdateAuthorDto } from '@cmpc-test/shared';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let repository: Repository<Author>;

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

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: getRepositoryToken(Author),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    repository = module.get<Repository<Author>>(getRepositoryToken(Author));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un autor exitosamente', async () => {
      const createAuthorDto: CreateAuthorDto = {
        name: 'J.K. Rowling',
        biography: 'Famous British author',
        birthYear: 1965,
      };

      mockRepository.create.mockReturnValue(mockAuthor);
      mockRepository.save.mockResolvedValue(mockAuthor);

      const result = await service.create(createAuthorDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createAuthorDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockAuthor);
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los autores', async () => {
      const authors = [
        mockAuthor,
        { ...mockAuthor, id: 'author-456', name: 'George R.R. Martin' },
      ];
      mockRepository.find.mockResolvedValue(authors);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(authors);
    });

    it('debería retornar un array vacío si no hay autores', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debería encontrar un autor por ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockAuthor);

      const result = await service.findOne('author-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'author-123' },
      });
      expect(result).toEqual(mockAuthor);
    });

    it('debería lanzar NotFoundException si el autor no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        'Autor con ID nonexistent-id no encontrado'
      );
    });
  });

  describe('update', () => {
    it('debería actualizar un autor exitosamente', async () => {
      const updateAuthorDto: UpdateAuthorDto = {
        name: 'J.K. Rowling (Updated)',
        biography: 'Updated biography',
      };

      const updatedAuthor = { ...mockAuthor, ...updateAuthorDto };
      mockRepository.findOne.mockResolvedValueOnce(mockAuthor).mockResolvedValueOnce(updatedAuthor);
      mockRepository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      const result = await service.update('author-123', updateAuthorDto);

      expect(mockRepository.update).toHaveBeenCalledWith('author-123', updateAuthorDto);
      expect(result).toEqual(updatedAuthor);
    });

    it('debería lanzar NotFoundException si el autor no existe', async () => {
      const updateAuthorDto: UpdateAuthorDto = {
        name: 'Updated Name',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', updateAuthorDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería eliminar un autor (soft delete)', async () => {
      mockRepository.findOne.mockResolvedValue(mockAuthor);
      mockRepository.softRemove.mockResolvedValue(mockAuthor);

      await service.remove('author-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'author-123' },
      });
      expect(mockRepository.softRemove).toHaveBeenCalledWith(mockAuthor);
    });

    it('debería lanzar NotFoundException si el autor no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportToCSV', () => {
    it('debería exportar autores a CSV', async () => {
      const authors = [mockAuthor];
      mockRepository.find.mockResolvedValue(authors);

      const result = await service.exportToCSV();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toContain('J.K. Rowling');
      expect(result).toContain('ID');
      expect(result).toContain('Nombre');
    });

    it('debería manejar autores sin datos opcionales', async () => {
      const minimalAuthor = {
        ...mockAuthor,
        biography: null,
        birthYear: null,
      };
      mockRepository.find.mockResolvedValue([minimalAuthor]);

      const result = await service.exportToCSV();

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
