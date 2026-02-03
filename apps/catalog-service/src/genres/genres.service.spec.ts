import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GenresService } from './genres.service';
import { Genre, CreateGenreDto, UpdateGenreDto } from '@cmpc-test/shared';

describe('GenresService', () => {
  let service: GenresService;
  let repository: Repository<Genre>;

  const mockGenre: Genre = {
    id: 'genre-123',
    name: 'Fantasy',
    description: 'Fantasy and magical worlds',
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
        GenresService,
        {
          provide: getRepositoryToken(Genre),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
    repository = module.get<Repository<Genre>>(getRepositoryToken(Genre));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un género exitosamente', async () => {
      const createGenreDto: CreateGenreDto = {
        name: 'Fantasy',
        description: 'Fantasy and magical worlds',
      };

      mockRepository.create.mockReturnValue(mockGenre);
      mockRepository.save.mockResolvedValue(mockGenre);

      const result = await service.create(createGenreDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createGenreDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockGenre);
      expect(result).toEqual(mockGenre);
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los géneros', async () => {
      const genres = [
        mockGenre,
        { ...mockGenre, id: 'genre-456', name: 'Science Fiction' },
      ];
      mockRepository.find.mockResolvedValue(genres);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(genres);
    });

    it('debería retornar un array vacío si no hay géneros', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debería encontrar un género por ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockGenre);

      const result = await service.findOne('genre-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'genre-123' },
      });
      expect(result).toEqual(mockGenre);
    });

    it('debería lanzar NotFoundException si el género no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        'Género con ID nonexistent-id no encontrado'
      );
    });
  });

  describe('update', () => {
    it('debería actualizar un género exitosamente', async () => {
      const updateGenreDto: UpdateGenreDto = {
        name: 'Fantasy (Updated)',
        description: 'Updated description',
      };

      const updatedGenre = { ...mockGenre, ...updateGenreDto };
      mockRepository.findOne.mockResolvedValueOnce(mockGenre).mockResolvedValueOnce(updatedGenre);
      mockRepository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      const result = await service.update('genre-123', updateGenreDto);

      expect(mockRepository.update).toHaveBeenCalledWith('genre-123', updateGenreDto);
      expect(result).toEqual(updatedGenre);
    });

    it('debería lanzar NotFoundException si el género no existe', async () => {
      const updateGenreDto: UpdateGenreDto = {
        name: 'Updated Name',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', updateGenreDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería eliminar un género (soft delete)', async () => {
      mockRepository.findOne.mockResolvedValue(mockGenre);
      mockRepository.softRemove.mockResolvedValue(mockGenre);

      await service.remove('genre-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'genre-123' },
      });
      expect(mockRepository.softRemove).toHaveBeenCalledWith(mockGenre);
    });

    it('debería lanzar NotFoundException si el género no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportToCSV', () => {
    it('debería exportar géneros a CSV', async () => {
      const genres = [mockGenre];
      mockRepository.find.mockResolvedValue(genres);

      const result = await service.exportToCSV();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toContain('Fantasy');
      expect(result).toContain('ID');
      expect(result).toContain('Nombre');
    });

    it('debería manejar géneros sin descripción', async () => {
      const minimalGenre = {
        ...mockGenre,
        description: null,
      };
      mockRepository.find.mockResolvedValue([minimalGenre]);

      const result = await service.exportToCSV();

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
