import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const MembershipRoutes: Routes = [
  { path: '', loadComponent: () => import('./plans.component').then(m => m.MembershipPlansComponent), title: 'Membership — DavidO TV' },
  { path: 'verify', loadComponent: () => import('./verify.component').then(m => m.MembershipVerifyComponent), canActivate: [authGuard], title: 'Confirming payment — DavidO TV' },
];
