export interface IDemandPrediction {
  bookId: string;
  bookTitle: string;
  currentStock: number;
  predicted7Days: number;
  predicted30Days: number;
  recommendedRestock: number;
  confidence: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface IRestockRecommendation {
  bookId: string;
  bookTitle: string;
  currentStock: number;
  minStock: number;
  recommendedQuantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedDaysUntilStockout: number;
  estimatedCost: number;
}
