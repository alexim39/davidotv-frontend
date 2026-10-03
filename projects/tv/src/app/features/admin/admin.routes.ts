import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/admin.guard';

export const AdminRoutes: Routes = [
  { path: '', loadComponent: () => import('./dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [authGuard, adminGuard], title: 'Admin — DavidoTV' },
];
