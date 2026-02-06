import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Author, CreateAuthorDto, UpdateAuthorDto } from '../models/author.model';

@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  private readonly API_URL = `${environment.catalogServiceUrl}/authors`;

  constructor(private http: HttpClient) {}

  getAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(this.API_URL);
  }

  getAuthor(id: string): Observable<Author> {
    return this.http.get<Author>(`${this.API_URL}/${id}`);
  }

  createAuthor(author: CreateAuthorDto): Observable<Author> {
    return this.http.post<Author>(this.API_URL, author);
  }

  updateAuthor(id: string, author: UpdateAuthorDto): Observable<Author> {
    return this.http.patch<Author>(`${this.API_URL}/${id}`, author);
  }

  deleteAuthor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  exportCSV(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/export/csv`, {
      responseType: 'blob',
    });
  }
}
