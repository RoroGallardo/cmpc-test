import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  OneToOne,
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  Index
} from 'typeorm';
import { Author } from './author.entity';
import { Publisher } from './publisher.entity';
import { Genre } from './genre.entity';
import { Inventory } from './inventory.entity';
import { IBook } from '../interfaces/book.interface';

@Entity('books')
@Index(['title', 'authorId', 'genreId'])
export class Book implements IBook {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ length: 300 })
  title!: string;
  
  @Column({ type: 'date', nullable: true })
  publicationDate?: Date;
  
  @Index()
  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Index()
  @Column({ default: true })
  available!: boolean;

  @Column({ type: 'text', nullable: true })
  imageBase64!: string;

  // Relación ManyToOne con Author
  @ManyToOne(() => Author, author => author.books, { 
    eager: true,
    onDelete: 'RESTRICT'
  })
  @JoinColumn({ name: 'author_id' })
  author!: Author;

  @Column({ name: 'author_id' })
  @Index()
  authorId!: string;
  // Relación ManyToOne con Publisher
  @ManyToOne(() => Publisher, publisher => publisher.books, { 
    eager: true,
    onDelete: 'RESTRICT'
  })
  @JoinColumn({ name: 'publisher_id' })
  publisher!: Publisher;

  @Column({ name: 'publisher_id' })
  @Index()
  publisherId!: string;

  // Relación ManyToOne con Genre
  @ManyToOne(() => Genre, genre => genre.books, { 
    eager: true,
    onDelete: 'RESTRICT'
  })
  @JoinColumn({ name: 'genre_id' })
  genre!: Genre;

  @Column({ name: 'genre_id' })
  @Index()
  genreId!: string;

  // Relación OneToOne con Inventory
  @OneToOne(() => Inventory, inventory => inventory.book)
  inventory?: Inventory;

  @Index()
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}