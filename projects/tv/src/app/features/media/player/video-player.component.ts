import { Component, Input, OnDestroy, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MediaService, YoutubeVideo } from '../media.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ShortNumberPipe } from '../../../shared/pipes/short-number.pipe';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { VideoCommentsComponent } from './comments/video-comments.component';
import { Subscription } from 'rxjs';

/**
 * Premium watch page - responsive 16:9 + glass meta + engagement bar.
 */
@Component({
  selector: 'async-video-player',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatSnackBarModule, ShortNumberPipe, SkeletonLoaderComponent, VideoCommentsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (video(); as v) {
      <div class="player-wrap obsidian-bg">
        <div class="stage">
          <iframe
            *ngIf="embedSrc()"
            [src]="embedSrc()"
            title="{{v.title}}"
            allow="autoplay; encrypted-media"
            allowfullscreen
            class="iframe"
          ></iframe>
        </div>
        <div class="meta glass-surface">
          <h1 class="title">{{v.title}}</h1>
          <div class="chan-row">
            <span class="chan">{{v.channel}}</span>
            @if(v.isOfficialContent){<span class="badge">OFFICIAL</span>}
            <span class="views">{{ (v.views ?? 0) | shortNumber }} views</span>
          </div>
          <p class="desc">{{v.description}}</p>
          <div class="actions">
            <button mat-stroked-button (click)="like(v)"><mat-icon>favorite</mat-icon> {{ likes() }}</button>
            <button mat-stroked-button (click)="dislike(v)"><mat-icon>thumb_down</mat-icon></button>
            <button mat-flat-button class="rose-btn" (click)="share(v)"><mat-icon>share</mat-icon> Share</button>
          </div>
        </div>

        <async-video-comments [videoId]="v.youtubeVideoId" [initial]="v.comments ?? []" />

        <div class="upnext">
          <div class="upnext-head">
            <h2>Up next</h2>
            <a routerLink="/media/trending">More trending</a>
          </div>
          @if (upNextLoading()) { <async-skeleton-loader [count]="4" /> }
          @else if (rail().length > 0) {
            <div class="upnext-rail" role="list">
              @for (u of rail(); track u.youtubeVideoId) {
                <a class="upnext-card" role="listitem" [routerLink]="['/media/watch', u.youtubeVideoId]"
                   [attr.aria-label]="'Watch ' + u.title">
                  <span class="thumb">
                    <img [src]="'https://i.ytimg.com/vi/' + u.youtubeVideoId + '/mqdefault.jpg'"
                         [alt]="u.title" loading="lazy" />
                    @if (u.isOfficialContent) { <span class="mini-badge">OFFICIAL</span> }
                  </span>
                  <span class="umeta">
                    <span class="utitle">{{ u.title }}</span>
                    <span class="usub">{{ u.channel }} · {{ (u.views ?? 0) | shortNumber }} views</span>
                  </span>
                </a>
              }
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="loading">Loading video…</div>
    }
  `,
  styles: [`
    .player-wrap{ background:#0B0B0C; min-height:100vh; padding:0 0 24px; }
    .stage{ aspect-ratio:16/9; background:black; max-width:1100px; margin:0 auto; }
    .iframe{ width:100%; height:100%; border:0; }
    .meta{ max-width:1100px; margin:16px auto; padding:20px; border-radius:var(--dt-radius-sheet); background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10); backdrop-filter:blur(16px); }
    .title{ margin:0 0 8px; color:#F8F7F8; font-size:20px; font-weight:700; line-height:1.3; }
    .chan-row{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; color:#A1A1AA; font-size:13px; }
    .badge{ background:linear-gradient(135deg,#BE123C,#FB7185); color:white; padding:2px 8px; border-radius:var(--dt-radius-pill); font-size:12px; font-weight:700; }
    .desc{ color:#A1A1AA; font-size:13px; white-space:pre-wrap; margin-top:12px; }
    .actions{ display:flex; gap:10px; margin-top:16px; }
    .rose-btn{ background:linear-gradient(135deg,#BE123C,#E11D48 50%,#FB7185); color:white; border-radius:var(--dt-radius-pill); }
    .upnext{ max-width:1100px; margin:4px auto 0; padding:0 20px 8px; display:grid; gap:12px; }
    .upnext-head{ display:flex; justify-content:space-between; align-items:baseline; }
    .upnext-head h2{ margin:0; font-size:18px; font-weight:800; color:#F8F7F8; }
    .upnext-head a{ font-size:12px; color:var(--dt-accent-3); text-decoration:none; min-height:var(--dt-target); display:inline-flex; align-items:center; }
    .upnext-rail{ display:grid; grid-auto-flow:column; grid-auto-columns:minmax(220px,260px); gap:12px; overflow-x:auto; scroll-snap-type:x mandatory; padding-bottom:8px; }
    .upnext-card{ text-decoration:none; scroll-snap-align:start; display:grid; gap:8px; }
    .upnext-card .thumb{ position:relative; aspect-ratio:16/9; border-radius:var(--dt-radius-card); overflow:hidden; background:var(--dt-sunken); border:1px solid var(--dt-line); }
    .upnext-card img{ width:100%; height:100%; object-fit:cover; display:block; }
    .mini-badge{ position:absolute; top:6px; left:6px; background:linear-gradient(135deg,#BE123C,#FB7185); color:#fff; font-size:12px; font-weight:700; padding:2px 8px; border-radius:var(--dt-radius-pill); }
    .umeta{ display:grid; gap:2px; }
    .utitle{ font-size:13px; font-weight:500; color:#F8F7F8; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .usub{ font-size:12px; color:#A1A1AA; }
    .loading{ padding:40px; text-align:center; color:#A1A1AA; }
  `]
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  private readonly media = inject(MediaService);
  private readonly auth = inject(AuthStateService);
  private readonly analytics = inject(AnalyticsService);
  private readonly sanitizer = inject(DomSanitizer);
  private sub: Subscription | null = null;

  video = signal<YoutubeVideo | null>(null);
  likes = signal(0);
  upNext = signal<YoutubeVideo[]>([]);
  upNextLoading = signal(true);
  // Stable trusted URL: embedUrl() mints a NEW SafeResourceUrl object per
  // call, and rebinding [src] reloads the iframe — so compute once per video.
  // (This was the "player restarts on like" bug.)
  embedSrc = signal<SafeResourceUrl | null>(null);
  private readonly currentId = signal('');

  @Input() videoId?: string;

  ngOnInit(): void {
    // Rail taps reuse this component: reload on param change, not just init.
    this.sub = this.route.paramMap.subscribe((params) => {
      const id = this.videoId ?? params.get('id') ?? '';
      if (id) this.loadVideo(id);
    });
    this.media.getTrending(12).subscribe({
      next: (res) => {
        const list = res?.data ?? [];
        this.upNext.set((Array.isArray(list) ? list : []).filter((v) => v?.youtubeVideoId).slice(0, 9));
        this.upNextLoading.set(false);
      },
      error: () => this.upNextLoading.set(false),
    });
  }

  /** Rail minus the playing video (stays correct across same-route hops). */
  rail(): YoutubeVideo[] {
    const current = this.currentId();
    return this.upNext().filter((v) => v.youtubeVideoId !== current).slice(0, 8);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private loadVideo(id: string): void {
    this.video.set(null);
    this.embedSrc.set(this.trustedEmbed(id));
    this.currentId.set(id);
    // WEF-01: consumption signal (anon-safe: service skips when signed out).
    this.analytics.track('video_watch', id);
    this.media.getById(id).subscribe({
      next: (res:any)=>{
        const v = res?.data ?? res;
        this.video.set(v);
        this.likes.set(v?.appLikes ?? v?.likes ?? 0);
      },
      // Paywall: exclusive videos 403 with upgradeRequired for non-members.
      // Core ApiService normalizes to {status,message,requestId,raw}.
      error: (e: any) => {
        const status = e?.status ?? e?.raw?.status;
        const flag = e?.raw?.error?.upgradeRequired ?? e?.upgradeRequired;
        if (status === 403 && flag) {
          this.snack.open('Members-only video — upgrade to watch.', 'Upgrade', { duration: 4000 });
          this.router.navigate(['/membership']);
        }
      }
    });
  }

  embedUrl(id: string): SafeResourceUrl {
    return this.trustedEmbed(id);
  }

  private trustedEmbed(id: string): SafeResourceUrl {
    // Bypass is safe: id is validated to video-id characters only, and the
    // host + path are fixed (plain-string binding blanks the iframe).
    const clean = /^[\w-]{6,}$/.test(id || '') ? id : '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${clean}?autoplay=0&rel=0`
    );
  }

  like(v: YoutubeVideo): void {
    const user = this.auth.user();
    if (!user) {
      this.snack.open('Sign in to like videos.', 'Dismiss', { duration: 3000 });
      return;
    }
    this.analytics.track('like', v.youtubeVideoId);
    this.media.like(v.youtubeVideoId, user._id).subscribe((r:any)=> this.likes.set(r?.appLikes ?? this.likes()+1));
  }
  dislike(v: YoutubeVideo): void {
    const user = this.auth.user();
    if (!user) {
      this.snack.open('Sign in to rate videos.', 'Dismiss', { duration: 3000 });
      return;
    }
    this.media.dislike(v.youtubeVideoId, user._id).subscribe();
  }
  share(v: YoutubeVideo): void {
    this.analytics.track('share', v.youtubeVideoId);
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: v.title, text: `${v.title} — Watch on DavidoTV`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      this.snack.open('Video link copied to clipboard.', 'Close', { duration: 2000 });
    }
  }
}
