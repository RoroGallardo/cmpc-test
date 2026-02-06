
// Re-export interfaces from shared library
export type {
  IDashboardMetrics,
  ISalesAnalytics,
  IInventoryMetrics
} from '@cmpc-test/shared';

export type {
  IABCAnalysis,
  IProfitabilityReport,
  ISeasonalityReport,
  IStockRotationReport,
  IAuditTrailReport
} from '@cmpc-test/shared';

export type {
  IDemandPrediction,
  IRestockRecommendation
} from '@cmpc-test/shared';

export type {
  IAlert,
  AlertType,
  AlertSeverity,
  AlertStatus
} from '@cmpc-test/shared';

// Filters for report generation
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  format?: 'json' | 'csv';
}

