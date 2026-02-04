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

  @Column({ nullable: true })
  warehouse!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
