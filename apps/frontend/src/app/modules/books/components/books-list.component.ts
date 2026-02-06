import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { BookService } from '../../../core/services/book.service';
import { Book, Author, Genre, Publisher, BookFilters } from '../../../core/models/book.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-books-list',
  standalone: false,
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.scss'],
})
export class BooksListComponent implements OnInit, OnDestroy {
  books: Book[] = [];
  authors: Author[] = [];
  genres: Genre[] = [];
  publishers: Publisher[] = [];
  
  filterForm: FormGroup;
  loading = false;
  error = '';

  // Paginación
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  pageSize = 10;

  // Ordenamiento
  sortBy = 'title';
  sortOrder: 'ASC' | 'DESC' = 'ASC';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      genreId: [''],
      authorId: [''],
      publisherId: [''],
      available: [''],
    });
  }

  ngOnInit(): void {
    this.loadFiltersData();
    this.loadBooks();
    this.setupSearchDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFiltersData(): void {
    this.bookService.getAuthors().subscribe((authors) => (this.authors = authors));
    this.bookService.getGenres().subscribe((genres) => (this.genres = genres));
    this.bookService.getPublishers().subscribe((publishers) => (this.publishers = publishers));
  }

  setupSearchDebounce(): void {
    this.filterForm
      .get('search')
      ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadBooks();
      });
  }

  loadBooks(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    const filters: BookFilters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };

    // Remover valores vacíos
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof BookFilters] === '' || filters[key as keyof BookFilters] === null) {
        delete filters[key as keyof BookFilters];
      }
    });

    this.bookService.getBooks(filters).subscribe({
      next: (response) => {
        this.books = response.data;
        this.totalItems = response.meta.total;
        this.totalPages = response.meta.totalPages;
        this.currentPage = response.meta.page;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar los libros';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadBooks();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadBooks();
  }

  sortByField(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = field;
      this.sortOrder = 'ASC';
    }
    this.loadBooks();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBooks();
    }
  }

  viewBook(id: string): void {
    this.router.navigate(['/books', id]);
  }

  editBook(id: string): void {
    this.router.navigate(['/books', id, 'edit']);
  }

  createBook(): void {
    this.router.navigate(['/books', 'new']);
  }

  deleteBook(id: string): void {
    if (confirm('¿Está seguro de eliminar este libro?')) {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          this.loadBooks();
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al eliminar el libro';
        },
      });
    }
  }

  get pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
