import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import {
  BookAnalytics,
  Sale,
  SaleItem,
  Inventory,
  StockMovement,
  Book,
  Author,
  Genre,
  Publisher,
  AuditLog,
  SaleStatus,
  MovementType
} from '@cmpc-test/shared';

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

@Injectable()
export class ReportsService {
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
    @InjectRepository(Author)
    private readonly authorRepo: Repository<Author>,
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
    @InjectRepository(Publisher)
    private readonly publisherRepo: Repository<Publisher>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  /**
   * Análisis ABC de inventario (Pareto)
   */
  async generateABCAnalysis(startDate: Date, endDate: Date): Promise<ABCAnalysis[]> {
    // Obtener ventas por libro
    const salesByBook = await this.saleItemRepo
      .createQueryBuilder('item')
      .select('item.bookId', 'bookId')
      .addSelect('item.bookTitle', 'title')
      .addSelect('SUM(item.subtotal)', 'revenue')
      .innerJoin('item.sale', 'sale')
      .where('sale.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere('sale.status = :status', { status: SaleStatus.COMPLETED })
      .groupBy('item.bookId')
      .addGroupBy('item.bookTitle')
      .orderBy('SUM(item.subtotal)', 'DESC')
      .getRawMany();

    const totalRevenue = salesByBook.reduce((sum, b) => sum + parseFloat(b.revenue), 0);
    const totalProducts = salesByBook.length;

    let cumulativeRevenue = 0;
    const categorizedBooks = salesByBook.map(book => {
      const revenue = parseFloat(book.revenue);
      const percentageOfTotal = (revenue / totalRevenue) * 100;
      cumulativeRevenue += revenue;
      const cumulativePercentage = (cumulativeRevenue / totalRevenue) * 100;

      return {
        bookId: book.bookId,
        title: book.title,
        revenue,
        percentageOfTotal,
        cumulativePercentage,
      };
    });

    // Clasificar en A, B, C
    const categoryA = categorizedBooks.filter(b => b.cumulativePercentage <= 80);
    const categoryB = categorizedBooks.filter(b => b.cumulativePercentage > 80 && b.cumulativePercentage <= 95);
    const categoryC = categorizedBooks.filter(b => b.cumulativePercentage > 95);

    const createSummary = (books: typeof categorizedBooks) => ({
      totalRevenue: books.reduce((sum, b) => sum + b.revenue, 0),
      percentageOfRevenue: (books.reduce((sum, b) => sum + b.revenue, 0) / totalRevenue) * 100,
      count: books.length,
      percentageOfProducts: (books.length / totalProducts) * 100,
    });

    return [
      { category: 'A' as const, books: categoryA, summary: createSummary(categoryA) },
      { category: 'B' as const, books: categoryB, summary: createSummary(categoryB) },
      { category: 'C' as const, books: categoryC, summary: createSummary(categoryC) },
    ];
  }

  /**
   * Reporte de rentabilidad por categoría
   */
  async generateProfitabilityReport(startDate: Date, endDate: Date): Promise<ProfitabilityReport> {
    // Por categoría
    const byCategory = await this.saleItemRepo
      .createQueryBuilder('item')
      .select('genre.name', 'categoryName')
      .addSelect('SUM(item.subtotal)', 'totalRevenue')
      .addSelect('SUM(item.quantity)', 'unitsSold')
      .innerJoin('item.sale', 'sale')
      .innerJoin('item.book', 'book')
      .innerJoin('book.genre', 'genre')
      .leftJoin('inventory', 'inv', 'inv.book_id = book.id')
      .where('sale.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere('sale.status = :status', { status: SaleStatus.COMPLETED })
      .groupBy('genre.name')
      .getRawMany();

    // Por autor
    const byAuthor = await this.saleItemRepo
      .createQueryBuilder('item')
      .select('author.name', 'authorName')
      .addSelect('SUM(item.subtotal)', 'totalRevenue')
      .addSelect('COUNT(DISTINCT item.bookId)', 'booksSold')
      .innerJoin('item.sale', 'sale')
      .innerJoin('item.book', 'book')
      .innerJoin('book.author', 'author')
      .where('sale.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere('sale.status = :status', { status: SaleStatus.COMPLETED })
      .groupBy('author.name')
      .getRawMany();

    // Por editorial
    const byPublisher = await this.saleItemRepo
      .createQueryBuilder('item')
      .select('publisher.name', 'publisherName')
      .addSelect('SUM(item.subtotal)', 'totalRevenue')
      .addSelect('COUNT(DISTINCT item.bookId)', 'booksSold')
      .innerJoin('item.sale', 'sale')
      .innerJoin('item.book', 'book')
      .innerJoin('book.publisher', 'publisher')
      .where('sale.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere('sale.status = :status', { status: SaleStatus.COMPLETED })
      .groupBy('publisher.name')
      .getRawMany();

    // Calcular costos estimados (simplificado - 60% del precio de venta)
    const costRatio = 0.6;

    const processCategory = (data: any[]) => data.map(item => {
      const revenue = parseFloat(item.totalRevenue);
      const cost = revenue * costRatio;
      const profit = revenue - cost;
      const margin = (profit / revenue) * 100;

      return {
        ...item,
        totalRevenue: revenue,
        totalCost: cost,
        profit,
        margin,
        unitsSold: parseInt(item.unitsSold) || 0,
        booksSold: parseInt(item.booksSold) || 0,
      };
    });

    const totalRevenue = byCategory.reduce((sum, c) => sum + parseFloat(c.totalRevenue), 0);
    const totalCost = totalRevenue * costRatio;

    return {
      byCategory: processCategory(byCategory),
      byAuthor: processCategory(byAuthor),
      byPublisher: processCategory(byPublisher),
      overall: {
        totalRevenue,
        totalCost,
        grossProfit: totalRevenue - totalCost,
        margin: ((totalRevenue - totalCost) / totalRevenue) * 100,
      },
    };
  }

  /**
   * Análisis de estacionalidad
   */
  async generateSeasonalityReport(): Promise<SeasonalityReport> {
    // Por mes
    const monthly = await this.saleRepo
      .createQueryBuilder('sale')
      .select("TO_CHAR(sale.createdAt, 'YYYY-MM')", 'month')
      .addSelect("EXTRACT(YEAR FROM sale.createdAt)", 'year')
      .addSelect('COUNT(*)', 'sales')
      .addSelect('SUM(sale.total)', 'revenue')
      .addSelect('AVG(sale.total)', 'averageOrderValue')
      .where('sale.status = :status', { status: SaleStatus.COMPLETED })
      .groupBy("TO_CHAR(sale.createdAt, 'YYYY-MM')")
      .addGroupBy("EXTRACT(YEAR FROM sale.createdAt)")
      .orderBy('month', 'ASC')
      .getRawMany();

    // Por día de la semana
    const dayOfWeek = await this.saleRepo
      .createQueryBuilder('sale')
      .select("TO_CHAR(sale.createdAt, 'Day')", 'day')
      .addSelect('COUNT(*)', 'sales')
      .addSelect('SUM(sale.total)', 'revenue')
      .where('sale.status = :status', { status: SaleStatus.COMPLETED })
      .groupBy("TO_CHAR(sale.createdAt, 'Day')")
      .orderBy('sales', 'DESC')
      .getRawMany();

    const processedMonthly = monthly.map(m => ({
      month: m.month,
      year: parseInt(m.year),
      sales: parseInt(m.sales),
      revenue: parseFloat(m.revenue),
      averageOrderValue: parseFloat(m.averageOrderValue),
    }));

    const processedDayOfWeek = dayOfWeek.map(d => ({
      day: d.day.trim(),
      sales: parseInt(d.sales),
      revenue: parseFloat(d.revenue),
    }));

    const bestMonth = processedMonthly.sort((a, b) => b.revenue - a.revenue)[0]?.month || 'N/A';
    const worstMonth = processedMonthly.sort((a, b) => a.revenue - b.revenue)[0]?.month || 'N/A';
    const bestDay = processedDayOfWeek[0]?.day || 'N/A';
    const worstDay = processedDayOfWeek[processedDayOfWeek.length - 1]?.day || 'N/A';

    return {
      monthly: processedMonthly,
      dayOfWeek: processedDayOfWeek,
      trends: {
        bestMonth,
        worstMonth,
        bestDayOfWeek: bestDay,
        worstDayOfWeek: worstDay,
      },
    };
  }

  /**
   * Reporte de rotación de stock
   */
  async generateStockRotationReport(): Promise<StockRotationReport> {
    const analytics = await this.analyticsRepo.find({
      relations: ['book'],
    });

    const inventories = await this.inventoryRepo.find();
    const inventoryMap = new Map(inventories.map(i => [i.bookId, i]));

    const books = await this.bookRepo.find();
    const bookMap = new Map(books.map(b => [b.id, b]));

    const booksWithMetrics = analytics.map(a => {
      const inventory = inventoryMap.get(a.bookId);
      const book = bookMap.get(a.bookId);

      return {
        bookId: a.bookId,
        title: book?.title || 'Unknown',
        rotationRate: parseFloat(a.rotationRate?.toString() || '0'),
        daysToSell: a.daysToSell || 999,
        currentStock: inventory?.currentStock || 0,
        lastSaleDate: a.lastSaleDate,
      };
    });

    // Clasificar
    const fastMoving = booksWithMetrics
      .filter(b => b.rotationRate >= 4) // 4+ rotaciones al año
      .sort((a, b) => b.rotationRate - a.rotationRate)
      .slice(0, 20);

    const slowMoving = booksWithMetrics
      .filter(b => b.rotationRate < 1 && b.currentStock > 0)
      .sort((a, b) => a.rotationRate - b.rotationRate)
      .slice(0, 20);

    const deadStockBooks = booksWithMetrics.filter(b => 
      b.currentStock > 0 && 
      (!b.lastSaleDate || 
        (new Date().getTime() - new Date(b.lastSaleDate).getTime()) > 180 * 24 * 60 * 60 * 1000)
    ).map(b => ({
      bookId: b.bookId,
      title: b.title,
      currentStock: b.currentStock,
      lastSaleDate: b.lastSaleDate,
      daysSinceLastSale: b.lastSaleDate 
        ? Math.floor((new Date().getTime() - new Date(b.lastSaleDate).getTime()) / (24 * 60 * 60 * 1000))
        : 999,
    })).sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale);

    const avgRotation = booksWithMetrics.reduce((sum, b) => sum + b.rotationRate, 0) / booksWithMetrics.length;

    return {
      fastMoving,
      slowMoving,
      deadStock: deadStockBooks,
      summary: {
        averageRotationRate: avgRotation,
        fastMovingCount: fastMoving.length,
        slowMovingCount: slowMoving.length,
        deadStockCount: deadStockBooks.length,
      },
    };
  }

  /**
   * Reporte de trazabilidad (audit trail)
   */
  async generateAuditTrail(
    startDate: Date,
    endDate: Date,
    entityId?: string,
  ): Promise<AuditTrailReport> {
    const query = this.auditRepo
      .createQueryBuilder('audit')
      .where('audit.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .orderBy('audit.createdAt', 'DESC');

    if (entityId) {
      query.andWhere('audit.entityId = :entityId', { entityId });
    }

    const audits = await query.getMany();

    const changes = audits.map(audit => ({
      id: audit.id,
      timestamp: audit.createdAt,
      user: audit.userEmail || audit.userId || 'System',
      action: audit.action,
      entityType: audit.entityType,
      entityId: audit.entityId,
      changes: audit.changes || {},
    }));

    const byAction: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    const byEntity: Record<string, number> = {};

    audits.forEach(audit => {
      byAction[audit.action] = (byAction[audit.action] || 0) + 1;
      const user = audit.userEmail || audit.userId || 'System';
      byUser[user] = (byUser[user] || 0) + 1;
      byEntity[audit.entityType] = (byEntity[audit.entityType] || 0) + 1;
    });

    return {
      changes,
      summary: {
        totalChanges: audits.length,
        byAction,
        byUser,
        byEntity,
      },
    };
  }
}
