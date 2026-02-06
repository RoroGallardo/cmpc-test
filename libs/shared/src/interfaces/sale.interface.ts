import { IBook } from './book.interface';
import { IUser } from './user.interface';

export interface ISaleItem {
  id: string;
  saleId: string;
  bookId: string;
  book: IBook;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISale {
  id: string;
  status: string; // SaleStatus enum from entity
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod?: string; // PaymentMethod enum from entity
  paymentReference?: string;
  paidAt?: Date;
  sellerId?: string;
  seller?: IUser;
  items: ISaleItem[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
