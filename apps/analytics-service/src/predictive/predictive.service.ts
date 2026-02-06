import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import {
  BookAnalytics,
  Sale,
  SaleItem,
  Inventory,
  StockMovement,
  Book,
  SaleStatus,
  IDemandPrediction,
  IRestockRecommendation
} from '@cmpc-test/shared';

@Injectable()
export class PredictiveService {
  private readonly logger = new Logger(PredictiveService.name);

  constructor(
    @InjectRepository(BookAnalytics)
    private readonly analyticsRepo: Repository<BookAnalytics>,
    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepo: Repository<SaleItem>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
  ) {}

  /**
   * Predice la demanda futura de un libro específico
   */
  async predictDemandForBook(bookId: string): Promise<IDemandPrediction> {
    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    if (!book) {
      throw new Error('Book not found');
    }

    const inventory = await this.inventoryRepo.findOne({ where: { bookId } });
    const analytics = await this.analyticsRepo.findOne({ where: { bookId } });

    // Obtener datos históricos de ventas
    const salesHistory = await this.getSalesHistory(bookId, 90); // últimos 90 días

    // Algoritmo de predicción simple (promedio móvil ponderado)
    const prediction = this.calculatePrediction(salesHistory);

    // Calcular tendencia
    const trend = this.calculateTrend(salesHistory);

    // Calcular recomendación de reabastecimiento
    const recommendedRestock = this.calculateRestockQuantity(
      inventory?.currentStock || 0,
      prediction.predicted30Days,
      inventory?.minStock || 10,
      inventory?.maxStock || 100,
    );

    return {
      bookId,
      bookTitle: book.title,
      currentStock: inventory?.currentStock || 0,
      predicted7Days: prediction.predicted7Days,
      predicted30Days: prediction.predicted30Days,
      recommendedRestock,
      confidence: prediction.confidence,
      trend,
    };
  }

  /**
   * Predice demanda para todos los libros activos
   */
  async predictDemandForAllBooks(): Promise<IDemandPrediction[]> {
    const books = await this.bookRepo.find({
      where: { available: true },
    });

    const predictions: DemandPrediction[] = [];

    for (const book of books) {
      try {
        const prediction = await this.predictDemandForBook(book.id);
        predictions.push(prediction);
      } catch (error) {
        this.logger.error(`Error predicting demand for book ${book.id}:`, error);
      }
    }

    return predictions.sort((a, b) => b.predicted30Days - a.predicted30Days);
  }

  /**
   * Genera recomendaciones de reabastecimiento
   */
  async getRestockRecommendations(): Promise<IRestockRecommendation[]> {
    const inventories = await this.inventoryRepo.find({
      relations: ['book'],
    });

    const recommendations: RestockRecommendation[] = [];

    for (const inv of inventories) {
      try {
        const prediction = await this.predictDemandForBook(inv.bookId);
        
        // Calcular días hasta agotamiento
        const dailyDemand = prediction.predicted30Days / 30;
        const daysUntilStockout = dailyDemand > 0 
          ? Math.floor(inv.currentStock / dailyDemand) 
          : 999;

        // Determinar urgencia
        let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (daysUntilStockout <= 3) urgency = 'critical';
        else if (daysUntilStockout <= 7) urgency = 'high';
        else if (daysUntilStockout <= 14) urgency = 'medium';

        // Solo recomendar si está por debajo del stock mínimo o urgencia alta
        if (inv.currentStock <= inv.minStock || urgency === 'high' || urgency === 'critical') {
          recommendations.push({
            bookId: inv.bookId,
            bookTitle: inv.book.title,
            currentStock: inv.currentStock,
            minStock: inv.minStock,
            recommendedQuantity: prediction.recommendedRestock,
            urgency,
            estimatedDaysUntilStockout: daysUntilStockout,
            estimatedCost: prediction.recommendedRestock * Number(inv.book.price),
          });
        }
      } catch (error) {
        this.logger.error(`Error generating restock recommendation for ${inv.bookId}:`, error);
      }
    }

    // Ordenar por urgencia y días hasta agotamiento
    return recommendations.sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      return urgencyDiff !== 0 ? urgencyDiff : a.estimatedDaysUntilStockout - b.estimatedDaysUntilStockout;
    });
  }

  /**
   * Actualiza los analytics de un libro con predicciones
   */
  async updateBookAnalytics(bookId: string): Promise<void> {
    const prediction = await this.predictDemandForBook(bookId);
    
    let analytics = await this.analyticsRepo.findOne({ where: { bookId } });
    
    if (!analytics) {
      analytics = this.analyticsRepo.create({ bookId });
    }

    analytics.predictedDemand7Days = prediction.predicted7Days;
    analytics.predictedDemand30Days = prediction.predicted30Days;
    analytics.recommendedRestockQuantity = prediction.recommendedRestock;
    analytics.lastCalculatedAt = new Date();

    await this.analyticsRepo.save(analytics);
  }

  // Métodos auxiliares privados

  private async getSalesHistory(bookId: string, days: number) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const salesByDay = await this.saleItemRepo
      .createQueryBuilder('item')
      .select("DATE(sale.createdAt)", 'date')
      .addSelect('SUM(item.quantity)', 'quantity')
      .innerJoin('item.sale', 'sale')
      .where('item.bookId = :bookId', { bookId })
      .andWhere('sale.createdAt >= :startDate', { startDate })
      .andWhere('sale.status = :status', { status: SaleStatus.COMPLETED })
      .groupBy("DATE(sale.createdAt)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return salesByDay.map(s => ({
      date: new Date(s.date),
      quantity: parseInt(s.quantity),
    }));
  }

  private calculatePrediction(salesHistory: Array<{ date: Date; quantity: number }>) {
    if (salesHistory.length === 0) {
      return {
        predicted7Days: 0,
        predicted30Days: 0,
        confidence: 0,
      };
    }

    // Promedio móvil ponderado exponencial (más peso a ventas recientes)
    let weightedSum = 0;
    let weightSum = 0;
    
    salesHistory.forEach((sale, index) => {
      const weight = Math.exp(index / salesHistory.length);
      weightedSum += sale.quantity * weight;
      weightSum += weight;
    });

    const avgDailySales = weightSum > 0 ? weightedSum / weightSum : 0;

    // Ajuste estacional (simplificado - en producción usar algoritmos más avanzados)
    const recentDays = salesHistory.slice(-7);
    const recentAvg = recentDays.reduce((sum, s) => sum + s.quantity, 0) / (recentDays.length || 1);
    
    const seasonalFactor = recentAvg > 0 ? recentAvg / avgDailySales : 1;
    const adjustedDailySales = avgDailySales * Math.max(0.5, Math.min(2, seasonalFactor));

    // Calcular confianza basada en la consistencia de datos
    const variance = salesHistory.reduce((sum, s) => {
      return sum + Math.pow(s.quantity - avgDailySales, 2);
    }, 0) / salesHistory.length;
    
    const stdDev = Math.sqrt(variance);
    const confidence = Math.max(0, Math.min(1, 1 - (stdDev / (avgDailySales + 1))));

    return {
      predicted7Days: Math.round(adjustedDailySales * 7),
      predicted30Days: Math.round(adjustedDailySales * 30),
      confidence: Math.round(confidence * 100) / 100,
    };
  }

  private calculateTrend(salesHistory: Array<{ date: Date; quantity: number }>): 'increasing' | 'stable' | 'decreasing' {
    if (salesHistory.length < 7) return 'stable';

    const midpoint = Math.floor(salesHistory.length / 2);
    const firstHalf = salesHistory.slice(0, midpoint);
    const secondHalf = salesHistory.slice(midpoint);

    const firstAvg = firstHalf.reduce((sum, s) => sum + s.quantity, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s.quantity, 0) / secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / (firstAvg || 1)) * 100;

    if (changePercent > 20) return 'increasing';
    if (changePercent < -20) return 'decreasing';
    return 'stable';
  }

  private calculateRestockQuantity(
    currentStock: number,
    predicted30Days: number,
    minStock: number,
    maxStock: number,
  ): number {
    // Si el stock actual está por debajo del mínimo
    if (currentStock < minStock) {
      // Calcular cuánto falta para llegar al stock objetivo
      const targetStock = Math.min(maxStock, minStock + predicted30Days);
      return Math.max(0, targetStock - currentStock);
    }

    // Si el stock proyectado caerá por debajo del mínimo en 30 días
    const projectedStock = currentStock - predicted30Days;
    if (projectedStock < minStock) {
      const targetStock = Math.min(maxStock, minStock + predicted30Days);
      return Math.max(0, targetStock - currentStock);
    }

    return 0;
  }
}
