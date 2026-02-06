import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/user-list.component';
import { UserFormComponent } from './components/user-form.component';
import { DashboardComponent } from './components/dashboard.component';
import { ReportsComponent } from './components/reports.component';
import { PredictiveComponent } from './components/predictive.component';
import { AuthorListComponent } from './components/author-list.component';
import { GenreListComponent } from './components/genre-list.component';
import { PublisherListComponent } from './components/publisher-list.component';
import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AdminGuard] },
  { path: 'users', component: UserListComponent, canActivate: [AdminGuard] },
  { path: 'users/new', component: UserFormComponent, canActivate: [AdminGuard] },
  { path: 'users/:id/edit', component: UserFormComponent, canActivate: [AdminGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [AdminGuard] },
  { path: 'predictive', component: PredictiveComponent, canActivate: [AdminGuard] },
  { path: 'authors', component: AuthorListComponent, canActivate: [AdminGuard] },
  { path: 'genres', component: GenreListComponent, canActivate: [AdminGuard] },
  { path: 'publishers', component: PublisherListComponent, canActivate: [AdminGuard] },
];

@NgModule({
  declarations: [
    UserListComponent,
    UserFormComponent,
    DashboardComponent,
    ReportsComponent,
    PredictiveComponent,
    AuthorListComponent,
    GenreListComponent,
    PublisherListComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)],
})
export class AdminModule {}
