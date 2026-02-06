import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  IDashboardMetrics,
  ISalesAnalytics,
  IInventoryMetrics,
  IDemandPrediction,
  ReportFilters,
} from '../models/analytics.model';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly API_URL = environment.analyticsServiceUrl;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<IDashboardMetrics> {
    return this.http.get<IDashboardMetrics>(`${this.API_URL}/analytics/dashboard`);
  }

  getSalesAnalytics(filters?: ReportFilters): Observable<ISalesAnalytics> {
    let params = new HttpParams();

    if (filters) {
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }

    return this.http.get<ISalesAnalytics>(`${this.API_URL}/analytics/sales`, { params });
  }

  getInventoryMetrics(): Observable<IInventoryMetrics> {
    return this.http.get<IInventoryMetrics>(`${this.API_URL}/analytics/inventory`);
  }

  getPredictiveDemand(): Observable<IDemandPrediction[]> {
    return this.http.get<IDemandPrediction[]>(`${this.API_URL}/predictive/demand`);
  }

  downloadReport(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
