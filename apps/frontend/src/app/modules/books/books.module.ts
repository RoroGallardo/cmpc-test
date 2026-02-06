import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BooksListComponent } from './components/books-list.component';
import { BookFormComponent } from './components/book-form.component';
import { BookDetailComponent } from './components/book-detail.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: BooksListComponent, canActivate: [AuthGuard] },
  { path: 'new', component: BookFormComponent, canActivate: [AuthGuard] },
  { path: ':id', component: BookDetailComponent, canActivate: [AuthGuard] },
  { path: ':id/edit', component: BookFormComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [BooksListComponent, BookFormComponent, BookDetailComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)],
})
export class BooksModule {}
