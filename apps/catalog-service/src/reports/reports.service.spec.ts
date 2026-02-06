import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportsService } from './reports.service';
import {
  BookAnalytics,
  Sale,
  SaleItem,
  Inventory,
  StockMovement,
  Book,
  Author,
  Genre,
  Publisher,
  AuditLog,
  SaleStatus,
} from '@cmpc-test/shared';

describe('ReportsService', () => {
  let service: ReportsService;
  let module: TestingModule;

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
    getMany: jest.fn(),
  };

  const mockSaleItemRepo = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockSaleRepo = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    find: jest.fn(),
  };

  const mockAnalyticsRepo = {
    find: jest.fn(),
  };

  const mockInventoryRepo = {
    find: jest.fn(),
  };

  const mockAuditRepo = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ReportsService,
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
          useValue: {},
        },
        {
          provide: getRepositoryToken(Book),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Author),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Genre),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Publisher),
          useValue: {},
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditRepo,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateABCAnalysis', () => {
    it('should generate ABC analysis report', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const mockSalesData = [
        { bookId: '1', title: 'Book 1', revenue: '500' },
        { bookId: '2', title: 'Book 2', revenue: '300' },
        { bookId: '3', title: 'Book 3', revenue: '100' },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockSalesData);

      const result = await service.generateABCAnalysis(startDate, endDate);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0].category).toBe('A');
      expect(result[1].category).toBe('B');
      expect(result[2].category).toBe('C');
      expect(result[0].books).toBeDefined();
      expect(result[0].summary).toBeDefined();
    });
  });

  describe('generateProfitabilityReport', () => {
    it('should generate profitability report', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const mockCategoryData = [
        { categoryName: 'Fiction', totalRevenue: '1000', unitsSold: '50' },
      ];

      const mockAuthorData = [
        { authorName: 'Author 1', totalRevenue: '800', booksSold: '5' },
      ];

      const mockPublisherData = [
        { publisherName: 'Publisher 1', totalRevenue: '1200', booksSold: '8' },
      ];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockCategoryData)
        .mockResolvedValueOnce(mockAuthorData)
        .mockResolvedValueOnce(mockPublisherData);

      const result = await service.generateProfitabilityReport(
        startDate,
        endDate,
      );

      expect(result).toBeDefined();
      expect(result.byCategory).toBeDefined();
      expect(result.byAuthor).toBeDefined();
      expect(result.byPublisher).toBeDefined();
      expect(result.overall).toBeDefined();
      expect(result.overall.totalRevenue).toBeGreaterThan(0);
      expect(result.overall.margin).toBeGreaterThan(0);
    });
  });

  describe('generateSeasonalityReport', () => {
    it('should generate seasonality report', async () => {
      const mockMonthlyData = [
        {
          month: '2026-01',
          year: '2026',
          sales: '100',
          revenue: '5000',
          averageOrderValue: '50',
        },
      ];

      const mockDayData = [
        { day: 'Monday   ', sales: '50', revenue: '2500' },
        { day: 'Friday   ', sales: '30', revenue: '1500' },
      ];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockMonthlyData)
        .mockResolvedValueOnce(mockDayData);

      const result = await service.generateSeasonalityReport();

      expect(result).toBeDefined();
      expect(result.monthly).toBeDefined();
      expect(result.dayOfWeek).toBeDefined();
      expect(result.trends).toBeDefined();
      expect(result.trends.bestMonth).toBeDefined();
      expect(result.trends.bestDayOfWeek).toBe('Monday');
    });
  });

  describe('generateStockRotationReport', () => {
    it('should generate stock rotation report', async () => {
      const mockAnalytics = [
        {
          bookId: '1',
          rotationRate: 5,
          daysToSell: 10,
          lastSaleDate: new Date(),
          book: { id: '1', title: 'Fast Book' },
        },
        {
          bookId: '2',
          rotationRate: 0.5,
          daysToSell: 200,
          lastSaleDate: new Date('2025-01-01'),
          book: { id: '2', title: 'Slow Book' },
        },
      ];

      const mockInventories = [
        { bookId: '1', currentStock: 20 },
        { bookId: '2', currentStock: 50 },
      ];

      const mockBooks = [
        { id: '1', title: 'Fast Book' },
        { id: '2', title: 'Slow Book' },
      ];

      mockAnalyticsRepo.find.mockResolvedValue(mockAnalytics);
      mockInventoryRepo.find.mockResolvedValue(mockInventories);
      
      // Mock bookRepo.find()
      const mockBookRepo = module.get(getRepositoryToken(Book));
      mockBookRepo.find.mockResolvedValue(mockBooks);

      const result = await service.generateStockRotationReport();

      expect(result).toBeDefined();
      expect(result.fastMoving).toBeDefined();
      expect(result.slowMoving).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.averageRotationRate).toBeGreaterThan(0);
    });
  });

  describe('generateAuditTrail', () => {
    it('should generate audit trail report', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const mockAudits = [
        {
          id: '1',
          createdAt: new Date(),
          user: { email: 'user@test.com', id: 'user-1' },
          userId: 'user-1',
          action: 'UPDATE',
          entityType: 'BOOK',
          entityId: 'book-1',
          changes: { price: { old: 20, new: 25 } },
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockAudits);

      const result = await service.generateAuditTrail(startDate, endDate);

      expect(result).toBeDefined();
      expect(result.changes).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.totalChanges).toBe(1);
      expect(result.summary.byAction).toBeDefined();
      expect(result.summary.byUser).toBeDefined();
      expect(result.summary.byEntity).toBeDefined();
    });

    it('should filter audit trail by entityId', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');
      const entityId = 'book-1';

      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.generateAuditTrail(startDate, endDate, entityId);

      expect(mockAuditRepo.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audit.entityId = :entityId',
        { entityId },
      );
    });
  });
});
