// Analytics types
export interface PeriodMetrics {
  orders: number;
  sales: number;
  revenue: number;
}

export interface InventoryMetrics {
  totalBooks: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface TopSellingBook {
  bookId: string;
  title: string;
  unitsSold: number;
  revenue: number;
}

export interface RecentSale {
  id: string;
  createdAt: string;
  total: number;
  items: Array<{ id: string }>;
  status: string;
}

export interface DashboardMetrics {
  today: PeriodMetrics;
  thisWeek: PeriodMetrics;
  thisMonth: PeriodMetrics;
  inventory: InventoryMetrics;
  topSelling: TopSellingBook[];
  recentSales: RecentSale[];
}

export interface SalesAnalytics {
  period: string;
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: TopSellingBook[];
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  format?: 'json' | 'csv';
}

// Report Types
export interface ABCAnalysis {
  category: 'A' | 'B' | 'C';
  books: Array<{
    bookId: string;
    title: string;
    revenue: number;
    percentageOfTotal: number;
    cumulativePercentage: number;
  }>;
  summary: {
    totalRevenue: number;
    percentageOfRevenue: number;
    count: number;
    percentageOfProducts: number;
  };
}

export interface ProfitabilityReport {
  byCategory: Array<{
    categoryName: string;
    totalRevenue: number;
    totalCost: number;
    profit: number;
    margin: number;
    unitsSold: number;
  }>;
  byAuthor: Array<{
    authorName: string;
    totalRevenue: number;
    profit: number;
    margin: number;
    booksSold: number;
  }>;
  byPublisher: Array<{
    publisherName: string;
    totalRevenue: number;
    profit: number;
    margin: number;
    booksSold: number;
  }>;
  overall: {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    margin: number;
  };
}

export interface SeasonalityReport {
  monthly: Array<{
    month: string;
    year: number;
    sales: number;
    revenue: number;
    averageOrderValue: number;
  }>;
  dayOfWeek: Array<{
    day: string;
    sales: number;
    revenue: number;
  }>;
  trends: {
    bestMonth: string;
    worstMonth: string;
    bestDayOfWeek: string;
    worstDayOfWeek: string;
  };
}

export interface StockRotationReport {
  fastMoving: Array<{
    bookId: string;
    title: string;
    rotationRate: number;
    daysToSell: number;
    currentStock: number;
  }>;
  slowMoving: Array<{
    bookId: string;
    title: string;
    rotationRate: number;
    daysToSell: number;
    currentStock: number;
    lastSaleDate: Date | null;
  }>;
  deadStock: Array<{
    bookId: string;
    title: string;
    currentStock: number;
    lastSaleDate: Date | null;
    daysSinceLastSale: number;
  }>;
  summary: {
    averageRotationRate: number;
    fastMovingCount: number;
    slowMovingCount: number;
    deadStockCount: number;
  };
}

export interface AuditTrailReport {
  changes: Array<{
    id: string;
    timestamp: Date;
    user: string;
    action: string;
    entityType: string;
    entityId: string;
    changes: Record<string, { old: any; new: any }>;
  }>;
  summary: {
    totalChanges: number;
    byAction: Record<string, number>;
    byUser: Record<string, number>;
    byEntity: Record<string, number>;
  };
}

// Predictive Analytics Types
export interface DemandPrediction {
  bookId: string;
  bookTitle: string;
  currentStock: number;
  predicted7Days: number;
  predicted30Days: number;
  recommendedRestock: number;
  confidence: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface RestockRecommendation {
  bookId: string;
  bookTitle: string;
  currentStock: number;
  minStock: number;
  recommendedQuantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedDaysUntilStockout: number;
  estimatedCost: number;
}
