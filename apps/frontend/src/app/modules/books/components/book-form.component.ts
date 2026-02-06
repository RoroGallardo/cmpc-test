import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BookService } from '../../../core/services/book.service';
import { Author, Genre, Publisher, Book } from '../../../core/models/book.model';

@Component({
  selector: 'app-book-form',
  standalone: false,
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.scss'],
})
export class BookFormComponent implements OnInit {
  bookForm: FormGroup;
  authors: Author[] = [];
  genres: Genre[] = [];
  publishers: Publisher[] = [];
  
  isEditMode = false;
  bookId: string | null = null;
  loading = false;
  error = '';
  imageBase64: string | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      publicationDate: [''],
      stock: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      available: [true, Validators.required],
      authorId: ['', Validators.required],
      genreId: ['', Validators.required],
      publisherId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.bookId = id;
    }
    
    // Cargar primero los datos del formulario (authors, genres, publishers)
    // y luego cargar el libro si estamos en modo edición
    this.loadFormData();
  }

  loadFormData(): void {
    this.loading = true;
    forkJoin({
      authors: this.bookService.getAuthors(),
      genres: this.bookService.getGenres(),
      publishers: this.bookService.getPublishers()
    }).subscribe({
      next: (data) => {
        this.authors = data.authors;
        this.genres = data.genres;
        this.publishers = data.publishers;
        this.loading = false;
        
        // Una vez que tenemos los datos del formulario, cargamos el libro si estamos en modo edición
        if (this.isEditMode && this.bookId) {
          this.loadBook(this.bookId);
        }
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar los datos del formulario';
        this.loading = false;
      }
    });
  }

  loadBook(id: string): void {
    this.loading = true;
    this.bookService.getBook(id).subscribe({
      next: (book) => {
        // Asegurarse de que la fecha esté en formato correcto para el input date
        const publicationDate = book.publicationDate 
          ? new Date(book.publicationDate).toISOString().split('T')[0]
          : '';
        
        this.bookForm.patchValue({
          title: book.title,
          publicationDate: publicationDate,
          stock: book.stock,
          price: book.price,
          available: book.available,
          authorId: book.author.id,
          genreId: book.genre.id,
          publisherId: book.publisher.id,
        });
        
        if (book.imageBase64) {
          this.imagePreview = book.imageBase64;
          this.imageBase64 = book.imageBase64;
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar el libro';
        this.loading = false;
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Convertir a base64
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageBase64 = e.target?.result as string;
        this.imagePreview = this.imageBase64;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.bookForm.invalid) {
      this.markFormGroupTouched(this.bookForm);
      return;
    }

    this.loading = true;
    this.error = '';

    const formValues = this.bookForm.value;
    
    const formData: any = {
      title: formValues.title,
      price: parseFloat(formValues.price),
      available: formValues.available,
      authorId: formValues.authorId,
      genreId: formValues.genreId,
      publisherId: formValues.publisherId,
    };

    // Solo agregar publicationDate si existe
    if (formValues.publicationDate) {
      formData.publicationDate = formValues.publicationDate;
    }

    // Solo agregar stock si es un número válido
    if (formValues.stock !== null && formValues.stock !== '') {
      formData.stock = parseInt(formValues.stock, 10);
    }

    // Solo agregar imageBase64 si existe
    if (this.imageBase64) {
      formData.imageBase64 = this.imageBase64;
    }

    const request = this.isEditMode && this.bookId
      ? this.bookService.updateBook(this.bookId, formData)
      : this.bookService.createBook(formData);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/books']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Error al guardar el libro';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/books']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
