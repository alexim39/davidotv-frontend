import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const NotificationRoutes: Routes = [
  { path: 'preferences', loadComponent: () => import('./preferences.component').then(m => m.NotificationPreferencesComponent), canActivate: [authGuard], title: 'Notification preferences — DavidO TV' },
  { path: '', redirectTo: 'preferences', pathMatch: 'full' },
];
