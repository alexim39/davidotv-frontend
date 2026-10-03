import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ChallengeService, Challenge } from './challenge.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

/**
 * Public challenge board. Winners are announced here; entering happens from
 * your own uploads on the talent feed (ownership is checkable client-side).
 */
@Component({
  selector: 'async-challenge-board',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatChipsModule, SkeletonLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="board obsidian-bg">
      <div class="head glass-surface">
        <div>
          <h2 class="title">Fan challenges</h2>
          <p class="sub">Enter your uploads, rally likes, and get crowned by Davido's team.</p>
        </div>
        <mat-chip-set>
          @for (s of filters; track s) {
            <mat-chip (click)="setFilter(s)" [highlighted]="filter()===s">{{s}}</mat-chip>
          }
        </mat-chip-set>
      </div>

      @if (loading()) { <async-skeleton-loader [count]="4"/> }
      @else {
        <div class="grid">
          @for (c of items(); track c._id) {
            <div class="card glass-surface">
              <div class="top">
                <h3 class="c-title">{{c.title}}</h3>
                <span class="status" [attr.data-status]="c.status">{{c.status}}</span>
              </div>
              @if (c.hashtag) { <p class="tag">#{{c.hashtag}}</p> }
              @if (c.description) { <p class="desc">{{c.description}}</p> }
              <p class="dates">
                <mat-icon>event</mat-icon> {{c.startsAt | date:'mediumDate'}} → {{c.endsAt | date:'mediumDate'}}
              </p>
              <div class="foot">
                <span class="entries"><mat-icon>people</mat-icon> {{c.entries.length}} entries</span>
                @if (c.winnerUpload) {
                  <span class="winner"><mat-icon>emoji_events</mat-icon> Winner picked</span>
                } @else {
                  <a mat-stroked-button routerLink="/talent" class="ghost">Enter from talent feed</a>
                }
              </div>
            </div>
          } @empty {
            <p class="empty">No {{filter()}} challenges right now — check back soon.</p>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .board{ padding:24px; background:#0B0B0C; min-height:70vh; display:grid; gap:16px; align-content:start; }
    .head{ display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding:18px; border-radius:20px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10); backdrop-filter:blur(16px); }
    .title{ margin:0; color:#F8F7F8; font-size:20px; font-weight:800; }
    .sub{ margin:6px 0 0; color:#A1A1AA; font-size:12px; }
    .grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px; }
    .card{ padding:18px; border-radius:20px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); backdrop-filter:blur(14px); display:grid; gap:8px; align-content:start; }
    .top{ display:flex; justify-content:space-between; align-items:center; gap:8px; }
    .c-title{ margin:0; color:#F8F7F8; font-size:16px; font-weight:700; }
    .status{ text-transform:uppercase; font-size:10px; font-weight:700; letter-spacing:0.06em; padding:4px 10px; border-radius:999px; background:rgba(255,255,255,0.08); color:#A1A1AA; }
    .status[data-status="active"]{ background:linear-gradient(135deg,#BE123C,#FB7185); color:white; }
    .status[data-status="closed"]{ background:rgba(74,222,128,0.15); color:#4ADE80; }
    .tag{ margin:0; color:#FB7185; font-size:12px; font-weight:600; }
    .desc{ margin:0; color:#A1A1AA; font-size:13px; }
    .dates{ margin:0; color:#71717A; font-size:12px; display:flex; gap:6px; align-items:center; }
    .dates mat-icon{ font-size:16px; width:16px; height:16px; }
    .foot{ display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
    .entries{ color:#A1A1AA; font-size:12px; display:flex; gap:6px; align-items:center; }
    .entries mat-icon{ font-size:16px; width:16px; height:16px; }
    .winner{ color:#4ADE80; font-size:12px; font-weight:700; display:flex; gap:6px; align-items:center; }
    .winner mat-icon{ font-size:16px; width:16px; height:16px; }
    .ghost{ border-color:rgba(255,255,255,0.18); color:#F8F7F8; border-radius:999px; }
    .empty{ color:#71717A; text-align:center; padding:24px; }
  `]
})
export class ChallengeBoardComponent implements OnInit {
  private readonly challenges = inject(ChallengeService);
  items = this.challenges.challenges;
  loading = this.challenges.loading;
  filter = signal<string>('active');
  readonly filters = ['active', 'judging', 'closed'];

  ngOnInit(): void {
    this.challenges.list(this.filter()).subscribe();
  }

  setFilter(s: string): void {
    this.filter.set(s);
    this.challenges.list(s).subscribe();
  }
}
