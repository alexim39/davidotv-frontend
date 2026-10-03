import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MediaService, YoutubeVideo } from '../media.service';
import { VideoCardComponent } from '../../../shared/components/video-card/video-card.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { IntersectionDirective } from '../../../shared/directives/intersection.directive';

/**
 * Premium trending feed - glass + infinite scroll + skeleton.
 * Zoneless: signals + OnPush.
 */
@Component({
  selector: 'async-feature-trending',
  standalone: true,
  imports: [CommonModule, MatIconModule, VideoCardComponent, SkeletonLoaderComponent, IntersectionDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="trending obsidian-bg">
      <div class="header">
        <h2 class="headline"><mat-icon class="fire" aria-hidden="true">local_fire_department</mat-icon> Trending Now</h2>
        <p class="sub">Most loved Davido moments, refreshed daily by our YouTube pipeline.</p>
      </div>

      @if (loading() && videos().length === 0) {
        <async-skeleton-loader [count]="8" />
      } @else {
        <div class="grid">
          @for (v of videos(); track v.youtubeVideoId) {
            <async-video-card [data]="{
              youtubeVideoId: v.youtubeVideoId,
              title: v.title,
              channel: v.channel,
              views: v.views,
              publishedAt: v.publishedAt,
              duration: v.duration,
              isOfficialContent: v.isOfficialContent
            }"/>
          }
        </div>
        <div asyncIntersection (intersecting)="loadMore()" class="sentinel"></div>
        @if (loading()) { <async-skeleton-loader [count]="4" /> }
        @if (!hasMore()) { <p class="end">You've reached the end ✨</p> }
      }
    </section>
  `,
  styles: [`
    .trending { padding: 24px; background: #0B0B0C; min-height: 60vh; }
    .header { margin-bottom: 18px; }
    .headline { font-size: 24px; font-weight: 800; color:#F8F7F8; margin:0; display:flex; gap:8px; align-items:center; }
    .fire { color: var(--dt-accent-3); font-size: 26px; width: 26px; height: 26px; }
    .sub { color:#A1A1AA; font-size:13px; margin:6px 0 0; }
    .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap:16px; }
    .sentinel { height:1px; }
    .end { text-align:center; color:#71717A; font-size:13px; margin-top:16px; }
  `]
})
export class TrendingComponent implements OnInit {
  private readonly media = inject(MediaService);
  videos = signal<YoutubeVideo[]>([]);
  loading = signal(false);
  // YouTube backend pages are 1-based (page 0 returns empty -> instant end).
  page = signal(1);
  hasMore = signal(true);

  ngOnInit(): void { this.loadMore(); }

  loadMore(): void {
    if (this.loading() || !this.hasMore()) return;
    this.loading.set(true);
    const next = this.page();
    this.media.getTrending(12, next).subscribe({
      next: (res: any) => {
        const list: YoutubeVideo[] = res?.data ?? res ?? [];
        const seen = new Set(this.videos().map((v) => v.youtubeVideoId));
        const fresh = list.filter((v) => v?.youtubeVideoId && !seen.has(v.youtubeVideoId));
        if (list.length === 0 || fresh.length === 0) {
          // Empty page, or a backend that ignores paging (same 12 again):
          // stop instead of looping requests forever.
          this.hasMore.set(false);
        } else {
          this.videos.update((v) => [...v, ...fresh]);
          this.page.update((p) => p + 1);
          if (list.length < 12) this.hasMore.set(false);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
