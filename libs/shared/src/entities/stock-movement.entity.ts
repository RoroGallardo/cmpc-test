import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index
} from 'typeorm';
import { Book } from './book.entity';

export enum MovementType {
  PURCHASE = 'PURCHASE',        // Compra a proveedor
  SALE = 'SALE',                // Venta a cliente
  RETURN = 'RETURN',            // Devolución de cliente
  RETURN_TO_SUPPLIER = 'RETURN_TO_SUPPLIER', // Devolución a proveedor
  ADJUSTMENT = 'ADJUSTMENT',    // Ajuste de inventario
  DAMAGE = 'DAMAGE',            // Producto dañado
  LOSS = 'LOSS',                // Pérdida/robo
  TRANSFER = 'TRANSFER',        // Transferencia entre ubicaciones
  RESERVED = 'RESERVED',        // Reserva para orden
  UNRESERVED = 'UNRESERVED'     // Liberación de reserva
}

@Entity('stock_movements')
@Index(['bookId', 'createdAt'])
@Index(['type'])
@Index(['userId'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Relación con Book
  @ManyToOne(() => Book, { 
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'book_id' })
  book!: Book;

  @Column({ name: 'book_id' })
  bookId!: string;

  // Tipo de movimiento
  @Column({
    type: 'enum',
    enum: MovementType
  })
  type!: MovementType;

  // Cantidad (positiva para entradas, negativa para salidas)
  @Column({ type: 'int' })
  quantity!: number;

  // Stock antes y después del movimiento
  @Column({ type: 'int', name: 'stock_before' })
  stockBefore!: number;

  @Column({ type: 'int', name: 'stock_after' })
  stockAfter!: number;

  // Usuario que realizó el movimiento
  @Column({ name: 'user_id', nullable: true })
  userId!: string;

  @Column({ name: 'user_email', nullable: true })
  userEmail!: string;

  // Referencia a transacción/orden relacionada
  @Column({ name: 'reference_id', nullable: true })
  referenceId!: string;

  @Column({ name: 'reference_type', nullable: true })
  referenceType!: string; // 'sale', 'purchase_order', etc.

  // Notas y razón
  @Column({ nullable: true })
  reason!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  // Precio unitario en el momento del movimiento
  @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'unit_price' })
  unitPrice!: number;

  // Valor total del movimiento
  @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'total_value' })
  totalValue!: number;

  // Ubicación origen y destino (para transferencias)
  @Column({ name: 'from_location', nullable: true })
  fromLocation!: string;

  @Column({ name: 'to_location', nullable: true })
  toLocation!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
