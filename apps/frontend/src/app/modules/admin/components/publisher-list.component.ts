import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PublisherService } from '../../../core/services/publisher.service';
import { Publisher, CreatePublisherDto, UpdatePublisherDto } from '../../../core/models/publisher.model';

@Component({
  selector: 'app-publisher-list',
  standalone: false,
  templateUrl: './publisher-list.component.html',
  styleUrls: ['./publisher-list.component.scss'],
})
export class PublisherListComponent implements OnInit {
  publishers: Publisher[] = [];
  loading = false;
  error = '';
  showForm = false;
  publisherForm: FormGroup;
  editingPublisher: Publisher | null = null;

  constructor(
    private publisherService: PublisherService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.publisherForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      country: [''],
      website: ['', [Validators.pattern(/^https?:\/\/.+/)]],
    });
  }

  ngOnInit(): void {
    this.loadPublishers();
  }

  loadPublishers(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();
    this.publisherService.getPublishers().subscribe({
      next: (publishers) => {
        this.publishers = publishers;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar editoriales';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openForm(): void {
    this.showForm = true;
    this.editingPublisher = null;
    this.publisherForm.reset();
  }

  editPublisher(publisher: Publisher): void {
    this.editingPublisher = publisher;
    this.showForm = true;
    this.publisherForm.patchValue({
      name: publisher.name,
      country: publisher.country || '',
      website: publisher.website || '',
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.editingPublisher = null;
    this.publisherForm.reset();
  }

  submitForm(): void {
    if (this.publisherForm.invalid) {
      this.publisherForm.markAllAsTouched();
      return;
    }

    const formValue = this.publisherForm.value;
    const publisherData = {
      name: formValue.name,
      country: formValue.country || undefined,
      website: formValue.website || undefined,
    };

    if (this.editingPublisher) {
      this.updatePublisher(this.editingPublisher.id, publisherData);
    } else {
      this.createPublisher(publisherData);
    }
  }

  createPublisher(publisher: CreatePublisherDto): void {
    this.loading = true;
    this.publisherService.createPublisher(publisher).subscribe({
      next: () => {
        this.loading = false;
        this.closeForm();
        this.loadPublishers();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al crear editorial';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  updatePublisher(id: string, publisher: UpdatePublisherDto): void {
    this.loading = true;
    this.publisherService.updatePublisher(id, publisher).subscribe({
      next: () => {
        this.loading = false;
        this.closeForm();
        this.loadPublishers();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al actualizar editorial';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deletePublisher(id: string, name: string): void {
    if (confirm(`¿Está seguro de eliminar la editorial "${name}"?`)) {
      this.loading = true;
      this.publisherService.deletePublisher(id).subscribe({
        next: () => {
          this.loading = false;
          this.loadPublishers();
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al eliminar editorial';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  exportCSV(): void {
    this.publisherService.exportCSV().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `publishers-${new Date().getTime()}.csv`;
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
