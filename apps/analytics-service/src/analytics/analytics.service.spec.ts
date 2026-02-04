import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from './analytics.service';
import {
  BookAnalytics,
  Sale,
  SaleItem,
  Inventory,
  StockMovement,
  Book,
  SaleStatus,
} from '@cmpc-test/shared';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let analyticsRepo: Repository<BookAnalytics>;
  let saleRepo: Repository<Sale>;
  let saleItemRepo: Repository<SaleItem>;
  let inventoryRepo: Repository<Inventory>;
  let movementRepo: Repository<StockMovement>;
  let bookRepo: Repository<Book>;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockSaleRepo = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockSaleItemRepo = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockInventoryRepo = {
    find: jest.fn(),
  };

  const mockMovementRepo = {
    find: jest.fn(),
  };

  const mockBookRepo = {
    find: jest.fn(),
  };

  const mockAnalyticsRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(BookAnalytics),
          useValue: mockAnalyticsRepo,
        },
        {
          provide: getRepositoryToken(Sale),
          useValue: mockSaleRepo,
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
          useValue: mockMovementRepo,
        },
        {
          provide: getRepositoryToken(Book),
          useValue: mockBookRepo,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    analyticsRepo = module.get(getRepositoryToken(BookAnalytics));
    saleRepo = module.get(getRepositoryToken(Sale));
    saleItemRepo = module.get(getRepositoryToken(SaleItem));
    inventoryRepo = module.get(getRepositoryToken(Inventory));
    movementRepo = module.get(getRepositoryToken(StockMovement));
    bookRepo = module.get(getRepositoryToken(Book));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', async () => {
      const mockSales = [
        {
          id: '1',
          total: 100,
          status: SaleStatus.COMPLETED,
          items: [{ quantity: 2 }],
        },
      ];

      const mockInventories = [
        {
          bookId: '1',
          currentStock: 50,
          minStock: 10,
          book: { price: 25 },
        },
      ];

      mockSaleRepo.find.mockResolvedValue(mockSales);
      mockInventoryRepo.find.mockResolvedValue(mockInventories);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          bookId: '1',
          bookTitle: 'Test Book',
          unitsSold: '10',
          revenue: '250',
        },
      ]);

      const result = await service.getDashboardMetrics();

      expect(result).toBeDefined();
      expect(result.today).toBeDefined();
      expect(result.thisWeek).toBeDefined();
      expect(result.thisMonth).toBeDefined();
      expect(result.inventory).toBeDefined();
      expect(result.topSelling).toBeDefined();
      expect(result.recentSales).toBeDefined();
    });
  });

  describe('getSalesAnalytics', () => {
    it('should return sales analytics for a period', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const mockSales = [
        {
          id: '1',
          total: 150,
          status: SaleStatus.COMPLETED,
          items: [{ quantity: 3 }],
        },
      ];

      mockSaleRepo.find.mockResolvedValue(mockSales);
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { date: '2026-01-15', sales: '5', revenue: '500' },
        ])
        .mockResolvedValueOnce([
          { category: 'Fiction', sales: '10', revenue: '300' },
        ])
        .mockResolvedValueOnce([
          { author: 'Author 1', sales: '8', revenue: '250' },
        ])
        .mockResolvedValueOnce([
          {
            bookId: '1',
            bookTitle: 'Book 1',
            unitsSold: '10',
            revenue: '300',
          },
        ]);

      const result = await service.getSalesAnalytics(startDate, endDate);

      expect(result).toBeDefined();
      expect(result.totalSales).toBeGreaterThanOrEqual(0);
      expect(result.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(result.salesByDay).toBeDefined();
      expect(result.salesByCategory).toBeDefined();
      expect(result.salesByAuthor).toBeDefined();
      expect(result.topProducts).toBeDefined();
    });
  });

  describe('getInventoryMetrics', () => {
    it('should return inventory metrics', async () => {
      const mockInventories = [
        {
          bookId: '1',
          currentStock: 5,
          minStock: 10,
          maxStock: 100,
          book: { id: '1', title: 'Test Book', price: 25 },
        },
        {
          bookId: '2',
          currentStock: 200,
          minStock: 20,
          maxStock: 100,
          book: { id: '2', title: 'Book 2', price: 30 },
        },
      ];

      const mockBooks = [
        { id: '1', title: 'Test Book', price: 25 },
        { id: '2', title: 'Book 2', price: 30 },
      ];

      const mockAnalytics = [
        { rotationRate: 4.5 },
        { rotationRate: 2.0 },
      ];

      const mockMovements = [
        { type: 'PURCHASE' },
        { type: 'SALE' },
        { type: 'SALE' },
      ];

      mockInventoryRepo.find.mockResolvedValue(mockInventories);
      mockBookRepo.find.mockResolvedValue(mockBooks);
      mockAnalyticsRepo.find.mockResolvedValue(mockAnalytics);
      mockMovementRepo.find.mockResolvedValue(mockMovements);

      const result = await service.getInventoryMetrics();

      expect(result).toBeDefined();
      expect(result.totalValue).toBeGreaterThan(0);
      expect(result.totalUnits).toBeGreaterThan(0);
      expect(result.averageRotationRate).toBeGreaterThan(0);
      expect(result.lowStockItems).toBeDefined();
      expect(result.lowStockItems.length).toBe(1);
      expect(result.overStockItems).toBeDefined();
      expect(result.stockMovementsSummary).toBeDefined();
    });
  });
});
