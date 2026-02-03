import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  Index
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ'
}

export enum AuditEntity {
  BOOK = 'BOOK',
  AUTHOR = 'AUTHOR',
  PUBLISHER = 'PUBLISHER',
  GENRE = 'GENRE'
}

@Entity('audit_logs')
@Index(['entityType', 'entityId'])
@Index(['userId'])
@Index(['action'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Quién realizó el cambio
  @Column({ name: 'user_id', nullable: true })
  userId!: string;

  @Column({ name: 'user_email', nullable: true })
  userEmail!: string;

  // Qué se modificó
  @Column({
    type: 'enum',
    enum: AuditEntity
  })
  entityType!: AuditEntity;

  @Column({ name: 'entity_id' })
  entityId!: string;

  @Column({
    type: 'enum',
    enum: AuditAction
  })
  action!: AuditAction;

  // Detalles del cambio
  @Column({ type: 'jsonb', nullable: true })
  oldValues!: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues!: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  changes!: Record<string, { old: any; new: any }>;

  // Metadata adicional
  @Column({ name: 'ip_address', nullable: true })
  ipAddress!: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent!: string;

  @Column({ nullable: true })
  endpoint!: string;

  @Column({ nullable: true })
  method!: string;

  // Cuándo se realizó el cambio
  @CreateDateColumn()
  createdAt!: Date;
}
