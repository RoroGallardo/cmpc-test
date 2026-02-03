import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PublishersService } from './publishers.service';
import { Publisher, CreatePublisherDto, UpdatePublisherDto } from '@cmpc-test/shared';

describe('PublishersService', () => {
  let service: PublishersService;
  let repository: Repository<Publisher>;

  const mockPublisher: Publisher = {
    id: 'publisher-123',
    name: 'Bloomsbury',
    website: 'https://bloomsbury.com',
    country: 'United Kingdom',
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
        PublishersService,
        {
          provide: getRepositoryToken(Publisher),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PublishersService>(PublishersService);
    repository = module.get<Repository<Publisher>>(getRepositoryToken(Publisher));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una editorial exitosamente', async () => {
      const createPublisherDto: CreatePublisherDto = {
        name: 'Bloomsbury',
        website: 'https://bloomsbury.com',
        country: 'United Kingdom',
      };

      mockRepository.create.mockReturnValue(mockPublisher);
      mockRepository.save.mockResolvedValue(mockPublisher);

      const result = await service.create(createPublisherDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createPublisherDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockPublisher);
      expect(result).toEqual(mockPublisher);
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las editoriales', async () => {
      const publishers = [
        mockPublisher,
        { ...mockPublisher, id: 'publisher-456', name: 'Penguin Random House' },
      ];
      mockRepository.find.mockResolvedValue(publishers);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(publishers);
    });

    it('debería retornar un array vacío si no hay editoriales', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debería encontrar una editorial por ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockPublisher);

      const result = await service.findOne('publisher-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'publisher-123' },
      });
      expect(result).toEqual(mockPublisher);
    });

    it('debería lanzar NotFoundException si la editorial no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        'Editorial con ID nonexistent-id no encontrado'
      );
    });
  });

  describe('update', () => {
    it('debería actualizar una editorial exitosamente', async () => {
      const updatePublisherDto: UpdatePublisherDto = {
        name: 'Bloomsbury Publishing',
        website: 'https://www.bloomsbury.com',
      };

      const updatedPublisher = { ...mockPublisher, ...updatePublisherDto };
      mockRepository.findOne.mockResolvedValueOnce(mockPublisher).mockResolvedValueOnce(updatedPublisher);
      mockRepository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      const result = await service.update('publisher-123', updatePublisherDto);

      expect(mockRepository.update).toHaveBeenCalledWith('publisher-123', updatePublisherDto);
      expect(result).toEqual(updatedPublisher);
    });

    it('debería lanzar NotFoundException si la editorial no existe', async () => {
      const updatePublisherDto: UpdatePublisherDto = {
        name: 'Updated Name',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', updatePublisherDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería eliminar una editorial (soft delete)', async () => {
      mockRepository.findOne.mockResolvedValue(mockPublisher);
      mockRepository.softRemove.mockResolvedValue(mockPublisher);

      await service.remove('publisher-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'publisher-123' },
      });
      expect(mockRepository.softRemove).toHaveBeenCalledWith(mockPublisher);
    });

    it('debería lanzar NotFoundException si la editorial no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportToCSV', () => {
    it('debería exportar editoriales a CSV', async () => {
      const publishers = [mockPublisher];
      mockRepository.find.mockResolvedValue(publishers);

      const result = await service.exportToCSV();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toContain('Bloomsbury');
      expect(result).toContain('ID');
      expect(result).toContain('Nombre');
    });

    it('debería manejar editoriales sin datos opcionales', async () => {
      const minimalPublisher = {
        ...mockPublisher,
        country: null,
        website: null,
      };
      mockRepository.find.mockResolvedValue([minimalPublisher]);

      const result = await service.exportToCSV();

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
