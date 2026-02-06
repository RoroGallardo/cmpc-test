import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Publisher, CreatePublisherDto, UpdatePublisherDto } from '../models/publisher.model';

@Injectable({
  providedIn: 'root',
})
export class PublisherService {
  private readonly API_URL = `${environment.catalogServiceUrl}/publishers`;

  constructor(private http: HttpClient) {}

  getPublishers(): Observable<Publisher[]> {
    return this.http.get<Publisher[]>(this.API_URL);
  }

  getPublisher(id: string): Observable<Publisher> {
    return this.http.get<Publisher>(`${this.API_URL}/${id}`);
  }

  createPublisher(publisher: CreatePublisherDto): Observable<Publisher> {
    return this.http.post<Publisher>(this.API_URL, publisher);
  }

  updatePublisher(id: string, publisher: UpdatePublisherDto): Observable<Publisher> {
    return this.http.patch<Publisher>(`${this.API_URL}/${id}`, publisher);
  }

  deletePublisher(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  exportCSV(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/export/csv`, {
      responseType: 'blob',
    });
  }
}
