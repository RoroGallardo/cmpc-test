import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PredictiveService } from './predictive.service';
import {
  BookAnalytics,
  Sale,
  SaleItem,
  Inventory,
  StockMovement,
  Book,
  SaleStatus,
} from '@cmpc-test/shared';

describe('PredictiveService', () => {
  let service: PredictiveService;
  let analyticsRepo: Repository<BookAnalytics>;
  let saleItemRepo: Repository<SaleItem>;
  let inventoryRepo: Repository<Inventory>;
  let bookRepo: Repository<Book>;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockAnalyticsRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSaleItemRepo = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockInventoryRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockBookRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictiveService,
        {
          provide: getRepositoryToken(BookAnalytics),
          useValue: mockAnalyticsRepo,
        },
        {
          provide: getRepositoryToken(Sale),
          useValue: {},
        },
        {
          provide: getRepositoryToken(SaleItem),
          useValue: mockSaleItemRepo,
        },
        {
          provide: getRepositoryToken(Inventory),
          useValue: mockInventoryRepo,
        },
        {
          provide: getRepositoryToken(StockMovement),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Book),
          useValue: mockBookRepo,
        },
      ],
    }).compile();

    service = module.get<PredictiveService>(PredictiveService);
    analyticsRepo = module.get(getRepositoryToken(BookAnalytics));
    saleItemRepo = module.get(getRepositoryToken(SaleItem));
    inventoryRepo = module.get(getRepositoryToken(Inventory));
    bookRepo = module.get(getRepositoryToken(Book));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('predictDemandForBook', () => {
    it('should predict demand for a book', async () => {
      const bookId = 'test-book-id';
      const mockBook = {
        id: bookId,
        title: 'Test Book',
        price: 25,
      };

      const mockInventory = {
        bookId,
        currentStock: 50,
        minStock: 10,
        maxStock: 100,
      };

      const mockAnalytics = {
        bookId,
        predicted30Days: 30,
      };

      const mockSalesHistory = [
        { date: '2026-01-01', quantity: '5' },
        { date: '2026-01-02', quantity: '3' },
        { date: '2026-01-03', quantity: '7' },
      ];

      mockBookRepo.findOne.mockResolvedValue(mockBook);
      mockInventoryRepo.findOne.mockResolvedValue(mockInventory);
      mockAnalyticsRepo.findOne.mockResolvedValue(mockAnalytics);
      mockQueryBuilder.getRawMany.mockResolvedValue(mockSalesHistory);

      const result = await service.predictDemandForBook(bookId);

      expect(result).toBeDefined();
      expect(result.bookId).toBe(bookId);
      expect(result.bookTitle).toBe('Test Book');
      expect(result.currentStock).toBe(50);
      expect(result.predicted7Days).toBeGreaterThanOrEqual(0);
      expect(result.predicted30Days).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(['increasing', 'stable', 'decreasing']).toContain(result.trend);
    });

    it('should throw error if book not found', async () => {
      mockBookRepo.findOne.mockResolvedValue(null);

      await expect(
        service.predictDemandForBook('non-existent-id'),
      ).rejects.toThrow('Book not found');
    });
  });

  describe('getRestockRecommendations', () => {
    it('should return restock recommendations', async () => {
      const mockInventories = [
        {
          bookId: 'book-1',
          currentStock: 5,
          minStock: 10,
          maxStock: 100,
          supplierPrice: 15,
          book: { id: 'book-1', title: 'Low Stock Book', price: 25 },
        },
      ];

      const mockBook = {
        id: 'book-1',
        title: 'Low Stock Book',
        price: 25,
      };

      const mockInventory = {
        bookId: 'book-1',
        currentStock: 5,
        minStock: 10,
        maxStock: 100,
      };

      const mockAnalytics = {
        bookId: 'book-1',
        predicted30Days: 30,
      };

      mockInventoryRepo.find.mockResolvedValue(mockInventories);
      mockBookRepo.findOne.mockResolvedValue(mockBook);
      mockInventoryRepo.findOne.mockResolvedValue(mockInventory);
      mockAnalyticsRepo.findOne.mockResolvedValue(mockAnalytics);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { date: '2026-01-01', quantity: '2' },
      ]);

      const result = await service.getRestockRecommendations();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('bookId');
        expect(result[0]).toHaveProperty('recommendedQuantity');
        expect(result[0]).toHaveProperty('urgency');
        expect(['low', 'medium', 'high', 'critical']).toContain(
          result[0].urgency,
        );
      }
    });
  });

  describe('updateBookAnalytics', () => {
    it('should update book analytics', async () => {
      const bookId = 'test-book-id';
      const mockBook = {
        id: bookId,
        title: 'Test Book',
        price: 25,
      };

      const mockInventory = {
        bookId,
        currentStock: 50,
        minStock: 10,
        maxStock: 100,
      };

      const mockAnalytics = {
        bookId,
        predictedDemand7Days: 0,
        predictedDemand30Days: 0,
      };

      mockBookRepo.findOne.mockResolvedValue(mockBook);
      mockInventoryRepo.findOne.mockResolvedValue(mockInventory);
      mockAnalyticsRepo.findOne.mockResolvedValue(mockAnalytics);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      mockAnalyticsRepo.save.mockResolvedValue(mockAnalytics);

      await service.updateBookAnalytics(bookId);

      expect(mockAnalyticsRepo.save).toHaveBeenCalled();
    });

    it('should create analytics if not exists', async () => {
      const bookId = 'test-book-id';
      const mockBook = {
        id: bookId,
        title: 'Test Book',
        price: 25,
      };

      const mockInventory = {
        bookId,
        currentStock: 50,
        minStock: 10,
        maxStock: 100,
      };

      const newAnalytics = {
        bookId,
        predictedDemand7Days: 0,
        predictedDemand30Days: 0,
      };

      mockBookRepo.findOne.mockResolvedValue(mockBook);
      mockInventoryRepo.findOne.mockResolvedValue(mockInventory);
      mockAnalyticsRepo.findOne.mockResolvedValue(null);
      mockAnalyticsRepo.create.mockReturnValue(newAnalytics);
      mockAnalyticsRepo.save.mockResolvedValue(newAnalytics);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.updateBookAnalytics(bookId);

      expect(mockAnalyticsRepo.create).toHaveBeenCalledWith({ bookId });
      expect(mockAnalyticsRepo.save).toHaveBeenCalled();
    });
  });
});
