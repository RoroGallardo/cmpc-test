import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SalesListComponent } from './components/sales-list.component';
import { SaleFormComponent } from './components/sale-form.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: SalesListComponent, canActivate: [AuthGuard] },
  { path: 'new', component: SaleFormComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [SalesListComponent, SaleFormComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)],
})
export class SalesModule {}
