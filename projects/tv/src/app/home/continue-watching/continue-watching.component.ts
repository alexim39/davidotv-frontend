import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, EMPTY, switchMap } from 'rxjs';
import { VideoService } from '../../common/services/videos.service';
import { UserService } from '../../common/services/user.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { timeAgo as timeAgoUtil } from '../../common/utils/time.util';

interface ContinueItem {
  videoId: string;
  title: string;
  channel: string;
  watchedAt: string | Date;
  watchProgress: number;
}

/**
 * Home Continue Watching rail (05-screen-redesign.md §1).
 * Unfinished videos (0 < progress < 100), newest first.
 * Anonymous / empty / error -> collapses (personalized-rail policy).
 */
@Component({
  selector: 'async-continue-watching',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, SkeletonLoaderComponent],
  template: `
    <section class="continue" aria-labelledby="continue-title" *ngIf="loading() || items().length > 0">
      <div class="head">
        <h2 id="continue-title" class="title">Continue watching</h2>
        <a class="all" routerLink="/history">History</a>
      </div>

      <async-skeleton-loader *ngIf="loading()" [count]="4" />

      <div *ngIf="!loading()" class="rail" role="list">
        <a *ngFor="let v of items(); trackBy: trackById" class="card" role="listitem"
           [routerLink]="['/media/watch', v.videoId]"
           [attr.aria-label]="'Resume ' + v.title + ', ' + v.watchProgress + '% watched'">
          <span class="thumb">
            <img [src]="'https://i.ytimg.com/vi/' + v.videoId + '/mqdefault.jpg'"
                 [alt]="v.title" loading="lazy" />
            <span class="bar" aria-hidden="true"><span class="fill" [style.width.%]="v.watchProgress"></span></span>
            <span class="pct">{{ v.watchProgress }}%</span>
          </span>
          <span class="meta">
            <span class="t-title">{{ v.title }}</span>
            <span class="sub">{{ v.channel }} · {{ timeAgo(v.watchedAt) }}</span>
          </span>
        </a>
      </div>
    </section>
  `,
  styles: [`
    .continue { padding: var(--dt-space-8) var(--dt-gutter) 0; max-width: 1200px; margin: 0 auto; }
    .head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--dt-space-3); }
    .title { margin: 0; font: var(--dt-title); color: var(--dt-text-1); }
    .all { font: var(--dt-caption); color: var(--dt-accent-3); text-decoration: none; min-height: var(--dt-target); display: inline-flex; align-items: center; }
    .rail {
      display: grid; grid-auto-flow: column; grid-auto-columns: minmax(220px, 260px);
      gap: var(--dt-space-3); overflow-x: auto; scroll-snap-type: x mandatory;
      padding-bottom: var(--dt-space-2);
    }
    .card { text-decoration: none; scroll-snap-align: start; display: grid; gap: var(--dt-space-2); }
    .thumb {
      position: relative; aspect-ratio: 16 / 9; border-radius: var(--dt-radius-card);
      overflow: hidden; background: var(--dt-sunken); border: 1px solid var(--dt-line);
    }
    .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 4px; background: rgba(255, 255, 255, 0.18); }
    .fill { display: block; height: 100%; background: var(--dt-accent-2); }
    .pct {
      position: absolute; right: 6px; bottom: 8px;
      background: rgba(0, 0, 0, 0.75); color: #fff;
      font: var(--dt-caption); padding: 2px 6px; border-radius: var(--dt-radius-sm);
    }
    .meta { display: grid; gap: 2px; }
    .t-title {
      font: var(--dt-body-sm); color: var(--dt-text-1);
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .sub { font: var(--dt-caption); color: var(--dt-text-3); }
  `]
})
export class ContinueWatchingComponent implements OnInit, OnDestroy {
  private readonly videos = inject(VideoService);
  private readonly users = inject(UserService);
  private sub: Subscription | null = null;

  items = signal<ContinueItem[]>([]);
  loading = signal(true);

  timeAgo = timeAgoUtil;

  ngOnInit(): void {
    this.sub = this.users.getCurrentUser$
      .pipe(
        switchMap((u) => {
          if (!u) {
            this.items.set([]);
            this.loading.set(false);
            return EMPTY;
          }
          return this.videos.getWatchHistory(u._id);
        })
      )
      .subscribe({
        next: (res: any) => {
          const list = (res?.data ?? []) as ContinueItem[];
          this.items.set(
            (Array.isArray(list) ? list : [])
              .filter((v) => (v?.watchProgress ?? 0) > 0 && (v?.watchProgress ?? 0) < 100)
              .sort(
                (a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
              )
              .slice(0, 6)
          );
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  trackById(_index: number, v: ContinueItem): string {
    return v.videoId;
  }
}
