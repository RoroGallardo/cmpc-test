import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { IDemandPrediction } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-predictive',
  standalone: false,
  templateUrl: './predictive.component.html',
  styleUrls: ['./predictive.component.scss'],
})
export class PredictiveComponent implements OnInit {
  predictions: IDemandPrediction[] = [];
  loading = false;
  error = '';

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPredictiveDemand();
  }

  loadPredictiveDemand(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.analyticsService.getPredictiveDemand().subscribe({
      next: (data) => {
        this.predictions = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar análisis predictivo';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
