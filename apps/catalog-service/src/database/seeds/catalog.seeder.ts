import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { 
  Author, 
  Publisher, 
  Genre, 
  Book, 
  Inventory, 
  StockMovement, 
  Sale, 
  SaleItem, 
  BookAnalytics,
  Alert,
  MovementType,
  AlertType,
  AlertSeverity,
  AlertStatus,
  SaleStatus,
  PaymentMethod,
} from '@cmpc-test/shared';
import {
  SEED_GENRES,
  SEED_AUTHORS,
  SEED_PUBLISHERS,
  SEED_BOOKS,
} from '@cmpc-test/utils';

@Injectable()
export class CatalogSeeder implements OnModuleInit {
  private readonly logger = new Logger(CatalogSeeder.name);

  constructor(
    @InjectRepository(Author)
    private readonly authorsRepository: Repository<Author>,
    @InjectRepository(Publisher)
    private readonly publishersRepository: Repository<Publisher>,
    @InjectRepository(Genre)
    private readonly genresRepository: Repository<Genre>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
    @InjectRepository(BookAnalytics)
    private readonly bookAnalyticsRepository: Repository<BookAnalytics>,
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    const nodeEnv = process.env.NODE_ENV;
    // Solo ejecutar automáticamente en desarrollo
    if (nodeEnv === 'development') {
      await this.seedCatalog();
    }
  }

  async seedCatalog(): Promise<void> {
    // Usar QueryRunner para manejar transacciones manualmente
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar si ya existen datos
      const existingBooks = await queryRunner.manager.count(Book);
      if (existingBooks > 0) {
        this.logger.log('El catálogo ya contiene datos, saltando seed');
        await queryRunner.release();
        return;
      }

      this.logger.log('Iniciando seed del catálogo...');

      // Crear géneros dentro de la transacción
      const genres = await queryRunner.manager.save(Genre, SEED_GENRES);

      // Crear autores dentro de la transacción
      const authors = await queryRunner.manager.save(Author, SEED_AUTHORS);

      // Crear editoriales dentro de la transacción
      const publishers = await queryRunner.manager.save(Publisher, SEED_PUBLISHERS);

      // Crear libros con relaciones dentro de la transacción
      const books = await queryRunner.manager.save(
        Book,
        SEED_BOOKS.map((book) => ({
          title: book.title,
          price: book.price,
          available: book.available,
          authorId: authors[book.authorIndex].id,
          publisherId: publishers[book.publisherIndex].id,
          genreId: genres[book.genreIndex].id,
          imageUrl: book.imageUrl,
        })),
      );

      // Crear inventarios para cada libro
      const inventories = await queryRunner.manager.save(
        Inventory,
        books.map((book, index) => ({
          bookId: book.id,
          currentStock: 50 + index * 10, // Variación de stock
          minStock: 10,
          maxStock: 200,
          warehouse: index % 2 === 0 ? 'Principal' : 'Secundario',
        })),
      );

      // Crear movimientos de stock para cada libro
      const stockMovements = [];
      for (let i = 0; i < books.length; i++) {
        const book = books[i];
        const inventory = inventories[i];
        
        // Compra inicial
        stockMovements.push({
          bookId: book.id,
          type: MovementType.PURCHASE,
          quantity: inventory.currentStock + (i * 5),
          stockBefore: 0,
          stockAfter: inventory.currentStock + (i * 5),
          unitPrice: book.price * 0.6, // 60% del precio de venta (costo)
          notes: 'Compra inicial de inventario',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Hace 60 días
        });

        // Algunas ventas
        if (i % 2 === 0) {
          const saleQuantity = Math.floor(Math.random() * 10) + 1;
          stockMovements.push({
            bookId: book.id,
            type: MovementType.SALE,
            quantity: -saleQuantity,
            stockBefore: inventory.currentStock + (i * 5),
            stockAfter: inventory.currentStock + (i * 5) - saleQuantity,
            unitPrice: book.price,
            notes: 'Venta regular',
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          });
        }

        // Algunos ajustes
        if (i % 3 === 0) {
          stockMovements.push({
            bookId: book.id,
            type: MovementType.ADJUSTMENT,
            quantity: -2,
            stockBefore: inventory.currentStock,
            stockAfter: inventory.currentStock - 2,
            notes: 'Ajuste por inventario físico',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          });
        }
      }
      await queryRunner.manager.save(StockMovement, stockMovements);

      // Crear ventas de ejemplo
      const sales = [];
      const saleItems = [];
      
      for (let i = 0; i < 5; i++) {
        const saleDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items por venta
        const selectedBooks = books.slice(i * 2, i * 2 + itemCount);
        
        let totalAmount = 0;
        selectedBooks.forEach(book => {
          totalAmount += book.price;
        });

        const sale = {
          customerId: `customer-${i + 1}`,
          customerName: `Cliente ${i + 1}`,
          customerEmail: `cliente${i + 1}@example.com`,
          status: i === 0 ? SaleStatus.PENDING : SaleStatus.COMPLETED,
          paymentMethod: i % 2 === 0 ? PaymentMethod.CREDIT_CARD : PaymentMethod.CASH,
          subtotal: totalAmount,
          tax: totalAmount * 0.19, // 19% IVA
          discount: i === 0 ? 5 : 0,
          total: totalAmount + (totalAmount * 0.19) - (i === 0 ? 5 : 0),
          notes: `Venta de ejemplo ${i + 1}`,
          createdAt: saleDate,
        };
        sales.push(sale);
      }

      const savedSales = await queryRunner.manager.save(Sale, sales);

      // Crear items para cada venta
      for (let i = 0; i < savedSales.length; i++) {
        const sale = savedSales[i];
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const selectedBooks = books.slice(i * 2, i * 2 + itemCount);

        for (const book of selectedBooks) {
          const quantity = Math.floor(Math.random() * 2) + 1;
          saleItems.push({
            saleId: sale.id,
            bookId: book.id,
            bookTitle: book.title,
            quantity,
            unitPrice: book.price,
            subtotal: book.price * quantity,
            discount: 0,
          });
        }
      }
      await queryRunner.manager.save(SaleItem, saleItems);

      // Crear analytics para cada libro
      const analytics = await queryRunner.manager.save(
        BookAnalytics,
        books.map((book, index) => ({
          bookId: book.id,
          totalUnitsSold: Math.floor(Math.random() * 100) + 10,
          totalRevenue: (Math.floor(Math.random() * 100) + 10) * book.price,
          salesLast7Days: Math.floor(Math.random() * 10),
          salesLast30Days: Math.floor(Math.random() * 30) + 5,
          salesLast90Days: Math.floor(Math.random() * 90) + 15,
          rotationRate: parseFloat((Math.random() * 2 + 0.5).toFixed(2)), // 0.5 - 2.5
          daysToSell: Math.floor(Math.random() * 60) + 10,
          predictedDemand7Days: Math.floor(Math.random() * 15) + 2,
          predictedDemand30Days: Math.floor(Math.random() * 50) + 10,
          recommendedRestockQuantity: index % 4 === 0 ? Math.floor(Math.random() * 30) + 20 : 0,
          lastCalculatedAt: new Date(),
        })),
      );

      // Crear algunas alertas
      const alerts = [];
      for (let i = 0; i < books.length; i++) {
        const inventory = inventories[i];
        
        // Alerta de stock bajo para algunos libros
        if (inventory.currentStock < inventory.minStock * 1.5) {
          alerts.push({
            bookId: books[i].id,
            type: AlertType.LOW_STOCK,
            severity: AlertSeverity.MEDIUM,
            status: AlertStatus.ACTIVE,
            message: `Stock bajo para "${books[i].title}". Stock actual: ${inventory.currentStock}, Stock mínimo: ${inventory.minStock}`,
            metadata: {
              currentStock: inventory.currentStock,
              minStock: inventory.minStock,
              suggestedOrder: inventory.maxStock - inventory.currentStock,
            },
          });
        }

        // Alerta de alta demanda para libros populares
        if (i % 5 === 0) {
          alerts.push({
            bookId: books[i].id,
            type: AlertType.HIGH_DEMAND,
            severity: AlertSeverity.HIGH,
            status: AlertStatus.ACTIVE,
            message: `Alta demanda detectada para "${books[i].title}"`,
            metadata: {
              salesLast7Days: analytics[i].salesLast7Days,
              predictedDemand: analytics[i].predictedDemand7Days,
            },
          });
        }

        // Alerta de reabastecimiento necesario
        if (i % 7 === 0) {
          alerts.push({
            bookId: books[i].id,
            type: AlertType.RESTOCK_NEEDED,
            severity: AlertSeverity.CRITICAL,
            status: AlertStatus.ACTIVE,
            message: `Se requiere reabastecimiento urgente para "${books[i].title}"`,
            metadata: {
              currentStock: inventory.currentStock,
              recommendedQuantity: analytics[i].recommendedRestockQuantity || 50,
              daysUntilStockout: Math.floor(inventory.currentStock / (analytics[i].salesLast30Days / 30)),
            },
          });
        }
      }
      await queryRunner.manager.save(Alert, alerts);

      // Si todo fue bien, commit de la transacción
      await queryRunner.commitTransaction();

      this.logger.log('✅ Catálogo creado exitosamente!');
      this.logger.log(`📚 Creados ${books.length} libros`);
      this.logger.log(`✍️ Creados ${authors.length} autores`);
      this.logger.log(`🏢 Creadas ${publishers.length} editoriales`);
      this.logger.log(`📖 Creados ${genres.length} géneros`);
      this.logger.log(`📦 Creados ${inventories.length} inventarios`);
      this.logger.log(`📊 Creados ${stockMovements.length} movimientos de stock`);
      this.logger.log(`💰 Creadas ${savedSales.length} ventas con ${saleItems.length} items`);
      this.logger.log(`📈 Creados ${analytics.length} registros de analytics`);
      this.logger.log(`🚨 Creadas ${alerts.length} alertas`);
    } catch (error) {
      // Si hay error, rollback de la transacción
      await queryRunner.rollbackTransaction();
      this.logger.error('Error al crear datos del catálogo (rollback realizado):', error);
      throw error;
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }
}
