import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SaleService } from './sale.service';
import { environment } from '../../../environments/environment';
import { Sale, CreateSaleDto, UpdateSaleStatusDto } from '../models/sale.model';

describe('SaleService', () => {
  let service: SaleService;
  let httpMock: HttpTestingController;

  const mockSale: Sale = {
    id: '1',
    userId: 'user-1',
    bookId: 'book-1',
    quantity: 2,
    unitPrice: 29.99,
    totalPrice: 59.98,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResponse = {
    data: [mockSale],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SaleService],
    });
    service = TestBed.inject(SaleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSales', () => {
    it('should get all sales', () => {
      service.getSales().subscribe((sales) => {
        expect(sales).toEqual([mockSale]);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/sales`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Cache-Control')).toBe(true);
      req.flush(mockPaginatedResponse);
    });
  });

  describe('getMySales', () => {
    it('should get user sales', () => {
      service.getMySales().subscribe((sales) => {
        expect(sales).toEqual([mockSale]);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/sales/my-sales`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Cache-Control')).toBe(true);
      req.flush(mockPaginatedResponse);
    });
  });

  describe('getSale', () => {
    it('should get a single sale by id', () => {
      service.getSale('1').subscribe((sale) => {
        expect(sale).toEqual(mockSale);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/sales/1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Cache-Control')).toBe(true);
      req.flush(mockSale);
    });
  });

  describe('createSale', () => {
    it('should create a new sale', () => {
      const createDto: CreateSaleDto = {
        bookId: 'book-1',
        quantity: 2,
      };

      service.createSale(createDto).subscribe((sale) => {
        expect(sale).toEqual(mockSale);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/sales`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockSale);
    });
  });

  describe('updateSaleStatus', () => {
    it('should update sale status', () => {
      const updateDto: UpdateSaleStatusDto = {
        status: 'COMPLETED',
      };

      service.updateSaleStatus('1', updateDto).subscribe((sale) => {
        expect(sale).toEqual({ ...mockSale, status: 'COMPLETED' });
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/sales/1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateDto);
      req.flush({ ...mockSale, status: 'COMPLETED' });
    });
  });

  describe('completeSale', () => {
    it('should complete a sale without payment details', () => {
      service.completeSale('1').subscribe((sale) => {
        expect(sale).toEqual({ ...mockSale, status: 'COMPLETED' });
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/sales/1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'COMPLETED' });
      req.flush({ ...mockSale, status: 'COMPLETED' });
    });

    it('should complete a sale with payment details', () => {
      service.completeSale('1', 'credit_card', 'REF-123').subscribe((sale) => {
        expect(sale).toEqual({ ...mockSale, status: 'COMPLETED' });
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/sales/1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({
        status: 'COMPLETED',
        paymentMethod: 'credit_card',
        paymentReference: 'REF-123',
      });
      req.flush({ ...mockSale, status: 'COMPLETED' });
    });
  });

  describe('cancelSale', () => {
    it('should cancel a sale', () => {
      service.cancelSale('1').subscribe((sale) => {
        expect(sale).toEqual({ ...mockSale, status: 'CANCELLED' });
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/sales/1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'CANCELLED' });
      req.flush({ ...mockSale, status: 'CANCELLED' });
    });
  });
});
