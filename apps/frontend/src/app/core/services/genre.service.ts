import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Genre, CreateGenreDto, UpdateGenreDto } from '../models/genre.model';

@Injectable({
  providedIn: 'root',
})
export class GenreService {
  private readonly API_URL = `${environment.catalogServiceUrl}/genres`;

  constructor(private http: HttpClient) {}

  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(this.API_URL);
  }

  getGenre(id: string): Observable<Genre> {
    return this.http.get<Genre>(`${this.API_URL}/${id}`);
  }

  createGenre(genre: CreateGenreDto): Observable<Genre> {
    return this.http.post<Genre>(this.API_URL, genre);
  }

  updateGenre(id: string, genre: UpdateGenreDto): Observable<Genre> {
    return this.http.patch<Genre>(`${this.API_URL}/${id}`, genre);
  }

  deleteGenre(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  exportCSV(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/export/csv`, {
      responseType: 'blob',
    });
  }
}
