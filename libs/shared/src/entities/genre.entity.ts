import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  Index 
} from 'typeorm';
import { Book } from './book.entity';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ length: 100, unique: true })
  name!: string;
  @Column('text', { nullable: true })
  description!: string;

  @OneToMany(() => Book, book => book.genre)
  books!: Book[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
  
  @DeleteDateColumn()
  deletedAt!: Date;
}