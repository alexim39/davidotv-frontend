import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Media hub tabs (Trending | Official | Videos | Shorts).
 * One shared strip so the four catalog pages navigate identically.
 */
@Component({
  selector: 'async-media-tabs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="media-tabs" aria-label="Video catalog">
      <a routerLink="/media/trending" routerLinkActive="active" ariaCurrentWhenActive="page"
         [class.active]="active === 'trending'">Trending</a>
      <a routerLink="/media/official" routerLinkActive="active" ariaCurrentWhenActive="page"
         [class.active]="active === 'official'">Official</a>
      <a routerLink="/media/videos" routerLinkActive="active" ariaCurrentWhenActive="page"
         [class.active]="active === 'videos'">All Videos</a>
      <a routerLink="/media/shorts" routerLinkActive="active" ariaCurrentWhenActive="page"
         [class.active]="active === 'shorts'">Shorts</a>
    </nav>
  `,
  styles: [`
    .media-tabs { display: flex; gap: var(--dt-space-2); flex-wrap: wrap; margin-bottom: var(--dt-space-4); }
    .media-tabs a {
      text-decoration: none; font-size: 13px; font-weight: 600;
      color: var(--dt-text-2); padding: 10px 16px; min-height: var(--dt-target);
      display: inline-flex; align-items: center;
      border: 1px solid var(--dt-line); border-radius: var(--dt-radius-pill);
    }
    .media-tabs a.active { background: var(--dt-gradient); color: #fff; border-color: transparent; }
  `]
})
export class MediaTabsComponent {
  @Input() active: 'trending' | 'official' | 'videos' | 'shorts' = 'trending';
}
