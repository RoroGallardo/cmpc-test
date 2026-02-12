// Sale types
export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER'
}

export interface SaleItem {
  id: string;
  bookId: string;
  quantity: number;
  price: number;
  subtotal: number;
  book?: {
    id: string;
    title: string;
    author: string;
  };
}

export interface Sale {
  id: string;
  sellerId?: string;
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'CONFIRMED' | 'REFUNDED';
  paymentMethod?: string;
  paymentReference?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: SaleItem[];
  seller?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateSaleDto {
  items: Array<{
    bookId: string;
    quantity: number;
  }>;
  discount?: number;
  notes?: string;
}

export interface UpdateSaleStatusDto {
  status: 'COMPLETED' | 'CANCELLED';
  paymentMethod?: string;
  paymentReference?: string;
}
