import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AppShellComponent } from './app-shell/app-shell.component';
import { HomeShellChildren } from './home/home.route';

export const routes: Routes = [
  // ── IA canonicalization (docs/design/03-ia-and-navigation.md) ──
  // Legacy video stack -> canonical /media/* (full match: no segment bleed).
  { path: 'videos', redirectTo: '/media/trending', pathMatch: 'full' },
  { path: 'videos/trending', redirectTo: '/media/trending', pathMatch: 'full' },
  { path: 'official', redirectTo: '/media/official', pathMatch: 'full' },
  { path: 'official/videos', redirectTo: '/media/official', pathMatch: 'full' },
  { path: 'watch/:id', redirectTo: '/media/watch/:id', pathMatch: 'full' },
  // ── Persistent shell: navbar + sidenav + footer on every route ──
  {
    path: '',
    component: AppShellComponent,
    children: [
      ...HomeShellChildren,
      // Talent Hub - Next Global Star (primary rebrand)
      { path: 'talent', loadChildren: () => import('./features/community/talent-hub/talent-hub.routes').then(r => r.TalentHubRoutes) },
      // Media - cached YouTube pipeline
      { path: 'media', loadChildren: () => import('./features/media/media.routes').then(r => r.MediaRoutes) },
      // User profile (isolated domain)
      { path: 'profile', loadComponent: () => import('./features/user-profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard], title: 'Profile — DavidoTV' },
      // Membership billing (pay-as-you-go)
      { path: 'membership', loadChildren: () => import('./features/membership/membership.routes').then(r => r.MembershipRoutes) },
      // Notification preferences (NOT-01)
      { path: 'notifications', loadChildren: () => import('./features/notifications/notifications.routes').then(r => r.NotificationRoutes) },
      // Admin console seed (membership overview + paywall toggle)
      { path: 'admin', loadChildren: () => import('./features/admin/admin.routes').then(r => r.AdminRoutes) },
      // Fan challenges (board public, entry from own talent uploads)
      { path: 'challenges', loadChildren: () => import('./features/challenges/challenges.routes').then(r => r.ChallengeRoutes) },
    ]
  },
  { path: 'legal', loadChildren: () => import('./legal/legal-routes').then(r => r.legalRoutes) },
  // Back-compat aliases
  { path: 'upload', redirectTo: 'talent/upload', pathMatch: 'full' },
  { path: 'curated', redirectTo: 'talent/curated', pathMatch: 'full' },
  { path: 'forbidden', loadComponent: () => import('./shared/components/forbidden/forbidden.component').then(m => m.ForbiddenComponent), title: 'Not allowed — DavidoTV' },
  // FE-01: catch-all must stay last
  { path: '**', loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent), title: 'Not found — DavidoTV' },
];
