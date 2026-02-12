// Book types
export interface Author {
  id: string;
  name: string;
  biography?: string;
  birthDate?: string;
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
  website?: string;
}

export interface Book {
  id: string;
  title: string;
  publicationDate: string;
  stock: number;
  price: number;
  imageBase64?: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
  author: Author;
  genre: Genre;
  publisher: Publisher;
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
  imageBase64?: string;
  available: boolean;
  authorId: string;
  genreId: string;
  publisherId: string;
}

export interface UpdateBookDto extends Partial<CreateBookDto> {}
