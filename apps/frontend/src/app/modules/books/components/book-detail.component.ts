import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../../core/services/book.service';
import { Book } from '../../../core/models/book.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-book-detail',
  standalone: false,
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss'],
})
export class BookDetailComponent implements OnInit {
  book: Book | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBook(id);
    }
  }

  loadBook(id: string): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.bookService.getBook(id).subscribe({
      next: (book) => {
        this.book = book;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar el libro';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }

  editBook(): void {
    if (this.book) {
      this.router.navigate(['/books', this.book.id, 'edit']);
    }
  }

  deleteBook(): void {
    if (this.book && confirm('¿Está seguro de eliminar este libro?')) {
      this.bookService.deleteBook(this.book.id).subscribe({
        next: () => {
          this.router.navigate(['/books']);
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al eliminar el libro';
        },
      });
    }
  }
}
