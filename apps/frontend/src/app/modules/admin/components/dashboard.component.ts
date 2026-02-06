import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { IDashboardMetrics } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  dashboardData: IDashboardMetrics | null = null;
  loading = false;
  error = '';

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.analyticsService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar el dashboard';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
