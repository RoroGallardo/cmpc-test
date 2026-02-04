import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn, 
  UpdateDateColumn,
  Index
} from 'typeorm';
import { Book } from './book.entity';

export enum SaleStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER'
}

@Entity('sales')
@Index(['customerId'])
@Index(['status'])
@Index(['createdAt'])
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Cliente
  @Column({ name: 'customer_id', nullable: true })
  customerId!: string;

  @Column({ name: 'customer_name', nullable: true })
  customerName!: string;

  @Column({ name: 'customer_email', nullable: true })
  customerEmail!: string;

  // Estado de la venta
  @Column({
    type: 'enum',
    enum: SaleStatus,
    default: SaleStatus.PENDING
  })
  status!: SaleStatus;

  // Totales
  @Column('decimal', { precision: 10, scale: 2, name: 'subtotal' })
  subtotal!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0, name: 'discount' })
  discount!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0, name: 'tax' })
  tax!: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'total' })
  total!: number;

  // Pago
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true
  })
  paymentMethod!: PaymentMethod;

  @Column({ name: 'payment_reference', nullable: true })
  paymentReference!: string;

  @Column({ name: 'paid_at', nullable: true })
  paidAt!: Date;

  // Vendedor
  @Column({ name: 'seller_id', nullable: true })
  sellerId!: string;

  @Column({ name: 'seller_name', nullable: true })
  sellerName!: string;

  // Relación con items de venta
  @OneToMany(() => SaleItem, item => item.sale, { 
    cascade: true,
    eager: true 
  })
  items!: SaleItem[];

  // Notas
  @Column({ type: 'text', nullable: true })
  notes!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ name: 'cancelled_at', nullable: true })
  cancelledAt!: Date;

  @Column({ name: 'cancelled_reason', nullable: true })
  cancelledReason!: string;
}

@Entity('sale_items')
@Index(['saleId'])
@Index(['bookId'])
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Relación con Sale
  @ManyToOne(() => Sale, sale => sale.items, { 
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'sale_id' })
  sale!: Sale;

  @Column({ name: 'sale_id' })
  saleId!: string;

  // Relación con Book
  @ManyToOne(() => Book, { 
    onDelete: 'RESTRICT'
  })
  @JoinColumn({ name: 'book_id' })
  book!: Book;

  @Column({ name: 'book_id' })
  bookId!: string;

  @Column({ name: 'book_title' })
  bookTitle!: string;

  @Column({ name: 'book_isbn', nullable: true })
  bookIsbn!: string;

  // Cantidad y precios
  @Column({ type: 'int' })
  quantity!: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'unit_price' })
  unitPrice!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0, name: 'discount' })
  discount!: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'subtotal' })
  subtotal!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
