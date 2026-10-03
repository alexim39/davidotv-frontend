import { Routes } from '@angular/router';

export const MediaRoutes: Routes = [
  { path: 'trending', loadComponent: () => import('./trending/trending.component').then(m => m.TrendingComponent), title: 'Trending — DavidoTV' },
  { path: 'official', loadComponent: () => import('./official/official.component').then(m => m.OfficialComponent), title: 'Official — DavidoTV' },
  { path: 'videos', loadComponent: () => import('./videos/videos.component').then(m => m.VideosComponent), title: 'All Videos — DavidoTV' },
  { path: 'shorts', loadComponent: () => import('./shorts/shorts.component').then(m => m.ShortsComponent), title: 'Shorts — DavidoTV' },
  { path: 'watch/:id', loadComponent: () => import('./player/video-player.component').then(m => m.VideoPlayerComponent), title: 'Watch — DavidoTV' },
  { path: '', redirectTo: 'trending', pathMatch: 'full' }
];
