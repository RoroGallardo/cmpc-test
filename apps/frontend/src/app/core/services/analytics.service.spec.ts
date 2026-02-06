import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnalyticsService } from './analytics.service';
import { environment } from '../../../environments/environment';
import {
  IDashboardMetrics,
  ISalesAnalytics,
  IInventoryMetrics,
  IDemandPrediction,
  ReportFilters,
} from '../models/analytics.model';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let httpMock: HttpTestingController;

  const mockDashboard: IDashboardMetrics = {
    totalSales: 1000,
    totalRevenue: 50000,
    totalBooks: 500,
    activeUsers: 100,
  };

  const mockSalesAnalytics: ISalesAnalytics = {
    totalSales: 1000,
    totalRevenue: 50000,
    averageOrderValue: 50,
    salesByPeriod: [],
  };

  const mockInventoryMetrics: IInventoryMetrics = {
    totalBooks: 500,
    outOfStock: 10,
    lowStock: 25,
    inStock: 465,
  };

  const mockDemandPrediction: IDemandPrediction[] = [
    {
      bookId: '1',
      bookTitle: 'Test Book',
      predictedDemand: 100,
      currentStock: 50,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnalyticsService],
    });
    service = TestBed.inject(AnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDashboard', () => {
    it('should get dashboard metrics', () => {
      service.getDashboard().subscribe((metrics) => {
        expect(metrics).toEqual(mockDashboard);
      });

      const req = httpMock.expectOne(`${environment.analyticsServiceUrl}/analytics/dashboard`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDashboard);
    });
  });

  describe('getSalesAnalytics', () => {
    it('should get sales analytics without filters', () => {
      service.getSalesAnalytics().subscribe((analytics) => {
        expect(analytics).toEqual(mockSalesAnalytics);
      });

      const req = httpMock.expectOne(`${environment.analyticsServiceUrl}/analytics/sales`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSalesAnalytics);
    });

    it('should get sales analytics with filters', () => {
      const filters: ReportFilters = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      service.getSalesAnalytics(filters).subscribe((analytics) => {
        expect(analytics).toEqual(mockSalesAnalytics);
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url === `${environment.analyticsServiceUrl}/analytics/sales` &&
          request.params.has('startDate') &&
          request.params.has('endDate')
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('startDate')).toBe('2024-01-01');
      expect(req.request.params.get('endDate')).toBe('2024-12-31');
      req.flush(mockSalesAnalytics);
    });
  });

  describe('getInventoryMetrics', () => {
    it('should get inventory metrics', () => {
      service.getInventoryMetrics().subscribe((metrics) => {
        expect(metrics).toEqual(mockInventoryMetrics);
      });

      const req = httpMock.expectOne(`${environment.analyticsServiceUrl}/analytics/inventory`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInventoryMetrics);
    });
  });

  describe('getPredictiveDemand', () => {
    it('should get predictive demand data', () => {
      service.getPredictiveDemand().subscribe((predictions) => {
        expect(predictions).toEqual(mockDemandPrediction);
      });

      const req = httpMock.expectOne(`${environment.analyticsServiceUrl}/predictive/demand`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDemandPrediction);
    });
  });

  describe('downloadReport', () => {
    it('should download a report blob', () => {
      const mockBlob = new Blob(['test data'], { type: 'text/csv' });
      const filename = 'test-report.csv';

      // Mock URL methods
      (global as any).URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      (global as any).URL.revokeObjectURL = jest.fn();

      // Mock document.createElement
      const linkElement = document.createElement('a');
      const clickSpy = jest.spyOn(linkElement, 'click').mockImplementation();
      jest.spyOn(document, 'createElement').mockReturnValue(linkElement);

      service.downloadReport(mockBlob, filename);

      expect((global as any).URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(linkElement.href).toBe('blob:mock-url');
      expect(linkElement.download).toBe(filename);
      expect(clickSpy).toHaveBeenCalled();
      expect((global as any).URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
