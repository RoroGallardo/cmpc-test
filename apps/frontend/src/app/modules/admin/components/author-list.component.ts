import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthorService } from '../../../core/services/author.service';
import { Author, CreateAuthorDto, UpdateAuthorDto } from '../../../core/models/author.model';

@Component({
  selector: 'app-author-list',
  standalone: false,
  templateUrl: './author-list.component.html',
  styleUrls: ['./author-list.component.scss'],
})
export class AuthorListComponent implements OnInit {
  authors: Author[] = [];
  loading = false;
  error = '';
  showForm = false;
  authorForm: FormGroup;
  editingAuthor: Author | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private authorService: AuthorService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.authorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      biography: [''],
      birthYear: ['', [Validators.min(1000), Validators.max(new Date().getFullYear())]],
    });
  }

  ngOnInit(): void {
    this.loadAuthors();
  }

  loadAuthors(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();
    this.authorService.getAuthors().subscribe({
      next: (authors) => {
        this.authors = authors;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar autores';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openForm(): void {
    this.showForm = true;
    this.editingAuthor = null;
    this.authorForm.reset();
  }

  editAuthor(author: Author): void {
    this.editingAuthor = author;
    this.showForm = true;
    this.authorForm.patchValue({
      name: author.name,
      biography: author.biography || '',
      birthYear: author.birthYear || '',
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.editingAuthor = null;
    this.authorForm.reset();
  }

  submitForm(): void {
    if (this.authorForm.invalid) {
      this.authorForm.markAllAsTouched();
      return;
    }

    const formValue = this.authorForm.value;
    const authorData = {
      name: formValue.name,
      biography: formValue.biography || undefined,
      birthYear: formValue.birthYear ? parseInt(formValue.birthYear, 10) : undefined,
    };

    if (this.editingAuthor) {
      this.updateAuthor(this.editingAuthor.id, authorData);
    } else {
      this.createAuthor(authorData);
    }
  }

  createAuthor(author: CreateAuthorDto): void {
    this.loading = true;
    this.authorService.createAuthor(author).subscribe({
      next: () => {
        this.loading = false;
        this.closeForm();
        this.loadAuthors();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al crear autor';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateAuthor(id: string, author: UpdateAuthorDto): void {
    this.loading = true;
    this.authorService.updateAuthor(id, author).subscribe({
      next: () => {
        this.loading = false;
        this.closeForm();
        this.loadAuthors();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al actualizar autor';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteAuthor(id: string, name: string): void {
    if (confirm(`¿Está seguro de eliminar el autor "${name}"?`)) {
      this.loading = true;
      this.authorService.deleteAuthor(id).subscribe({
        next: () => {
          this.loading = false;
          this.loadAuthors();
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al eliminar autor';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  exportCSV(): void {
    this.authorService.exportCSV().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `authors-${new Date().getTime()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al exportar CSV';
        this.cdr.detectChanges();
      },
    });
  }
}
