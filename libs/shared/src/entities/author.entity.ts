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
import { IAuthor } from '../interfaces/author.interface';

@Entity('authors')
export class Author implements IAuthor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ length: 200 })
  name!: string;

  @Column('text', { nullable: true })
  biography!: string;

  @Column({ nullable: true })
  birthYear!: number;

  @OneToMany(() => Book, book => book.author)
  books!: Book[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}