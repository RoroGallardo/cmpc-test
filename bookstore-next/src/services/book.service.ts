import { env } from '../config/env';
import { Book, Author, Genre, Publisher, BookFilters, PaginatedResponse, CreateBookDto, UpdateBookDto } from '../types/book';
import { authService } from './auth.service';
import { apiClient } from './api-client';

class BookService {
  private baseUrl = env.catalogServiceUrl;

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async getBooks(filters?: BookFilters): Promise<PaginatedResponse<Book>> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.fetch(`${this.baseUrl}/books?${params}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Error desconocido');
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudo obtener libros'}`);
      }

      const data = await response.json();
      
      // Validar que la respuesta tenga la estructura esperada
      if (!data || typeof data !== 'object') {
        return { data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 0 } };
      }
      
      return {
        data: Array.isArray(data.data) ? data.data : [],
        meta: data.meta || { total: 0, page: 1, limit: 12, totalPages: 0 }
      };
    } catch (error) {
      console.error('Error en getBooks:', error);
      // Devolver estructura vacía en lugar de lanzar error para evitar romper la UI
      return { data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 0 } };
    }
  }

  async getBookById(id: string): Promise<Book> {
    const response = await apiClient.fetch(`${this.baseUrl}/books/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener libro');
    }

    return response.json();
  }

  async createBook(data: CreateBookDto): Promise<Book> {
    const response = await apiClient.fetch(`${this.baseUrl}/books`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear libro');
    }

    return response.json();
  }

  async updateBook(id: string, data: UpdateBookDto): Promise<Book> {
    const response = await apiClient.fetch(`${this.baseUrl}/books/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar libro');
    }

    return response.json();
  }

  async deleteBook(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/books/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al eliminar libro');
    }
  }

  // Authors
  async getAuthors(): Promise<Author[]> {
    const response = await fetch(`${this.baseUrl}/authors`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener autores');
    }

    return response.json();
  }

  async createAuthor(data: Omit<Author, 'id'>): Promise<Author> {
    const response = await fetch(`${this.baseUrl}/authors`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear autor');
    }

    return response.json();
  }

  async updateAuthor(id: string, data: Partial<Author>): Promise<Author> {
    const response = await fetch(`${this.baseUrl}/authors/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar autor');
    }

    return response.json();
  }

  async deleteAuthor(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/authors/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al eliminar autor');
    }
  }

  // Genres
  async getGenres(): Promise<Genre[]> {
    const response = await fetch(`${this.baseUrl}/genres`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener géneros');
    }

    return response.json();
  }

  async createGenre(data: Omit<Genre, 'id'>): Promise<Genre> {
    const response = await fetch(`${this.baseUrl}/genres`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear género');
    }

    return response.json();
  }

  async updateGenre(id: string, data: Partial<Genre>): Promise<Genre> {
    const response = await fetch(`${this.baseUrl}/genres/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar género');
    }

    return response.json();
  }

  async deleteGenre(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/genres/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al eliminar género');
    }
  }

  // Publishers
  async getPublishers(): Promise<Publisher[]> {
    const response = await fetch(`${this.baseUrl}/publishers`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener editoriales');
    }

    return response.json();
  }

  async createPublisher(data: Omit<Publisher, 'id'>): Promise<Publisher> {
    const response = await fetch(`${this.baseUrl}/publishers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear editorial');
    }

    return response.json();
  }

  async updatePublisher(id: string, data: Partial<Publisher>): Promise<Publisher> {
    const response = await fetch(`${this.baseUrl}/publishers/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar editorial');
    }

    return response.json();
  }

  async deletePublisher(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/publishers/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al eliminar editorial');
    }
  }
}

export const bookService = new BookService();
