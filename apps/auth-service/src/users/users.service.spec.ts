import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, RegisterDto, UserRole } from '@cmpc-test/shared';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let dataSource: DataSource;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
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

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'hashed_password',
      name: 'Test User',
    };

    it('debería crear un usuario exitosamente', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.create.mockReturnValue(mockUser);
      mockQueryRunner.manager.save.mockResolvedValue(mockUser);

      const result = await service.create(registerDto);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.findOne).toHaveBeenCalledWith(User, {
        where: { email: registerDto.email },
      });
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(User, registerDto);
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(mockUser);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(mockUser);

      await expect(service.create(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.create(registerDto)).rejects.toThrow('El email ya está registrado');
      
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('debería hacer rollback en caso de error', async () => {
      const error = new Error('Database error');
      mockQueryRunner.manager.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.create.mockReturnValue(mockUser);
      mockQueryRunner.manager.save.mockRejectedValue(error);

      await expect(service.create(registerDto)).rejects.toThrow(error);
      
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('debería encontrar un usuario por email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('debería retornar null si el usuario no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('debería encontrar un usuario por ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual(mockUser);
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findById('nonexistent-id')).rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los usuarios', async () => {
      const users = [mockUser, { ...mockUser, id: 'user-456', email: 'test2@example.com' }];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt'],
      });
      expect(result).toEqual(users);
    });
  });
});
