import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy, JwtPayload } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  const mockPublicKey = '-----BEGIN PUBLIC KEY-----\ntest\n-----END PUBLIC KEY-----';
  
  const mockConfigService = {
    get: jest.fn().mockReturnValue(mockPublicKey),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue(mockPublicKey);
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('constructor', () => {
    it('debería lanzar error si JWT_PUBLIC_KEY no está definido', () => {
      mockConfigService.get.mockReturnValue(undefined);

      expect(() => {
        new JwtStrategy(configService);
      }).toThrow('JWT_PUBLIC_KEY is not defined in environment variables');
    });

    it('debería configurar correctamente con JWT_PUBLIC_KEY válida', () => {
      expect(strategy).toBeDefined();
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_PUBLIC_KEY');
    });
  });

  describe('validate', () => {
    it('debería retornar el usuario cuando el payload es válido', async () => {
      const payload: JwtPayload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        role: 'user',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user-id-123',
        email: 'test@example.com',
        role: 'user',
      });
    });

    it('debería lanzar UnauthorizedException si sub no está presente', async () => {
      const payload: JwtPayload = {
        sub: '',
        email: 'test@example.com',
        role: 'user',
      };

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('debería manejar diferentes roles correctamente', async () => {
      const adminPayload: JwtPayload = {
        sub: 'admin-id-456',
        email: 'admin@example.com',
        role: 'admin',
      };

      const result = await strategy.validate(adminPayload);

      expect(result).toEqual({
        userId: 'admin-id-456',
        email: 'admin@example.com',
        role: 'admin',
      });
    });
  });
});
