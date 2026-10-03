import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { TalentService, TalentUpload } from '../talent.service';
import { ShortNumberPipe } from '../../../../shared/pipes/short-number.pipe';

/**
 * Called-Up wall — public success stories (05-screen-redesign.md §3).
 * Proves "I could be discovered": uploads that reached Davido's radar.
 * Server status filter with client-side fallback; collapses when empty
 * or on error (promo-rail policy, same as the home spotlight).
 */
@Component({
  selector: 'async-called-up-wall',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, ShortNumberPipe],
  template: `
    <section class="wall" aria-labelledby="wall-title" *ngIf="items().length > 0">
      <div class="head">
        <mat-icon class="trophy" aria-hidden="true">emoji_events</mat-icon>
        <div>
          <h2 id="wall-title" class="title">Called Up</h2>
          <p class="sub">From uploads to Davido's radar.</p>
        </div>
        <a class="all" routerLink="/talent">Talent Hub</a>
      </div>
      <div class="strip" role="list">
        <a *ngFor="let t of items(); trackBy: trackById" class="story" role="listitem" routerLink="/talent"
           [attr.aria-label]="t.artistName + ', called up for ' + t.title">
          <span class="avatar"
                [style.background]="t.coverUrl ? 'url(' + t.coverUrl + ') center/cover' : 'linear-gradient(135deg,#BE123C,#F59E0B)'">
            <mat-icon aria-hidden="true">verified</mat-icon>
          </span>
          <span class="who">
            <span class="name">{{ t.artistName }}</span>
            <span class="track">“{{ t.title }}”</span>
            <span class="proof">{{ t.plays | shortNumber }} plays · {{ t.likeCount | shortNumber }} likes</span>
          </span>
        </a>
      </div>
    </section>
  `,
  styles: [`
    .wall {
      border-radius: var(--dt-radius-card); padding: var(--dt-space-4);
      background: linear-gradient(135deg, rgba(190, 18, 60, 0.12), rgba(245, 158, 11, 0.08));
      border: 1px solid rgba(245, 158, 11, 0.22);
      display: grid; gap: var(--dt-space-3); margin-bottom: var(--dt-space-4);
    }
    .head { display: flex; align-items: center; gap: var(--dt-space-2); }
    .trophy { color: #F59E0B; font-size: 28px; width: 28px; height: 28px; }
    .title { margin: 0; font: var(--dt-title-sm); color: var(--dt-text-1); }
    .sub { margin: 2px 0 0; font: var(--dt-caption); letter-spacing: var(--dt-letter-caption); color: var(--dt-text-3); }
    .all { margin-left: auto; font: var(--dt-caption); color: var(--dt-accent-3); text-decoration: none; min-height: var(--dt-target); display: inline-flex; align-items: center; }
    .strip { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(220px, 280px); gap: var(--dt-space-2); overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 2px; }
    .story {
      display: flex; gap: var(--dt-space-2); align-items: center; text-decoration: none;
      background: rgba(11, 11, 12, 0.55); border: 1px solid var(--dt-line);
      border-radius: var(--dt-radius-sm); padding: var(--dt-space-2); scroll-snap-align: start;
      min-height: var(--dt-target);
    }
    .avatar {
      width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
      display: grid; place-items: center; color: #fff;
      border: 2px solid rgba(245, 158, 11, 0.55);
    }
    .avatar mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .who { display: grid; gap: 0; min-width: 0; }
    .name { font: var(--dt-body-sm); color: var(--dt-text-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .track { font: var(--dt-caption); color: var(--dt-text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .proof { font: var(--dt-caption); color: var(--dt-text-3); }
  `]
})
export class CalledUpWallComponent implements OnInit, OnDestroy {
  private readonly talent = inject(TalentService);
  private sub: Subscription | null = null;

  items = signal<TalentUpload[]>([]);

  ngOnInit(): void {
    this.sub = this.talent.list({ page: 1, limit: 10, sort: '-likeCount,-plays', status: 'called_up' }).subscribe({
      next: (res) => {
        const data = res?.data ?? [];
        this.items.set(
          (Array.isArray(data) ? data : []).filter((t) => t?.callUpStatus === 'called_up').slice(0, 8)
        );
      },
      error: () => {},
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  trackById(_index: number, t: TalentUpload): string {
    return t._id;
  }
}
