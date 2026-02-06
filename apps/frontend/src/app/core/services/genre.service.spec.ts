import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GenreService } from './genre.service';
import { environment } from '../../../environments/environment';
import { Genre, CreateGenreDto, UpdateGenreDto } from '../models/genre.model';

describe('GenreService', () => {
  let service: GenreService;
  let httpMock: HttpTestingController;

  const mockGenre: Genre = {
    id: '1',
    name: 'Test Genre',
    description: 'Test description',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GenreService],
    });
    service = TestBed.inject(GenreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getGenres', () => {
    it('should get all genres', () => {
      const mockGenres = [mockGenre];

      service.getGenres().subscribe((genres) => {
        expect(genres).toEqual(mockGenres);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/genres`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGenres);
    });
  });

  describe('getGenre', () => {
    it('should get a single genre by id', () => {
      service.getGenre('1').subscribe((genre) => {
        expect(genre).toEqual(mockGenre);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/genres/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGenre);
    });
  });

  describe('createGenre', () => {
    it('should create a new genre', () => {
      const createDto: CreateGenreDto = {
        name: 'New Genre',
        description: 'New description',
      };

      service.createGenre(createDto).subscribe((genre) => {
        expect(genre).toEqual(mockGenre);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/genres`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockGenre);
    });
  });

  describe('updateGenre', () => {
    it('should update a genre', () => {
      const updateDto: UpdateGenreDto = {
        name: 'Updated Genre',
      };

      const updatedGenre = { ...mockGenre, ...updateDto };

      service.updateGenre('1', updateDto).subscribe((genre) => {
        expect(genre).toEqual(updatedGenre);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/genres/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateDto);
      req.flush(updatedGenre);
    });
  });

  describe('deleteGenre', () => {
    it('should delete a genre', () => {
      service.deleteGenre('1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/genres/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('exportCSV', () => {
    it('should export genres as CSV', () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });

      service.exportCSV().subscribe((blob) => {
        expect(blob).toEqual(mockBlob);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/genres/export/csv`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });
});
