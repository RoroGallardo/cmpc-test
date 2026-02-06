import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ISalesAnalytics, IInventoryMetrics } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent {
  filterForm: FormGroup;
  salesReport: ISalesAnalytics | null = null;
  inventoryReport: IInventoryMetrics | null = null;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
    });
  }

  generateSalesReport(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();
    const filters = this.filterForm.value;

    this.analyticsService.getSalesAnalytics(filters).subscribe({
      next: (report) => {
        this.salesReport = report;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al generar reporte';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  generateInventoryReport(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.analyticsService.getInventoryMetrics().subscribe({
      next: (report) => {
        this.inventoryReport = report;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al generar reporte';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
