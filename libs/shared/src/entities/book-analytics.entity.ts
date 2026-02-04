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

@Entity('book_analytics')
@Index(['bookId'])
export class BookAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Relación con Book (1 a 1)
  @ManyToOne(() => Book, { 
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'book_id' })
  book!: Book;

  @Column({ name: 'book_id', unique: true })
  bookId!: string;

  // Métricas de ventas
  @Column({ type: 'int', default: 0, name: 'total_units_sold' })
  totalUnitsSold!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0, name: 'total_revenue' })
  totalRevenue!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0, name: 'average_sale_price' })
  averageSalePrice!: number;

  // Métricas temporales
  @Column({ type: 'int', default: 0, name: 'sales_last_7_days' })
  salesLast7Days!: number;

  @Column({ type: 'int', default: 0, name: 'sales_last_30_days' })
  salesLast30Days!: number;

  @Column({ type: 'int', default: 0, name: 'sales_last_90_days' })
  salesLast90Days!: number;

  // Rotación de inventario
  @Column('decimal', { precision: 5, scale: 2, default: 0, name: 'rotation_rate' })
  rotationRate!: number; // Veces que se vende el stock por período

  @Column({ type: 'int', default: 0, name: 'days_to_sell' })
  daysToSell!: number; // Días promedio para vender el stock actual

  // Predicciones
  @Column({ type: 'int', nullable: true, name: 'predicted_demand_7_days' })
  predictedDemand7Days!: number;

  @Column({ type: 'int', nullable: true, name: 'predicted_demand_30_days' })
  predictedDemand30Days!: number;

  @Column({ type: 'int', nullable: true, name: 'recommended_restock_quantity' })
  recommendedRestockQuantity!: number;

  // Fechas importantes
  @Column({ nullable: true, name: 'last_sale_date' })
  lastSaleDate!: Date;

  @Column({ nullable: true, name: 'first_sale_date' })
  firstSaleDate!: Date;

  // Última actualización de analytics
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true, name: 'last_calculated_at' })
  lastCalculatedAt!: Date;
}
