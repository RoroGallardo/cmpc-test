import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import {
  BookAnalytics,
  Sale,
  SaleItem,
  Inventory,
  StockMovement,
  Book,
  MovementType,
  SaleStatus,
  IDashboardMetrics,
  ISalesAnalytics,
  IInventoryMetrics
} from '@cmpc-test/shared';

@Injectable()
export class AnalyticsService {
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
   * Dashboard con métricas en tiempo real
   */
  async getDashboardMetrics(): Promise<IDashboardMetrics> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Métricas del día
    const todayMetrics = await this.getSalesMetricsForPeriod(todayStart, todayEnd);
    
    // Métricas de la semana
    const weekMetrics = await this.getSalesMetricsForPeriod(weekStart, todayEnd);
    
    // Métricas del mes
    const monthMetrics = await this.getSalesMetricsForPeriod(monthStart, todayEnd);

    // Inventario
    const inventory = await this.getInventorySummary();

    // Top selling books
    const topSelling = await this.getTopSellingBooks(10);

    // Ventas recientes
    const recentSales = await this.saleRepo.find({
      take: 10,
      order: { createdAt: 'DESC' },
      relations: ['items'],
    });

    return {
      today: todayMetrics,
      thisWeek: weekMetrics,
      thisMonth: monthMetrics,
      inventory,
      topSelling,
      recentSales,
    };
  }

  /**
   * Análisis detallado de ventas
   */
  async getSalesAnalytics(
    startDate: Date,
    endDate: Date,
  ): Promise<ISalesAnalytics> {
    const sales = await this.saleRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: SaleStatus.COMPLETED,
      },
      relations: ['items'],
    });

    const totalSales = sales.reduce((sum, sale) => sum + sale.items.length, 0);
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const averageOrderValue = totalRevenue / (sales.length || 1);

    // Ventas por día
    const salesByDay = await this.getSalesByDay(startDate, endDate);

    // Ventas por categoría
    const salesByCategory = await this.getSalesByCategory(startDate, endDate);

    // Ventas por autor
    const salesByAuthor = await this.getSalesByAuthor(startDate, endDate);

    // Top productos
    const topProducts = await this.getTopSellingBooks(20, startDate, endDate);

    return {
      totalSales,
      totalRevenue,
      averageOrderValue,
      salesByDay,
      salesByCategory,
      salesByAuthor,
      topProducts,
    };
  }

  /**
   * Métricas de inventario
   */
  async getInventoryMetrics(): Promise<IInventoryMetrics> {
    const inventories = await this.inventoryRepo.find({
      relations: ['book'],
    });

    const books = await this.bookRepo.find();
    const bookMap = new Map(books.map(b => [b.id, b]));

    let totalValue = 0;
    let totalUnits = 0;
    const lowStockItems = [];
    const overStockItems = [];

    for (const inv of inventories) {
      const book = bookMap.get(inv.bookId);
      if (!book) continue;

      totalValue += inv.currentStock * Number(book.price);
      totalUnits += inv.currentStock;

      if (inv.currentStock <= inv.minStock) {
        lowStockItems.push({
          bookId: inv.bookId,
          title: book.title,
          currentStock: inv.currentStock,
          minStock: inv.minStock,
        });
      }

      if (inv.currentStock > inv.maxStock * 1.5) {
        const analytics = await this.analyticsRepo.findOne({
          where: { bookId: inv.bookId },
        });

        overStockItems.push({
          bookId: inv.bookId,
          title: book.title,
          currentStock: inv.currentStock,
          maxStock: inv.maxStock,
          rotationRate: analytics?.rotationRate || 0,
        });
      }
    }

    // Promedio de rotación
    const analyticsData = await this.analyticsRepo.find();
    const averageRotationRate =
      analyticsData.reduce((sum, a) => sum + Number(a.rotationRate), 0) /
      (analyticsData.length || 1);

    // Resumen de movimientos
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const movements = await this.movementRepo.find({
      where: {
        createdAt: MoreThan(thirtyDaysAgo),
      },
    });

    const stockMovementsSummary = {
      purchases: movements.filter(m => m.type === MovementType.PURCHASE).length,
      sales: movements.filter(m => m.type === MovementType.SALE).length,
      adjustments: movements.filter(m => m.type === MovementType.ADJUSTMENT).length,
      returns: movements.filter(m => m.type === MovementType.RETURN).length,
    };

    return {
      totalValue,
      totalUnits,
      averageRotationRate,
      lowStockItems,
      overStockItems,
      stockMovementsSummary,
    };
  }

  // Métodos auxiliares privados

  private async getSalesMetricsForPeriod(start: Date, end: Date) {
    const sales = await this.saleRepo.find({
      where: {
        createdAt: Between(start, end),
        status: SaleStatus.COMPLETED,
      },
      relations: ['items'],
    });

    const totalSales = sales.reduce((sum, sale) => sum + sale.items.length, 0);
    const revenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);

    return {
      sales: totalSales,
      revenue,
      orders: sales.length,
    };
  }

  private async getInventorySummary() {
    const inventories = await this.inventoryRepo.find({
      relations: ['book'],
    });

    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const inv of inventories) {
      if (!inv.book) continue;
      
      totalValue += inv.currentStock * Number(inv.book.price);
      
      if (inv.currentStock === 0) {
        outOfStockCount++;
      } else if (inv.currentStock <= inv.minStock) {
        lowStockCount++;
      }
    }

    return {
      totalValue,
      totalBooks: inventories.length,
      lowStockCount,
      outOfStockCount,
    };
  }

  private async getTopSellingBooks(
    limit: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const query = this.saleItemRepo
      .createQueryBuilder('item')
      .select('item.bookId', 'bookId')
      .addSelect('book.title', 'bookTitle')
      .addSelect('SUM(item.quantity)', 'unitsSold')
      .addSelect('SUM(item.subtotal)', 'revenue')
      .innerJoin('item.sale', 'sale')
      .innerJoin('item.book', 'book')
      .where('sale.status = :status', { status: SaleStatus.COMPLETED })
      .groupBy('item.bookId')
      .addGroupBy('book.title')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(limit);

    if (startDate && endDate) {
      query.andWhere('sale.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    }

    const results = await query.getRawMany();

    return results.map(r => ({
      bookId: r.bookId,
      title: r.bookTitle,
      unitsSold: parseInt(r.unitsSold),
      revenue: parseFloat(r.revenue),
    }));
  }

  private async getSalesByDay(startDate: Date, endDate: Date) {
    const results = await this.saleRepo
      .createQueryBuilder('sale')
      .select("DATE(sale.createdAt)", 'date')
      .addSelect('COUNT(*)', 'sales')
      .addSelect('SUM(sale.total)', 'revenue')
      .where('sale.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .andWhere('sale.status = :status', { status: SaleStatus.COMPLETED })
      .groupBy("DATE(sale.createdAt)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return results.map(r => ({
      date: r.date,
      sales: parseInt(r.sales),
      revenue: parseFloat(r.revenue),
    }));
  }

  private async getSalesByCategory(startDate: Date, endDate: Date) {
    const results = await this.saleItemRepo
      .createQueryBuilder('item')
      .select('genre.name', 'category')
      .addSelect('SUM(item.quantity)', 'sales')
      .addSelect('SUM(item.subtotal)', 'revenue')
      .innerJoin('item.sale', 'sale')
      .innerJoin('item.book', 'book')
      .innerJoin('book.genre', 'genre')
      .where('sale.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .andWhere('sale.status = :status', { status: SaleStatus.COMPLETED })
      .groupBy('genre.name')
      .orderBy('SUM(item.quantity)', 'DESC')
      .getRawMany();

    return results.map(r => ({
      category: r.category,
      sales: parseInt(r.sales),
      revenue: parseFloat(r.revenue),
    }));
  }

  private async getSalesByAuthor(startDate: Date, endDate: Date) {
    const results = await this.saleItemRepo
      .createQueryBuilder('item')
      .select('author.name', 'author')
      .addSelect('SUM(item.quantity)', 'sales')
      .addSelect('SUM(item.subtotal)', 'revenue')
      .innerJoin('item.sale', 'sale')
      .innerJoin('item.book', 'book')
      .innerJoin('book.author', 'author')
      .where('sale.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .andWhere('sale.status = :status', { status: SaleStatus.COMPLETED })
      .groupBy('author.name')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(10)
      .getRawMany();

    return results.map(r => ({
      author: r.author,
      sales: parseInt(r.sales),
      revenue: parseFloat(r.revenue),
    }));
  }
}
