import { Route } from '@angular/router';
import { LayoutComponent } from './shared/components/layout.component';
import { AuthGuard } from './core/guards/auth.guard';

export const appRoutes: Route[] = [
  { path: 'login', loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule) },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'books', pathMatch: 'full' },
      { path: 'books', loadChildren: () => import('./modules/books/books.module').then((m) => m.BooksModule) },
      { path: 'sales', loadChildren: () => import('./modules/sales/sales.module').then((m) => m.SalesModule) },
      { path: 'admin', loadChildren: () => import('./modules/admin/admin.module').then((m) => m.AdminModule) },
    ],
  },
  { path: '**', redirectTo: '' },
];
