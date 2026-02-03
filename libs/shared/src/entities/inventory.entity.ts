import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn, 
  UpdateDateColumn,
  Index
} from 'typeorm';
import { Book } from './book.entity';

@Entity('inventory')
@Index(['bookId'])
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Relación con Book
  @ManyToOne(() => Book, { 
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'book_id' })
  book!: Book;

  @Column({ name: 'book_id', unique: true })
  bookId!: string;

  // Stock actual
  @Column({ type: 'int', default: 0, name: 'current_stock' })
  currentStock!: number;

  // Stock mínimo y máximo
  @Column({ type: 'int', default: 10, name: 'min_stock' })
  minStock!: number;

  @Column({ type: 'int', default: 100, name: 'max_stock' })
  maxStock!: number;

  // Stock reservado (para órdenes en proceso)
  @Column({ type: 'int', default: 0, name: 'reserved_stock' })
  reservedStock!: number;

  // Stock disponible = current_stock - reserved_stock
  @Column({ type: 'int', default: 0, name: 'available_stock' })
  availableStock!: number;

  // Ubicación física
  @Column({ nullable: true })
  location!: string;

  @Column({ nullable: true })
  warehouse!: string;

  // Último reabastecimiento
  @Column({ nullable: true, name: 'last_restock_date' })
  lastRestockDate!: Date;

  @Column({ type: 'int', default: 0, name: 'last_restock_quantity' })
  lastRestockQuantity!: number;

  // Proveedor preferido
  @Column({ nullable: true, name: 'preferred_supplier' })
  preferredSupplier!: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'supplier_price' })
  supplierPrice!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
