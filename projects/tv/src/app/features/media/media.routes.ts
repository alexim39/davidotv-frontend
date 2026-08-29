import { Routes } from '@angular/router';

export const MediaRoutes: Routes = [
  { path: 'trending', loadComponent: () => import('./trending/trending.component').then(m => m.TrendingComponent), title: 'Trending — DavidO TV' },
  { path: 'official', loadComponent: () => import('./official/official.component').then(m => m.OfficialComponent), title: 'Official — DavidO TV' },
  { path: 'watch/:id', loadComponent: () => import('./player/video-player.component').then(m => m.VideoPlayerComponent), title: 'Watch — DavidO TV' },
  { path: '', redirectTo: 'trending', pathMatch: 'full' }
];
