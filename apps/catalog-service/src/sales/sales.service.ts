import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  Sale,
  SaleItem,
  Book,
  Inventory,
  CreateSaleDto,
  UpdateSaleStatusDto,
  FilterSaleDto,
  SaleStatus,
  KafkaProducerService,
} from '@cmpc-test/shared';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepo: Repository<SaleItem>,
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  /**
   * Crear una nueva venta
   */
  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    // Validar que todos los libros existan y tengan stock
    const bookIds = createSaleDto.items.map(item => item.bookId);
    const books = await this.bookRepo.findByIds(bookIds);

    if (books.length !== bookIds.length) {
      throw new BadRequestException('Uno o más libros no existen');
    }

    // Verificar disponibilidad de stock
    const inventories = await this.inventoryRepo.find({
      where: bookIds.map(id => ({ bookId: id })),
    });

    const inventoryMap = new Map(inventories.map(inv => [inv.bookId, inv]));

    for (const item of createSaleDto.items) {
      const inventory = inventoryMap.get(item.bookId);
      if (!inventory || inventory.currentStock < item.quantity) {
        const book = books.find(b => b.id === item.bookId);
        throw new BadRequestException(
          `Stock insuficiente para "${book?.title}". Disponible: ${inventory?.currentStock || 0}, Solicitado: ${item.quantity}`
        );
      }
    }

    // Calcular totales
    let subtotal = 0;
    const saleItems: Partial<SaleItem>[] = [];

    for (const item of createSaleDto.items) {
      const book = books.find(b => b.id === item.bookId);
      if (!book) continue;

      const itemSubtotal = Number(book.price) * item.quantity - (item.discount || 0);
      subtotal += itemSubtotal;

      saleItems.push({
        bookId: item.bookId,
        quantity: item.quantity,
        unitPrice: book.price,
        discount: item.discount || 0,
        subtotal: itemSubtotal,
      });
    }

    const discount = createSaleDto.discount || 0;
    const tax = (subtotal - discount) * 0.19; // 19% IVA
    const total = subtotal - discount + tax;

    // Crear la venta
    const sale = this.saleRepo.create({
      status: SaleStatus.PENDING,
      subtotal,
      discount,
      tax,
      total,
      notes: createSaleDto.notes,
      sellerId: createSaleDto.sellerId,
    });

    const savedSale = await this.saleRepo.save(sale);

    // Crear los items
    const items = saleItems.map(item => 
      this.saleItemRepo.create({
        ...item,
        saleId: savedSale.id,
      })
    );

    await this.saleItemRepo.save(items);

    // Reducir stock del inventario
    // for (const item of createSaleDto.items) {
    //   const inventory = inventoryMap.get(item.bookId);
    //   if (inventory) {
    //     inventory.currentStock -= item.quantity;
    //     await this.inventoryRepo.save(inventory);
    //     this.logger.log(`Stock reducido para libro ${item.bookId}: -${item.quantity} (nuevo stock: ${inventory.currentStock})`);
    //   }
    // }

    // Cargar la venta completa con items
    const completeSale = await this.saleRepo.findOne({
      where: { id: savedSale.id },
      relations: ['items'],
    });

    // Emitir evento a Kafka
    this.kafkaProducer.emit('sale.created', {value:completeSale});
    this.logger.log(`Venta creada: ${completeSale?.id}`);

    return completeSale!;
  }

  /**
   * Obtener todas las ventas con filtros
   */
  async findAll(filterDto: FilterSaleDto) {
    const { status, sellerId, startDate, endDate, page = 1, limit = 10 } = filterDto;

    const query = this.saleRepo
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('sale.seller', 'seller')
      .orderBy('sale.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      query.andWhere('sale.status = :status', { status });
    }

    if (sellerId) {
      query.andWhere('sale.sellerId = :sellerId', { sellerId });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Ajustar end date al final del día para incluir todas las ventas de ese día
      end.setHours(23, 59, 59, 999);
      
      query.andWhere('sale.createdAt BETWEEN :start AND :end', {
        start,
        end,
      });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener una venta por ID
   */
  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepo.findOne({
      where: { id },
      relations: ['items', 'seller'],
    });

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return sale;
  }

  /**
   * Actualizar el estado de una venta
   */
  async updateStatus(id: string, updateStatusDto: UpdateSaleStatusDto): Promise<Sale> {
    const sale = await this.findOne(id);

    const previousStatus = sale.status;
    sale.status = updateStatusDto.status;

    // Si se completa la venta
    if (updateStatusDto.status === SaleStatus.COMPLETED) {
      if (!updateStatusDto.paymentMethod) {
        throw new BadRequestException('Método de pago requerido para completar venta');
      }
      
      sale.paymentMethod = updateStatusDto.paymentMethod;
      sale.paymentReference = updateStatusDto.paymentReference;
      sale.paidAt = new Date();

      await this.saleRepo.save(sale);

      // Recargar venta con items para el evento
      const completeSale = await this.findOne(id);

      // Emitir evento a Kafka
      this.kafkaProducer.emit('sale.completed', {value: completeSale});
      this.logger.log(`Venta completada: ${completeSale.id}`);
    } 
    // Si se cancela la venta
    else if (updateStatusDto.status === SaleStatus.CANCELLED) {
      // Restaurar stock al inventario si la venta anterior no estaba cancelada
    //   if (previousStatus !== SaleStatus.CANCELLED) {
    //     for (const item of sale.items) {
        //   const inventory = await this.inventoryRepo.findOne({
        //     where: { bookId: item.bookId },
        //   });
        //   if (inventory) {
        //     inventory.currentStock += item.quantity;
        //     await this.inventoryRepo.save(inventory);
        //     this.logger.log(`Stock restaurado para libro ${item.bookId}: +${item.quantity} (nuevo stock: ${inventory.currentStock})`);
        //   }
    //     }
    //   }

      await this.saleRepo.save(sale);

      // Emitir evento a Kafka
      this.kafkaProducer.emit('sale.cancelled', {value: sale});
      this.logger.log(`Venta cancelada: ${sale.id}`);
    } 
    else {
      await this.saleRepo.save(sale);
    }

    return this.findOne(id);
  }

  /**
   * Obtener resumen de ventas
   */
  async getSummary(startDate: Date, endDate: Date) {
    const sales = await this.saleRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: SaleStatus.COMPLETED,
      },
      relations: ['items'],
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalItems = sales.reduce((sum, sale) => sum + sale.items.reduce((s, i) => s + i.quantity, 0), 0);

    return {
      totalSales,
      totalRevenue,
      totalItems,
      averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
    };
  }
}
