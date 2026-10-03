import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { TalentService, TalentUpload } from '../../features/community/talent-hub/talent.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { ShortNumberPipe } from '../../shared/pipes/short-number.pipe';

/**
 * Home Talent Spotlight — the discovery rail (05-screen-redesign.md §3).
 * Top-ranked uploads (likeCount/plays) with rank numerals + Upload CTA.
 * Loading -> skeleton; empty -> CTA-only header (drives supply);
 * error -> section collapses (no error noise on the landing page).
 */
@Component({
  selector: 'async-talent-spotlight',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, SkeletonLoaderComponent, ShortNumberPipe],
  template: `
    <section class="spotlight" aria-labelledby="spotlight-title" *ngIf="loading() || items().length > 0">
      <div class="head">
        <div>
          <h2 id="spotlight-title" class="title">Talent Spotlight</h2>
          <p class="sub">Rising 30BG sounds, ranked by fans. You could be discovered.</p>
        </div>
        <div class="head-actions">
          <a mat-flat-button class="rose-btn" routerLink="/talent/upload">
            <mat-icon>upload</mat-icon><span>Upload your track</span>
          </a>
          <a mat-stroked-button class="ghost-btn" routerLink="/talent">View all</a>
        </div>
      </div>

      <async-skeleton-loader *ngIf="loading()" [count]="4" />

      <div *ngIf="!loading()" class="rail" role="list">
        <a *ngFor="let t of items(); let i = index; trackBy: trackById"
           class="card" role="listitem" routerLink="/talent"
           [attr.aria-label]="t.title + ' by ' + t.artistName + ', ranked ' + (i + 1)">
          <span class="rank" aria-hidden="true">{{ i + 1 }}</span>
          <span class="cover"
                [style.background]="t.coverUrl ? 'url(' + t.coverUrl + ') center/cover' : 'linear-gradient(135deg,#1A1A1E,#BE123C)'">
            <span *ngIf="t.callUpStatus === 'called_up'" class="called">CALLED UP</span>
          </span>
          <span class="meta">
            <span class="t-title">{{ t.title }}</span>
            <span class="artist">{{ t.artistName }} · {{ t.genre }}</span>
            <span class="stats">
              <mat-icon aria-hidden="true">play_circle</mat-icon>{{ t.plays | shortNumber }}
              <mat-icon aria-hidden="true">favorite</mat-icon>{{ t.likeCount | shortNumber }}
            </span>
          </span>
        </a>
      </div>
    </section>
  `,
  styles: [`
    .spotlight { padding: var(--dt-space-8) var(--dt-gutter) 0; max-width: 1200px; margin: 0 auto; }
    .head { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--dt-space-3); margin-bottom: var(--dt-space-4); }
    .title { margin: 0; font: var(--dt-title); color: var(--dt-text-1); }
    .sub { margin: 4px 0 0; font: var(--dt-body); color: var(--dt-text-2); }
    .head-actions { display: flex; gap: var(--dt-space-2); flex-wrap: wrap; }
    .rose-btn, .ghost-btn { min-height: var(--dt-target); border-radius: var(--dt-radius-pill); }
    .ghost-btn { color: var(--dt-text-1); border-color: var(--dt-line-strong); }
    .rail {
      display: grid; grid-auto-flow: column; grid-auto-columns: minmax(240px, 1fr);
      gap: var(--dt-space-3); overflow-x: auto; scroll-snap-type: x mandatory;
      padding-bottom: var(--dt-space-2);
    }
    .card {
      display: grid; grid-template-columns: auto 1fr; gap: var(--dt-space-3);
      align-items: center; text-decoration: none; scroll-snap-align: start;
      background: var(--dt-card); border: 1px solid var(--dt-line);
      border-radius: var(--dt-radius-card); padding: var(--dt-space-3);
      min-height: var(--dt-target);
    }
    .rank {
      font-size: 40px; font-weight: 800; line-height: 1;
      background: var(--dt-gradient); -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent; min-width: 44px; text-align: center;
    }
    .cover {
      width: 100%; aspect-ratio: 16 / 9; border-radius: var(--dt-radius-sm);
      position: relative; grid-column: 1 / -1; order: -1;
    }
    .called {
      position: absolute; top: 8px; left: 8px;
      background: var(--dt-gradient); color: #fff;
      font: var(--dt-caption); letter-spacing: var(--dt-letter-caption);
      padding: 4px 10px; border-radius: var(--dt-radius-pill);
    }
    .meta { display: grid; gap: 2px; grid-column: 1 / -1; }
    .t-title { font: var(--dt-title-sm); color: var(--dt-text-1); }
    .artist { font: var(--dt-caption); letter-spacing: var(--dt-letter-caption); color: var(--dt-text-3); }
    .stats { display: flex; gap: 6px; align-items: center; font: var(--dt-caption); color: var(--dt-text-3); }
    .stats mat-icon { font-size: 14px; width: 14px; height: 14px; color: var(--dt-accent-3); }
    @media (max-width: 600px) { .head-actions .ghost-btn { display: none; } }
  `]
})
export class TalentSpotlightComponent implements OnInit, OnDestroy {
  private readonly talent = inject(TalentService);
  private sub: Subscription | null = null;

  items = signal<TalentUpload[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.sub = this.talent.list({ page: 1, limit: 6, sort: '-likeCount,-plays' }).subscribe({
      next: (res) => {
        const data = res?.data ?? [];
        this.items.set((Array.isArray(data) ? data : []).filter((t) => t?.callUpStatus !== 'flagged').slice(0, 5));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  trackById(_index: number, t: TalentUpload): string {
    return t._id;
  }
}
