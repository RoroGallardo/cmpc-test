import { env } from '../config/env';
import { DashboardMetrics, SalesAnalytics, ReportFilters } from '../types/analytics';
import { authService } from './auth.service';
import { apiClient } from './api-client';

// Datos mock para cuando el servicio no esté disponible
const MOCK_DASHBOARD: DashboardMetrics = {
  today: { orders: 0, sales: 0, revenue: 0 },
  thisWeek: { orders: 0, sales: 0, revenue: 0 },
  thisMonth: { orders: 0, sales: 0, revenue: 0 },
  inventory: { totalBooks: 0, lowStockCount: 0, outOfStockCount: 0 },
  topSelling: [],
  recentSales: [],
};

class AnalyticsService {
  private baseUrl = env.analyticsServiceUrl;

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async getDashboard(): Promise<DashboardMetrics> {
    try {
      const response = await apiClient.fetch(`${this.baseUrl}/analytics/dashboard`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        console.warn(`Error ${response.status} al obtener dashboard, usando datos mock`);
        return MOCK_DASHBOARD;
      }

      const data = await response.json();
      return data || MOCK_DASHBOARD;
    } catch (error) {
      console.error('Error en getDashboard:', error);
      return MOCK_DASHBOARD;
    }
  }

  async getSalesAnalytics(filters?: ReportFilters): Promise<SalesAnalytics> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.fetch(`${this.baseUrl}/analytics/sales?${params}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener analytics de ventas');
    }

    return response.json();
  }

  async generateReport(type: string, filters?: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.fetch(`${this.baseUrl}/analytics/reports/${type}?${params}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al generar reporte');
    }

    return response.blob();
  }

  async getABCAnalysis(filters?: ReportFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.fetch(`${this.baseUrl}/reports/abc-analysis?${params}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener análisis ABC');
    }

    return response.json();
  }

  async getProfitabilityReport(filters?: ReportFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.fetch(`${this.baseUrl}/reports/profitability?${params}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener reporte de rentabilidad');
    }

    return response.json();
  }

  async getSeasonalityReport(): Promise<any> {
    const response = await apiClient.fetch(`${this.baseUrl}/reports/seasonality`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener reporte de estacionalidad');
    }

    return response.json();
  }

  async getStockRotationReport(): Promise<any> {
    const response = await apiClient.fetch(`${this.baseUrl}/reports/stock-rotation`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener reporte de rotación de stock');
    }

    return response.json();
  }

  async getAuditTrailReport(filters?: ReportFilters & { entityId?: string }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.entityId) params.append('entityId', filters.entityId);

    const response = await apiClient.fetch(`${this.baseUrl}/reports/audit-trail?${params}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener reporte de auditoría');
    }

    return response.json();
  }

  async getPredictiveDemand(): Promise<any> {
    const response = await apiClient.fetch(`${this.baseUrl}/predictive/demand`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener predicción de demanda');
    }

    return response.json();
  }

  async getRestockRecommendations(): Promise<any> {
    const response = await apiClient.fetch(`${this.baseUrl}/predictive/restock-recommendations`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener recomendaciones de reabastecimiento');
    }

    return response.json();
  }
}

export const analyticsService = new AnalyticsService();
