import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { SaleService } from '../../../core/services/sale.service';
import { Sale } from '../../../core/models/sale.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sales-list',
  standalone: false,
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.scss'],
})
export class SalesListComponent implements OnInit {
  sales: Sale[] = [];
  loading = false;
  error = '';
  
  // Modal properties
  showModal = false;
  selectedSaleId = '';
  paymentMethod = '';
  paymentReference = '';
  
  paymentMethods = [
    { value: 'CASH', label: 'Efectivo' },
    { value: 'CREDIT_CARD', label: 'Tarjeta de Crédito' },
    { value: 'DEBIT_CARD', label: 'Tarjeta de Débito' },
    { value: 'TRANSFER', label: 'Transferencia' },
    { value: 'OTHER', label: 'Otro' }
  ];

  constructor(
    private saleService: SaleService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.loading = true;
    this.cdr.detectChanges();
    const salesObservable = this.authService.isAdmin()
      ? this.saleService.getSales()
      : this.saleService.getMySales();

    salesObservable.subscribe({
      next: (sales) => {
        this.sales = sales;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar las ventas';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  viewSale(id: string): void {
    this.router.navigate(['/sales', id]);
  }

  createSale(): void {
    this.router.navigate(['/sales', 'new']);
  }

  openCompleteSaleModal(id: string): void {
    this.selectedSaleId = id;
    this.paymentMethod = '';
    this.paymentReference = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedSaleId = '';
    this.paymentMethod = '';
    this.paymentReference = '';
  }

  confirmCompleteSale(): void {
    if (!this.paymentMethod) {
      this.error = 'Debe seleccionar un método de pago';
      return;
    }

    this.saleService.completeSale(
      this.selectedSaleId, 
      this.paymentMethod, 
      this.paymentReference || undefined
    ).subscribe({
      next: () => {
        this.closeModal();
        this.loadSales();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al completar venta';
      },
    });
  }

  cancelSale(id: string): void {
    if (confirm('¿Está seguro de cancelar esta venta?')) {
      this.saleService.cancelSale(id).subscribe({
        next: () => {
          this.loadSales();
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al cancelar venta';
        },
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'badge-success';
      case 'PENDING':
      case 'CONFIRMED':
        return 'badge-warning';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'badge-danger';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'Completada';
      case 'PENDING':
        return 'Pendiente';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'REFUNDED':
        return 'Reembolsada';
      default:
        return status;
    }
  }
}
