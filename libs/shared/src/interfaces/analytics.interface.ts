export interface IDashboardMetrics {
  today: {
    sales: number;
    revenue: number;
    orders: number;
  };
  thisWeek: {
    sales: number;
    revenue: number;
    orders: number;
  };
  thisMonth: {
    sales: number;
    revenue: number;
    orders: number;
  };
  inventory: {
    totalValue: number;
    totalBooks: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  topSelling: Array<{
    bookId: string;
    title: string;
    unitsSold: number;
    revenue: number;
  }>;
  recentSales: Array<any>; // Array of Sale entities
}

export interface ISalesAnalytics {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  salesByDay: Array<{ date: string; sales: number; revenue: number }>;
  salesByCategory: Array<{ category: string; sales: number; revenue: number }>;
  salesByAuthor: Array<{ author: string; sales: number; revenue: number }>;
  topProducts: Array<{
    bookId: string;
    title: string;
    unitsSold: number;
    revenue: number;
  }>;
}

export interface IInventoryMetrics {
  totalValue: number;
  totalUnits: number;
  averageRotationRate: number;
  lowStockItems: Array<{
    bookId: string;
    title: string;
    currentStock: number;
    minStock: number;
  }>;
  overStockItems: Array<{
    bookId: string;
    title: string;
    currentStock: number;
    maxStock: number;
    rotationRate: number;
  }>;
  stockMovementsSummary: {
    purchases: number;
    sales: number;
    adjustments: number;
    returns: number;
  };
}
