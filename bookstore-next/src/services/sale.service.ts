import { env } from '../config/env';
import { Sale, CreateSaleDto, UpdateSaleStatusDto } from '../types/sale';
import { authService } from './auth.service';

class SaleService {
  private baseUrl = env.catalogServiceUrl;

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

  async getSales(): Promise<Sale[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sales`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Error desconocido');
        console.warn(`Error ${response.status} al obtener ventas:`, errorText);
        return [];
      }

      const result = await response.json();
      
      // El servicio devuelve { data: [...] }
      let salesData = [];
      if (result && typeof result === 'object') {
        salesData = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
      }
      
      // Convertir strings numéricos a números
      return salesData.map((sale: any) => ({
        ...sale,
        subtotal: parseFloat(sale.subtotal) || 0,
        discount: parseFloat(sale.discount) || 0,
        tax: parseFloat(sale.tax) || 0,
        total: parseFloat(sale.total) || 0,
        items: Array.isArray(sale.items) ? sale.items.map((item: any) => ({
          ...item,
          quantity: parseInt(item.quantity) || 0,
          price: parseFloat(item.unitPrice || item.price) || 0,
          subtotal: parseFloat(item.subtotal) || 0,
        })) : []
      }));
    } catch (error) {
      console.error('Error en getSales:', error);
      return [];
    }
  }

  async getSaleById(id: string): Promise<Sale> {
    const response = await fetch(`${this.baseUrl}/sales/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener venta');
    }

    return response.json();
  }

  async createSale(data: CreateSaleDto): Promise<Sale> {
    const response = await fetch(`${this.baseUrl}/sales`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear venta');
    }

    return response.json();
  }

  async updateSaleStatus(id: string, data: UpdateSaleStatusDto): Promise<Sale> {
    const response = await fetch(`${this.baseUrl}/sales/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar estado de venta');
    }

    return response.json();
  }

  async completeSale(id: string, paymentMethod: string, paymentReference?: string): Promise<Sale> {
    const data: UpdateSaleStatusDto = {
      status: 'COMPLETED',
      paymentMethod,
      paymentReference,
    };
    return this.updateSaleStatus(id, data);
  }

  async cancelSale(id: string): Promise<Sale> {
    return this.updateSaleStatus(id, { status: 'CANCELLED' });
  }

  async deleteSale(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/sales/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al eliminar venta');
    }
  }
}

export const saleService = new SaleService();
