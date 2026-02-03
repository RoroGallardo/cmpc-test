import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertsService } from './alerts.service';
import {
  Alert,
  AlertType,
  AlertSeverity,
  AlertStatus,
  Inventory,
  BookAnalytics,
  Book,
  Sale,
} from '@cmpc-test/shared';

describe('AlertsService', () => {
  let service: AlertsService;
  let alertRepo: Repository<Alert>;
  let inventoryRepo: Repository<Inventory>;
  let analyticsRepo: Repository<BookAnalytics>;

  const mockAlertRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockInventoryRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockAnalyticsRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: getRepositoryToken(Alert),
          useValue: mockAlertRepo,
        },
        {
          provide: getRepositoryToken(Inventory),
          useValue: mockInventoryRepo,
        },
        {
          provide: getRepositoryToken(BookAnalytics),
          useValue: mockAnalyticsRepo,
        },
        {
          provide: getRepositoryToken(Book),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Sale),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    alertRepo = module.get(getRepositoryToken(Alert));
    inventoryRepo = module.get(getRepositoryToken(Inventory));
    analyticsRepo = module.get(getRepositoryToken(BookAnalytics));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getActiveAlerts', () => {
    it('should return active alerts', async () => {
      const mockAlerts = [
        {
          id: '1',
          type: AlertType.LOW_STOCK,
          severity: AlertSeverity.MEDIUM,
          status: AlertStatus.ACTIVE,
          message: 'Low stock alert',
        },
      ];

      mockAlertRepo.find.mockResolvedValue(mockAlerts);

      const result = await service.getActiveAlerts();

      expect(result).toEqual(mockAlerts);
      expect(mockAlertRepo.find).toHaveBeenCalledWith({
        where: { status: AlertStatus.ACTIVE },
        order: {
          severity: 'DESC',
          createdAt: 'DESC',
        },
        take: 50,
      });
    });

    it('should limit results', async () => {
      mockAlertRepo.find.mockResolvedValue([]);

      await service.getActiveAlerts(10);

      expect(mockAlertRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        }),
      );
    });
  });

  describe('getAlertsByType', () => {
    it('should return alerts by type', async () => {
      const mockAlerts = [
        {
          id: '1',
          type: AlertType.OUT_OF_STOCK,
          status: AlertStatus.ACTIVE,
        },
      ];

      mockAlertRepo.find.mockResolvedValue(mockAlerts);

      const result = await service.getAlertsByType(AlertType.OUT_OF_STOCK);

      expect(result).toEqual(mockAlerts);
      expect(mockAlertRepo.find).toHaveBeenCalledWith({
        where: { type: AlertType.OUT_OF_STOCK, status: AlertStatus.ACTIVE },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getAlertsBySeverity', () => {
    it('should return alerts by severity', async () => {
      const mockAlerts = [
        {
          id: '1',
          severity: AlertSeverity.CRITICAL,
          status: AlertStatus.ACTIVE,
        },
      ];

      mockAlertRepo.find.mockResolvedValue(mockAlerts);

      const result = await service.getAlertsBySeverity(AlertSeverity.CRITICAL);

      expect(result).toEqual(mockAlerts);
      expect(mockAlertRepo.find).toHaveBeenCalledWith({
        where: { severity: AlertSeverity.CRITICAL, status: AlertStatus.ACTIVE },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge an alert', async () => {
      const alertId = 'alert-1';
      const userId = 'user-1';
      const mockAlert = {
        id: alertId,
        status: AlertStatus.ACTIVE,
      };

      mockAlertRepo.findOne.mockResolvedValue(mockAlert);
      mockAlertRepo.save.mockResolvedValue({
        ...mockAlert,
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgedBy: userId,
      });

      const result = await service.acknowledgeAlert(alertId, userId);

      expect(result.status).toBe(AlertStatus.ACKNOWLEDGED);
      expect(result.acknowledgedBy).toBe(userId);
      expect(mockAlertRepo.save).toHaveBeenCalled();
    });

    it('should throw error if alert not found', async () => {
      mockAlertRepo.findOne.mockResolvedValue(null);

      await expect(
        service.acknowledgeAlert('non-existent', 'user-1'),
      ).rejects.toThrow('Alert not found');
    });
  });

  describe('resolveAlert', () => {
    it('should resolve an alert', async () => {
      const alertId = 'alert-1';
      const mockAlert = {
        id: alertId,
        status: AlertStatus.ACKNOWLEDGED,
      };

      mockAlertRepo.findOne.mockResolvedValue(mockAlert);
      mockAlertRepo.save.mockResolvedValue({
        ...mockAlert,
        status: AlertStatus.RESOLVED,
      });

      const result = await service.resolveAlert(alertId);

      expect(result.status).toBe(AlertStatus.RESOLVED);
      expect(mockAlertRepo.save).toHaveBeenCalled();
    });
  });

  describe('dismissAlert', () => {
    it('should dismiss an alert', async () => {
      const alertId = 'alert-1';
      const mockAlert = {
        id: alertId,
        status: AlertStatus.ACTIVE,
      };

      mockAlertRepo.findOne.mockResolvedValue(mockAlert);
      mockAlertRepo.save.mockResolvedValue({
        ...mockAlert,
        status: AlertStatus.DISMISSED,
      });

      const result = await service.dismissAlert(alertId);

      expect(result.status).toBe(AlertStatus.DISMISSED);
      expect(mockAlertRepo.save).toHaveBeenCalled();
    });
  });

  describe('checkAndGenerateAlerts', () => {
    it('should check and generate alerts', async () => {
      const mockInventories = [
        {
          bookId: '1',
          currentStock: 8,
          minStock: 10,
          maxStock: 100,
          book: { id: '1', title: 'Test Book' },
        },
      ];

      const mockAnalytics = [
        {
          bookId: '1',
          rotationRate: 0.5,
          salesLast7Days: 5,
          salesLast30Days: 20,
          predictedDemand30Days: 25,
          book: { id: '1', title: 'Test Book' },
        },
      ];

      mockInventoryRepo.find.mockResolvedValue(mockInventories);
      mockAnalyticsRepo.find.mockResolvedValue(mockAnalytics);
      mockAnalyticsRepo.findOne.mockResolvedValue(mockAnalytics[0]);
      mockAlertRepo.findOne.mockResolvedValue(null);
      mockAlertRepo.create.mockImplementation((data) => data);
      mockAlertRepo.save.mockResolvedValue({});

      await service.checkAndGenerateAlerts();

      expect(mockInventoryRepo.find).toHaveBeenCalled();
      expect(mockAnalyticsRepo.find).toHaveBeenCalled();
    });
  });
});
