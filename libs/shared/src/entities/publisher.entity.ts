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

@Entity('publishers')
export class Publisher {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ length: 200 })
  name!: string;
  
  @Column({ length: 100, nullable: true })
  country!: string;

  @Column({ nullable: true })
  website!: string;

  @OneToMany(() => Book, book => book.publisher)
  books!: Book[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}