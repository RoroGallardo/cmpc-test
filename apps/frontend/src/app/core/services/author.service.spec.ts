import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthorService } from './author.service';
import { environment } from '../../../environments/environment';
import { Author, CreateAuthorDto, UpdateAuthorDto } from '../models/author.model';

describe('AuthorService', () => {
  let service: AuthorService;
  let httpMock: HttpTestingController;

  const mockAuthor: Author = {
    id: '1',
    name: 'Test Author',
    biography: 'Test biography',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthorService],
    });
    service = TestBed.inject(AuthorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAuthors', () => {
    it('should get all authors', () => {
      const mockAuthors = [mockAuthor];

      service.getAuthors().subscribe((authors) => {
        expect(authors).toEqual(mockAuthors);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/authors`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAuthors);
    });
  });

  describe('getAuthor', () => {
    it('should get a single author by id', () => {
      service.getAuthor('1').subscribe((author) => {
        expect(author).toEqual(mockAuthor);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/authors/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAuthor);
    });
  });

  describe('createAuthor', () => {
    it('should create a new author', () => {
      const createDto: CreateAuthorDto = {
        name: 'New Author',
        biography: 'New biography',
      };

      service.createAuthor(createDto).subscribe((author) => {
        expect(author).toEqual(mockAuthor);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/authors`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockAuthor);
    });
  });

  describe('updateAuthor', () => {
    it('should update an author', () => {
      const updateDto: UpdateAuthorDto = {
        name: 'Updated Author',
      };

      const updatedAuthor = { ...mockAuthor, ...updateDto };

      service.updateAuthor('1', updateDto).subscribe((author) => {
        expect(author).toEqual(updatedAuthor);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/authors/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateDto);
      req.flush(updatedAuthor);
    });
  });

  describe('deleteAuthor', () => {
    it('should delete an author', () => {
      service.deleteAuthor('1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/authors/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('exportCSV', () => {
    it('should export authors as CSV', () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });

      service.exportCSV().subscribe((blob) => {
        expect(blob).toEqual(mockBlob);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/authors/export/csv`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });
});
