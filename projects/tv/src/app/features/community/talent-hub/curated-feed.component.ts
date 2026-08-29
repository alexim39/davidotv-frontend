import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TalentService, TalentUpload } from './talent.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ShortNumberPipe } from '../../../shared/pipes/short-number.pipe';

/**
 * Davido's Curated Feed - admin-only dashboard.
 * Filter, listen, upvote, flag. Triggers "Call-Up" protocol.
 * Premium list + glass cards + real-time ranking by likeCount/plays.
 */
@Component({
  selector: 'async-curated-feed',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatChipsModule, SkeletonLoaderComponent, ShortNumberPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="curated obsidian-bg">
      <div class="head glass-surface">
        <div>
          <h2 class="title">Curated Feed — Next Global Star</h2>
          <p class="sub">Top talent floats via plays • likes • shares. Click <em>Collaborate</em> to trigger Call-Up.</p>
        </div>
        <mat-chip-set>
          <mat-chip (click)="setFilter('all')" [highlighted]="filter()==='all'">All</mat-chip>
          <mat-chip (click)="setFilter('pending')" [highlighted]="filter()==='pending'">Pending</mat-chip>
          <mat-chip (click)="setFilter('called_up')" [highlighted]="filter()==='called_up'">Called Up</mat-chip>
        </mat-chip-set>
      </div>

      @if (loading()) { <async-skeleton-loader [count]="4"/> }
      @else {
        <div class="list">
          @for (t of visible(); track t._id) {
            <div class="talent-card glass-surface">
              <audio controls [src]="t.fileUrl" preload="metadata" class="audio"></audio>
              <div class="meta">
                <h3 class="t-title">{{t.title}} <span class="genre">{{t.genre}}</span></h3>
                <p class="artist">by {{t.artistName}} • &#64;{{t.uploader.username}}</p>
                <p class="desc">{{t.description}}</p>
                <div class="stats">
                  <span><mat-icon>play_circle</mat-icon> {{t.plays | shortNumber}}</span>
                  <span><mat-icon>favorite</mat-icon> {{t.likeCount | shortNumber}}</span>
                  <span><mat-icon>share</mat-icon> {{t.shareCount | shortNumber}}</span>
                  <span class="status" [attr.data-status]="t.callUpStatus">{{t.callUpStatus}}</span>
                </div>
              </div>
              <div class="actions">
                <button mat-stroked-button (click)="play(t)"><mat-icon>play_arrow</mat-icon> Listen</button>
                <button mat-flat-button class="rose-btn" (click)="callUp(t)" [disabled]="t.callUpStatus==='called_up'">
                  <mat-icon>rocket_launch</mat-icon> {{ t.callUpStatus==='called_up' ? 'Called Up ✓' : 'Collaborate — Call Up' }}
                </button>
                <button mat-button color="warn" (click)="flag(t)"><mat-icon>flag</mat-icon> Flag</button>
              </div>
            </div>
          } @empty {
            <p class="empty">No uploads match filter.</p>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .curated{ padding:24px; background:#0B0B0C; min-height:70vh; }
    .head{ display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding:18px; border-radius:20px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10); backdrop-filter:blur(16px); margin-bottom:16px; }
    .title{ margin:0; color:#F8F7F8; font-size:20px; font-weight:800; }
    .sub{ margin:6px 0 0; color:#A1A1AA; font-size:12px; }
    .list{ display:grid; gap:14px; }
    .talent-card{ display:grid; gap:12px; padding:16px; border-radius:20px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); backdrop-filter:blur(14px); }
    .audio{ width:100%; border-radius:10px; }
    .t-title{ margin:0; color:#F8F7F8; font-size:16px; font-weight:700; }
    .genre{ font-size:11px; color:#FB7185; border:1px solid rgba(251,113,133,0.35); padding:2px 8px; border-radius:999px; margin-left:8px; }
    .artist{ margin:4px 0 0; color:#A1A1AA; font-size:12px; }
    .desc{ margin:8px 0 0; color:#A1A1AA; font-size:13px; }
    .stats{ display:flex; gap:14px; align-items:center; flex-wrap:wrap; color:#71717A; font-size:12px; margin-top:8px; }
    .stats mat-icon{ font-size:16px; width:16px; height:16px; vertical-align:middle; }
    .status{ margin-left:auto; text-transform:uppercase; font-weight:700; letter-spacing:0.06em; font-size:11px; padding:4px 10px; border-radius:999px; background:rgba(255,255,255,0.08); }
    .status[data-status="called_up"]{ background:linear-gradient(135deg,#BE123C,#FB7185); color:white; }
    .actions{ display:flex; gap:10px; flex-wrap:wrap; }
    .rose-btn{ background:linear-gradient(135deg,#BE123C,#E11D48 50%,#FB7185); color:white; border-radius:999px; }
    .empty{ color:#71717A; text-align:center; padding:24px; }
  `]
})
export class CuratedFeedComponent implements OnInit {
  private readonly talent = inject(TalentService);
  items = signal<TalentUpload[]>([]);
  loading = signal(true);
  filter = signal<'all' | 'pending' | 'called_up'>('all');

  visible = () => {
    const f = this.filter();
    return f === 'all' ? this.items() : this.items().filter(i => i.callUpStatus === f);
  };

  ngOnInit(): void {
    this.talent.curatedQueue().subscribe({
      next: (res:any)=> { const data = res?.data ?? res ?? []; this.items.set(Array.isArray(data)?data:[]); this.loading.set(false); },
      error: ()=> this.loading.set(false)
    });
  }

  setFilter(f: 'all' | 'pending' | 'called_up'): void { this.filter.set(f); }
  play(t: TalentUpload): void { this.talent.play(t._id).subscribe(()=> t.plays++); }
  callUp(t: TalentUpload): void {
    this.talent.callUp(t._id).subscribe({
      next: () => { t.callUpStatus = 'called_up'; },
      error: () => {}
    });
  }
  flag(t: TalentUpload): void {
    this.talent.flag(t._id, 'admin flagged').subscribe(()=> t.callUpStatus='flagged');
  }
}
