

export interface Book {
  id: string;
  title: string;
  publicationDate: string;
  stock: number;
  price: number;
  imageUrl?: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
  author: Author;
  genre: Genre;
  publisher: Publisher;
}

export interface Author {
  id: string;
  name: string;
  biography?: string;
}

export interface Genre {
  id: string;
  name: string;
  description?: string;
}

export interface Publisher {
  id: string;
  name: string;
  country?: string;
}

export interface BookFilters {
  search?: string;
  genreId?: string;
  authorId?: string;
  publisherId?: string;
  available?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateBookDto {
  title: string;
  publicationDate: string;
  stock: number;
  price: number;
  authorId: string;
  genreId: string;
  publisherId: string;
  image?: File;
}

export interface UpdateBookDto extends Partial<CreateBookDto> {
  id: string;
}
