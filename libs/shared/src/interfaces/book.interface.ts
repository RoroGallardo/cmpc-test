import { IAuthor } from './author.interface';
import { IPublisher } from './publisher.interface';
import { IGenre } from './genre.interface';

export interface IBook {
  id: string;
  title: string;
  price: number;
  available: boolean;
  imageUrl?: string;
  
  // IDs para las relaciones
  authorId: string;
  publisherId: string;
  genreId: string;
  
  // Objetos relacionados (eager loading)
  author: IAuthor;
  publisher: IPublisher;
  genre: IGenre;
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}