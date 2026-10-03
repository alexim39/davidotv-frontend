import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TalentService, TalentUpload } from './talent.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ShortNumberPipe } from '../../../shared/pipes/short-number.pipe';
import { IntersectionDirective } from '../../../shared/directives/intersection.directive';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EnterChallengeDialogComponent } from '../../challenges/enter-dialog.component';

/**
 * Public talent feed - TikTok/Spotify inspired vertical list with play + like/share.
 * Tiered ranking via likeCount/plays (BE sort).
 */
@Component({
  selector: 'async-talent-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule, SkeletonLoaderComponent, ShortNumberPipe, IntersectionDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="feed obsidian-bg">
      <div class="hero glass-surface">
        <h2 class="hero-title">Next Global Star</h2>
        <p class="hero-sub">Discover underground Afrobeat. Your likes & shares push talent to Davido's curated queue.</p>
        <a mat-flat-button class="rose-btn" routerLink="upload"><mat-icon>upload</mat-icon> Upload your track</a>
        <a mat-stroked-button routerLink="/challenges" class="ghost"><mat-icon>emoji_events</mat-icon> Challenges</a>
        <a mat-stroked-button routerLink="curated" class="ghost">Curated (Admin)</a>
      </div>

      @if (loading() && items().length===0) { <async-skeleton-loader [count]="6"/> }
      @else {
        <div class="grid">
          @for (t of items(); track t._id) {
            <div class="card glass-surface">
              <div class="cover" [style.background]="t.coverUrl ? 'url('+t.coverUrl+') center/cover' : 'linear-gradient(135deg,#1A1A1E,#BE123C)'">
                <button class="play-fab" (click)="play(t)"><mat-icon>play_arrow</mat-icon></button>
              </div>
              <div class="body">
                <h3 class="t-title">{{t.title}}</h3>
                <p class="artist">{{t.artistName}} • &#64;{{t.uploader.username}}</p>
                <audio controls [src]="t.fileUrl" preload="metadata" (play)="play(t)"></audio>
                <div class="eng">
                  <button mat-stroked-button (click)="like(t)"><mat-icon [style.color]="likedSet.has(t._id) ? '#FB7185':''">favorite</mat-icon> {{t.likeCount | shortNumber}}</button>
                  <button mat-stroked-button (click)="share(t)"><mat-icon>share</mat-icon> {{t.shareCount | shortNumber}}</button>
                  @if (isMine(t)) {
                    <button mat-stroked-button (click)="enterChallenge(t)"><mat-icon>emoji_events</mat-icon> Enter</button>
                  }
                  <span class="plays"><mat-icon>headphones</mat-icon> {{t.plays | shortNumber}} plays</span>
                </div>
              </div>
            </div>
          }
        </div>
        <div asyncIntersection (intersecting)="loadMore()" class="sentinel"></div>
        @if (loadingMore()) { <async-skeleton-loader [count]="3"/> }
      }
    </section>
  `,
  styles: [`
    .feed{ padding:24px; background:#0B0B0C; min-height:70vh; }
    .hero{ padding:22px; border-radius:20px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10); backdrop-filter:blur(16px); display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin-bottom:18px; }
    .hero-title{ margin:0; font-size:22px; font-weight:800; color:#F8F7F8; flex:1 1 100%; }
    .hero-sub{ color:#A1A1AA; font-size:13px; margin:0; flex:1 1 100%; }
    .rose-btn{ background:linear-gradient(135deg,#BE123C,#E11D48 50%,#FB7185); color:white; border-radius:999px; }
    .ghost{ border-color:rgba(255,255,255,0.18); color:#F8F7F8; border-radius:999px; }
    .grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px; }
    .card{ overflow:hidden; border-radius:20px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); backdrop-filter:blur(14px); }
    .cover{ height:160px; display:grid; place-items:center; position:relative; }
    .play-fab{ width:56px; height:56px; border-radius:50%; border:0; background:rgba(255,255,255,0.92); display:grid; place-items:center; cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,0.35); }
    .body{ padding:14px; display:grid; gap:8px; }
    .t-title{ margin:0; color:#F8F7F8; font-size:16px; font-weight:700; }
    .artist{ margin:0; color:#A1A1AA; font-size:12px; }
    audio{ width:100%; }
    .eng{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .plays{ margin-left:auto; color:#71717A; font-size:12px; display:flex; gap:6px; align-items:center; }
    .sentinel{ height:1px; }
  `]
})
export class TalentFeedComponent implements OnInit {
  private readonly talent = inject(TalentService);
  private readonly analytics = inject(AnalyticsService);
  private readonly auth = inject(AuthStateService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  items = signal<TalentUpload[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  page = signal(1);
  likedSet = new Set<string>();

  ngOnInit(): void { this.loadMore(); }

  loadMore(): void {
    if (this.loadingMore()) return;
    const p = this.page();
    const isFirst = p === 1;
    if (isFirst) this.loading.set(true); else this.loadingMore.set(true);
    this.talent.list({ page: p, limit: 9, sort: '-likeCount,-plays' }).subscribe({
      next: (res:any)=> {
        const data: TalentUpload[] = res?.data ?? res ?? [];
        this.items.update(v=> [...v, ...data]);
        this.page.update(v=>v+1);
        this.loading.set(false); this.loadingMore.set(false);
      },
      error: ()=> { this.loading.set(false); this.loadingMore.set(false); }
    });
  }
  like(t: TalentUpload): void {
    if (this.likedSet.has(t._id)) return;
    this.analytics.track('like', t._id);
    this.talent.like(t._id).subscribe(()=>{ t.likeCount++; this.likedSet.add(t._id); });
  }
  share(t: TalentUpload): void {
    this.analytics.track('share', t._id);
    this.talent.share(t._id).subscribe(()=> t.shareCount++);
    if (navigator.share) navigator.share({ title: t.title, url: location.href }).catch(()=>{});
  }
  play(t: TalentUpload): void {
    this.analytics.track('talent_view', t._id);
    this.talent.play(t._id).subscribe(()=> t.plays++);
  }
  /** Own uploads only — the backend enforces ownership too. */
  isMine(t: TalentUpload): boolean {
    const me = this.auth.user();
    return !!me && t.uploader?.username === me.username;
  }
  enterChallenge(t: TalentUpload): void {
    const me = this.auth.user();
    if (!me) {
      this.snack.open('Sign in to enter challenges.', 'Dismiss', { duration: 3000 });
      return;
    }
    this.dialog.open(EnterChallengeDialogComponent, {
      width: '420px',
      data: { uploadId: t._id, uploadTitle: t.title },
    });
  }
}
