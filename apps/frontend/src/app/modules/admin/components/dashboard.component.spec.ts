import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { IDashboardMetrics } from '../../../core/models/analytics.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let analyticsService: jest.Mocked<AnalyticsService>;
  let changeDetectorRef: jest.Mocked<ChangeDetectorRef>;

  const mockDashboardData: IDashboardMetrics = {
    today: {
      sales: 10,
      revenue: 5000,
      orders: 8,
    },
    thisWeek: {
      sales: 50,
      revenue: 25000,
      orders: 40,
    },
    thisMonth: {
      sales: 200,
      revenue: 100000,
      orders: 150,
    },
    inventory: {
      totalValue: 500000,
      totalBooks: 1000,
      lowStockCount: 25,
      outOfStockCount: 5,
    },
    topSelling: [
      {
        bookId: '1',
        title: 'Book 1',
        unitsSold: 100,
        revenue: 5000,
      },
    ],
    recentSales: [],
  };

  beforeEach(async () => {
    const analyticsServiceMock = {
      getDashboard: jest.fn(),
    };

    const changeDetectorRefMock = {
      detectChanges: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: AnalyticsService, useValue: analyticsServiceMock },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    analyticsService = TestBed.inject(AnalyticsService) as jest.Mocked<AnalyticsService>;
    changeDetectorRef = TestBed.inject(ChangeDetectorRef) as jest.Mocked<ChangeDetectorRef>;
    // No llamar fixture.detectChanges() ni ngOnInit() para evitar problemas con el template
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with null dashboardData', () => {
      expect(component.dashboardData).toBeNull();
      expect(component.loading).toBe(false);
      expect(component.error).toBe('');
    });
  });

  describe('loadDashboard', () => {
    it('should load dashboard data successfully', (done) => {
      analyticsService.getDashboard.mockReturnValue(of(mockDashboardData));

      component.loadDashboard();

      setTimeout(() => {
        expect(component.dashboardData).toEqual(mockDashboardData);
        expect(component.loading).toBe(false);
        expect(component.error).toBe('');
        done();
      }, 100);
    });

    it('should handle error when loading dashboard', (done) => {
      const errorResponse = {
        error: { message: 'Failed to load dashboard' },
      };

      analyticsService.getDashboard.mockReturnValue(throwError(() => errorResponse));

      component.loadDashboard();

      setTimeout(() => {
        expect(component.error).toBe('Failed to load dashboard');
        expect(component.loading).toBe(false);
        expect(component.dashboardData).toBeNull();
        done();
      }, 100);
    });

    it('should use default error message when error message not provided', (done) => {
      const errorResponse = { error: {} };

      analyticsService.getDashboard.mockReturnValue(throwError(() => errorResponse));

      component.loadDashboard();

      setTimeout(() => {
        expect(component.error).toBe('Error al cargar el dashboard');
        done();
      }, 100);
    });

    it('should set loading to false after error', (done) => {
      analyticsService.getDashboard.mockReturnValue(
        throwError(() => ({ error: { message: 'Error' } }))
      );

      component.loadDashboard();

      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 100);
    });
  });

  describe('Data Display', () => {
    it('should display correct metrics', (done) => {
      analyticsService.getDashboard.mockReturnValue(of(mockDashboardData));

      component.loadDashboard();

      setTimeout(() => {
        expect(component.dashboardData?.today.sales).toBe(10);
        expect(component.dashboardData?.today.revenue).toBe(5000);
        expect(component.dashboardData?.today.orders).toBe(8);
        expect(component.dashboardData?.thisMonth.sales).toBe(200);
        expect(component.dashboardData?.inventory.totalBooks).toBe(1000);
        done();
      }, 100);
    });
  });
});
