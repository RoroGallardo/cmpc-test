import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookService } from './book.service';
import { environment } from '../../../environments/environment';
import {
  Book,
  BookFilters,
  PaginatedResponse,
  CreateBookDto,
  UpdateBookDto,
  Author,
  Genre,
  Publisher,
} from '../models/book.model';

describe('BookService', () => {
  let service: BookService;
  let httpMock: HttpTestingController;

  const mockBook: Book = {
    id: '1',
    title: 'Test Book',
    isbn: '123-456-789',
    price: 29.99,
    stock: 10,
    description: 'A test book',
    publishedDate: new Date('2024-01-01'),
    authorId: 'author-1',
    genreId: 'genre-1',
    publisherId: 'publisher-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResponse: PaginatedResponse<Book> = {
    data: [mockBook],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookService],
    });
    service = TestBed.inject(BookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBooks', () => {
    it('should get books without filters', () => {
      service.getBooks().subscribe((response) => {
        expect(response).toEqual(mockPaginatedResponse);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/books`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });

    it('should get books with filters', () => {
      const filters: BookFilters = {
        search: 'test',
        genreId: 'genre-1',
        authorId: 'author-1',
        publisherId: 'publisher-1',
        available: true,
        page: 1,
        limit: 10,
        sortBy: 'title',
        sortOrder: 'asc',
      };

      service.getBooks(filters).subscribe((response) => {
        expect(response).toEqual(mockPaginatedResponse);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${environment.catalogServiceUrl}/books` &&
          request.params.has('search') &&
          request.params.has('genreId') &&
          request.params.has('authorId');
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });
  });

  describe('getBook', () => {
    it('should get a single book by id', () => {
      service.getBook('1').subscribe((book) => {
        expect(book).toEqual(mockBook);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/books/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBook);
    });
  });

  describe('createBook', () => {
    it('should create a new book', () => {
      const createDto: CreateBookDto = {
        title: 'New Book',
        isbn: '987-654-321',
        price: 39.99,
        stock: 5,
        authorId: 'author-1',
        genreId: 'genre-1',
        publisherId: 'publisher-1',
      };

      service.createBook(createDto).subscribe((book) => {
        expect(book).toEqual(mockBook);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/books`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockBook);
    });
  });

  describe('updateBook', () => {
    it('should update a book', () => {
      const updateDto: UpdateBookDto = {
        title: 'Updated Book',
        price: 34.99,
      };

      service.updateBook('1', updateDto).subscribe((book) => {
        expect(book).toEqual(mockBook);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/books/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateDto);
      req.flush(mockBook);
    });
  });

  describe('deleteBook', () => {
    it('should delete a book', () => {
      service.deleteBook('1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/books/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getAuthors', () => {
    it('should get all authors', () => {
      const mockAuthors: Author[] = [
        { id: '1', name: 'Author 1', biography: 'Bio 1', createdAt: new Date(), updatedAt: new Date() },
      ];

      service.getAuthors().subscribe((authors) => {
        expect(authors).toEqual(mockAuthors);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/authors`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAuthors);
    });
  });

  describe('getGenres', () => {
    it('should get all genres', () => {
      const mockGenres: Genre[] = [
        { id: '1', name: 'Genre 1', description: 'Desc 1', createdAt: new Date(), updatedAt: new Date() },
      ];

      service.getGenres().subscribe((genres) => {
        expect(genres).toEqual(mockGenres);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/genres`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGenres);
    });
  });

  describe('getPublishers', () => {
    it('should get all publishers', () => {
      const mockPublishers: Publisher[] = [
        { id: '1', name: 'Publisher 1', country: 'USA', createdAt: new Date(), updatedAt: new Date() },
      ];

      service.getPublishers().subscribe((publishers) => {
        expect(publishers).toEqual(mockPublishers);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/publishers`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPublishers);
    });
  });

  describe('exportCSV', () => {
    it('should export books as CSV', () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });

      service.exportCSV().subscribe((blob) => {
        expect(blob).toEqual(mockBlob);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/books/export/csv`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });
});
