export interface IABCAnalysis {
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

export interface IProfitabilityReport {
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

export interface ISeasonalityReport {
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

export interface IStockRotationReport {
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

export interface IAuditTrailReport {
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
