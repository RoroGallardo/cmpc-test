import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Book,
  Author,
  Genre,
  Publisher,
  BookFilters,
  PaginatedResponse,
  CreateBookDto,
  UpdateBookDto,
} from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly API_URL = environment.catalogServiceUrl;

  constructor(private http: HttpClient) {}

  getBooks(filters?: BookFilters): Observable<PaginatedResponse<Book>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.genreId) params = params.set('genreId', filters.genreId);
      if (filters.authorId) params = params.set('authorId', filters.authorId);
      if (filters.publisherId) params = params.set('publisherId', filters.publisherId);
      if (filters.available !== undefined) params = params.set('available', filters.available.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get<PaginatedResponse<Book>>(`${this.API_URL}/books`, { params });
  }

  getBook(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.API_URL}/books/${id}`);
  }

  createBook(book: CreateBookDto): Observable<Book> {
    return this.http.post<Book>(`${this.API_URL}/books`, book);
  }

  updateBook(id: string, book: UpdateBookDto): Observable<Book> {
    return this.http.patch<Book>(`${this.API_URL}/books/${id}`, book);
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/books/${id}`);
  }

  getAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(`${this.API_URL}/authors`);
  }

  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.API_URL}/genres`);
  }

  getPublishers(): Observable<Publisher[]> {
    return this.http.get<Publisher[]>(`${this.API_URL}/publishers`);
  }

  exportCSV(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/books/export/csv`, {
      responseType: 'blob',
    });
  }
}
