import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  Index
} from 'typeorm';

@Entity('inventory_snapshots')
@Index(['bookId', 'createdAt'])
export class InventorySnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'book_id' })
  bookId!: string;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 0, name: 'units_sold' })
  unitsSold!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0, name: 'total_revenue' })
  totalRevenue!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
