import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Sale, CreateSaleDto, UpdateSaleStatusDto } from '../models/sale.model';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private readonly API_URL = environment.catalogServiceUrl;

  // Headers para desactivar el caché HTTP
  private readonly noCacheHeaders = new HttpHeaders({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  constructor(private http: HttpClient) {}

  getSales(): Observable<Sale[]> {
    return this.http.get<PaginatedResponse<Sale>>(`${this.API_URL}/sales`, { headers: this.noCacheHeaders })
      .pipe(map(response => response.data));
  }

  getMySales(): Observable<Sale[]> {
    return this.http.get<PaginatedResponse<Sale>>(`${this.API_URL}/sales/my-sales`, { headers: this.noCacheHeaders })
      .pipe(map(response => response.data));
  }

  getSale(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.API_URL}/sales/${id}`, { headers: this.noCacheHeaders });
  }

  createSale(sale: CreateSaleDto): Observable<Sale> {
    return this.http.post<Sale>(`${this.API_URL}/sales`, sale);
  }

  updateSaleStatus(id: string, data: UpdateSaleStatusDto): Observable<Sale> {
    return this.http.patch<Sale>(`${this.API_URL}/sales/${id}/status`, data);
  }

  completeSale(id: string, paymentMethod?: string, paymentReference?: string): Observable<Sale> {
    const data: UpdateSaleStatusDto = { 
      status: 'COMPLETED',
      paymentMethod,
      paymentReference
    };
    return this.updateSaleStatus(id, data);
  }

  cancelSale(id: string): Observable<Sale> {
    return this.updateSaleStatus(id, { status: 'CANCELLED' });
  }
}
