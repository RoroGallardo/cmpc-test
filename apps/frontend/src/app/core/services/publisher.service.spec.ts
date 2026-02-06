import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PublisherService } from './publisher.service';
import { environment } from '../../../environments/environment';
import { Publisher, CreatePublisherDto, UpdatePublisherDto } from '../models/publisher.model';

describe('PublisherService', () => {
  let service: PublisherService;
  let httpMock: HttpTestingController;

  const mockPublisher: Publisher = {
    id: '1',
    name: 'Test Publisher',
    country: 'USA',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PublisherService],
    });
    service = TestBed.inject(PublisherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPublishers', () => {
    it('should get all publishers', () => {
      const mockPublishers = [mockPublisher];

      service.getPublishers().subscribe((publishers) => {
        expect(publishers).toEqual(mockPublishers);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/publishers`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPublishers);
    });
  });

  describe('getPublisher', () => {
    it('should get a single publisher by id', () => {
      service.getPublisher('1').subscribe((publisher) => {
        expect(publisher).toEqual(mockPublisher);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/publishers/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPublisher);
    });
  });

  describe('createPublisher', () => {
    it('should create a new publisher', () => {
      const createDto: CreatePublisherDto = {
        name: 'New Publisher',
        country: 'Canada',
      };

      service.createPublisher(createDto).subscribe((publisher) => {
        expect(publisher).toEqual(mockPublisher);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/publishers`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockPublisher);
    });
  });

  describe('updatePublisher', () => {
    it('should update a publisher', () => {
      const updateDto: UpdatePublisherDto = {
        name: 'Updated Publisher',
      };

      const updatedPublisher = { ...mockPublisher, ...updateDto };

      service.updatePublisher('1', updateDto).subscribe((publisher) => {
        expect(publisher).toEqual(updatedPublisher);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/publishers/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateDto);
      req.flush(updatedPublisher);
    });
  });

  describe('deletePublisher', () => {
    it('should delete a publisher', () => {
      service.deletePublisher('1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/publishers/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('exportCSV', () => {
    it('should export publishers as CSV', () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });

      service.exportCSV().subscribe((blob) => {
        expect(blob).toEqual(mockBlob);
      });

      const req = httpMock.expectOne(`${environment.catalogServiceUrl}/publishers/export/csv`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });
});
