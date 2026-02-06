import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SaleService } from '../../../core/services/sale.service';
import { BookService } from '../../../core/services/book.service';
import { Book } from '../../../core/models/book.model';

@Component({
  selector: 'app-sale-form',
  standalone: false,
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.scss'],
})
export class SaleFormComponent implements OnInit {
  saleForm: FormGroup;
  books: Book[] = [];
  loading = false;
  error = '';
  total = 0;

  constructor(
    private fb: FormBuilder,
    private saleService: SaleService,
    private bookService: BookService,
    private router: Router
  ) {
    this.saleForm = this.fb.group({
      items: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks({ available: true }).subscribe({
      next: (response) => {
        this.books = response.data;
        // Agregar primer item después de cargar los libros
        if (this.items.length === 0) {
          this.addItem();
        }
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar libros';
      },
    });
  }

  get items(): FormArray {
    return this.saleForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      bookId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.total = 0;
    this.items.controls.forEach((item) => {
      const bookId = item.get('bookId')?.value;
      const quantity = item.get('quantity')?.value || 0;
      const book = this.books.find((b) => b.id === bookId);
      if (book) {
        this.total += book.price * quantity;
      }
    });
  }

  onBookChange(): void {
    this.calculateTotal();
  }

  onQuantityChange(): void {
    this.calculateTotal();
  }

  onSubmit(): void {
    if (this.saleForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const saleData = {
      items: this.items.value.map((item: any) => ({
        bookId: item.bookId,
        quantity: item.quantity,
      })),
    };

    this.saleService.createSale(saleData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/sales']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Error al crear la venta';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/sales']);
  }
}
