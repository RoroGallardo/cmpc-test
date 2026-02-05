import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  HIGH_DEMAND = 'HIGH_DEMAND',
  LOW_ROTATION = 'LOW_ROTATION',
  PRICE_CHANGE = 'PRICE_CHANGE',
  RESTOCK_NEEDED = 'RESTOCK_NEEDED'
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED'
}

@Entity('alerts')
@Index(['status', 'severity'])
@Index(['type'])
@Index(['createdAt'])
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: AlertType
  })
  type!: AlertType;

  @Column({
    type: 'enum',
    enum: AlertSeverity
  })
  severity!: AlertSeverity;

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.ACTIVE
  })
  status!: AlertStatus;

  @Column({ name: 'book_id', nullable: true })
  bookId!: string;

  @Column({ name: 'book_title', nullable: true })
  bookTitle!: string;

  @Column()
  message!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>;

  @Column({ name: 'acknowledged_by', nullable: true })
  acknowledgedBy!: string;

  @Column({ name: 'acknowledged_at', nullable: true })
  acknowledgedAt!: Date;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
