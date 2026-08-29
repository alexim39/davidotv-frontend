import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Premium skeleton loader for 60fps perceived performance.
 * Used for video grids, feed, profile.
 * Zoneless: pure input, no zone.
 */
@Component({
  selector: 'async-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-grid" [attr.aria-busy]="true" aria-label="Loading">
      @for (i of rows; track i) {
        <div class="skeleton-card glass-surface">
          <div class="skeleton thumb"></div>
          <div class="meta">
            <div class="skeleton line title"></div>
            <div class="skeleton line short"></div>
            <div class="skeleton line tinier"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .skeleton-card {
      padding: 0;
      overflow: hidden;
      border-radius: 16px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
    }
    .thumb { height: 160px; background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 37%, rgba(255,255,255,0.06) 63%); background-size: 400% 100%; animation: shimmer 1.4s ease infinite; }
    .meta { padding: 12px; display: grid; gap: 8px; }
    .line { height: 12px; background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 37%, rgba(255,255,255,0.06) 63%); background-size: 400% 100%; animation: shimmer 1.4s ease infinite; border-radius: 6px; }
    .title { width: 85%; height: 14px; }
    .short { width: 55%; }
    .tinier { width: 35%; height: 10px; opacity: 0.7; }
  `]
})
export class SkeletonLoaderComponent {
  @Input() count = 8;
  get rows(): number[] { return Array.from({ length: this.count }, (_, i) => i); }
}
