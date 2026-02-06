import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GenreService } from '../../../core/services/genre.service';
import { Genre, CreateGenreDto, UpdateGenreDto } from '../../../core/models/genre.model';

@Component({
  selector: 'app-genre-list',
  standalone: false,
  templateUrl: './genre-list.component.html',
  styleUrls: ['./genre-list.component.scss'],
})
export class GenreListComponent implements OnInit {
  genres: Genre[] = [];
  loading = false;
  error = '';
  showForm = false;
  genreForm: FormGroup;
  editingGenre: Genre | null = null;

  constructor(
    private genreService: GenreService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.genreForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadGenres();
  }

  loadGenres(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();
    this.genreService.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar géneros';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openForm(): void {
    this.showForm = true;
    this.editingGenre = null;
    this.genreForm.reset();
  }

  editGenre(genre: Genre): void {
    this.editingGenre = genre;
    this.showForm = true;
    this.genreForm.patchValue({
      name: genre.name,
      description: genre.description || '',
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.editingGenre = null;
    this.genreForm.reset();
  }

  submitForm(): void {
    if (this.genreForm.invalid) {
      this.genreForm.markAllAsTouched();
      return;
    }

    const formValue = this.genreForm.value;
    const genreData = {
      name: formValue.name,
      description: formValue.description || undefined,
    };

    if (this.editingGenre) {
      this.updateGenre(this.editingGenre.id, genreData);
    } else {
      this.createGenre(genreData);
    }
  }

  createGenre(genre: CreateGenreDto): void {
    this.loading = true;
    this.genreService.createGenre(genre).subscribe({
      next: () => {
        this.loading = false;
        this.closeForm();
        this.loadGenres();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al crear género';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateGenre(id: string, genre: UpdateGenreDto): void {
    this.loading = true;
    this.genreService.updateGenre(id, genre).subscribe({
      next: () => {
        this.loading = false;
        this.closeForm();
        this.loadGenres();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al actualizar género';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteGenre(id: string, name: string): void {
    if (confirm(`¿Está seguro de eliminar el género "${name}"?`)) {
      this.loading = true;
      this.genreService.deleteGenre(id).subscribe({
        next: () => {
          this.loading = false;
          this.loadGenres();
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al eliminar género';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  exportCSV(): void {
    this.genreService.exportCSV().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `genres-${new Date().getTime()}.csv`;
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
