import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadChildren: () => import('./home/home.route').then(r => r.HomeRoutes) },
  { path: 'legal', loadChildren: () => import('./legal/legal-routes').then(r => r.legalRoutes) },

  // ── New modular feature routes (domain-driven) ──────
  // Talent Hub - Next Global Star (primary rebrand)
  { path: 'talent', loadChildren: () => import('./features/community/talent-hub/talent-hub.routes').then(r => r.TalentHubRoutes) },
  // Media - cached YouTube pipeline
  { path: 'media', loadChildren: () => import('./features/media/media.routes').then(r => r.MediaRoutes) },
  // User profile (isolated domain)
  { path: 'profile', loadComponent: () => import('./features/user-profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard], title: 'Profile — DavidO TV' },
  // Membership billing (pay-as-you-go)
  { path: 'membership', loadChildren: () => import('./features/membership/membership.routes').then(r => r.MembershipRoutes) },
  // Back-compat aliases
  { path: 'upload', redirectTo: 'talent/upload', pathMatch: 'full' },
  { path: 'curated', redirectTo: 'talent/curated', pathMatch: 'full' },
  { path: 'forbidden', loadComponent: () => import('./shared/components/forbidden/forbidden.component').then(m => m.ForbiddenComponent), title: 'Not allowed — DavidO TV' },
  // FE-01: catch-all must stay last
  { path: '**', loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent), title: 'Not found — DavidO TV' },
];
