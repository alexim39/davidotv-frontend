import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth.guard';
import { adminGuard } from '../../../core/guards/admin.guard';

export const TalentHubRoutes: Routes = [
  { path: 'upload', loadComponent: () => import('./upload.component').then(m => m.TalentUploadComponent), canActivate: [authGuard], title: 'Upload — Next Global Star' },
  { path: 'curated', loadComponent: () => import('./curated-feed.component').then(m => m.CuratedFeedComponent), canActivate: [authGuard, adminGuard], title: 'Curated Feed — Davido' },
  { path: '', loadComponent: () => import('./talent-feed.component').then(m => m.TalentFeedComponent), title: 'Talent Hub — DavidO TV' },
];
