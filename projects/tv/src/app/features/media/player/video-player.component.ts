import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, effect, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { MediaService, YoutubeVideo } from '../media.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ShortNumberPipe } from '../../../shared/pipes/short-number.pipe';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { VideoCommentsComponent } from './comments/video-comments.component';
import { VideoService } from '../../../common/services/videos.service';
import { Subscription } from 'rxjs';

/** Loads the official YouTube IFrame API once (deterministic player events). */
let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const w = window as unknown as { YT?: { Player?: unknown }; onYouTubeIframeAPIReady?: () => void };
  if (w.YT?.Player) return Promise.resolve();
  if (!ytApiPromise) {
    ytApiPromise = new Promise<void>((resolve) => {
      w.onYouTubeIframeAPIReady = () => resolve();
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.async = true;
      document.head.appendChild(s);
    });
  }
  return ytApiPromise;
}

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
            #ytFrame
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
          <p class="desc" [class.clamped]="!descExpanded()">{{v.description}}</p>
          @if (v.description.length > 200) {
            <button mat-button class="more-btn" (click)="descExpanded.set(!descExpanded())"
                    [attr.aria-expanded]="descExpanded()">
              {{ descExpanded() ? 'Show less' : 'Show more' }}
            </button>
          }
          <div class="actions">
            <button mat-stroked-button (click)="like(v)" [attr.aria-pressed]="liked()"><mat-icon>favorite</mat-icon> {{ likes() }}</button>
            <button mat-stroked-button (click)="toggleSave(v)" [attr.aria-pressed]="saved()">
              <mat-icon>{{ saved() ? 'bookmark' : 'bookmark_border' }}</mat-icon>
              <span>{{ saved() ? 'Saved' : 'Save' }}</span>
            </button>
            <button mat-stroked-button (click)="playPrevious()" [disabled]="!hasPrevious()" aria-label="Play previous video">
              <mat-icon>skip_previous</mat-icon>
            </button>
            <button mat-stroked-button (click)="toggleRepeat()" [attr.aria-pressed]="repeatOne()" aria-label="Repeat current video">
              <mat-icon>repeat_one</mat-icon>
            </button>
            <button mat-stroked-button (click)="playNext()" [disabled]="rail().length === 0" aria-label="Play next video">
              <mat-icon>skip_next</mat-icon><span>Next</span>
            </button>
            <button mat-flat-button class="rose-btn" (click)="share(v)"><mat-icon>share</mat-icon> Share</button>
          </div>
        </div>

        <async-video-comments [videoId]="v.youtubeVideoId" [initial]="v.comments ?? []" />

        <div class="upnext">
          <div class="upnext-head">
            <h2>Up next</h2>
            <div class="upnext-tools">
              <button mat-button class="autoplay-toggle" (click)="toggleAutoplay()"
                      [attr.aria-pressed]="autoplayNext()" aria-label="Toggle autoplay next video">
                <mat-icon>{{ autoplayNext() ? 'autorenew' : 'pause_circle' }}</mat-icon>
                <span>Autoplay {{ autoplayNext() ? 'on' : 'off' }}</span>
              </button>
              <a routerLink="/media/trending">More trending</a>
            </div>
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
                    <span class="play-overlay" aria-hidden="true"><span class="play-btn"><mat-icon>play_arrow</mat-icon></span></span>
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
    .desc.clamped{ display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
    .more-btn{ color:var(--dt-accent-3); font-size:13px; font-weight:600; padding:0; min-height:var(--dt-target); }
    .actions{ display:flex; gap:10px; margin-top:16px; flex-wrap:wrap; }
    .actions button[aria-pressed="true"] mat-icon{ color:var(--dt-accent-3); }
    .rose-btn{ background:linear-gradient(135deg,#BE123C,#E11D48 50%,#FB7185); color:white; border-radius:var(--dt-radius-pill); }
    .upnext{ max-width:1100px; margin:4px auto 0; padding:0 20px 8px; display:grid; gap:12px; }
    .upnext-head{ display:flex; justify-content:space-between; align-items:center; gap:8px; }
    .upnext-head h2{ margin:0; font-size:18px; font-weight:800; color:#F8F7F8; }
    .upnext-tools{ display:flex; gap:4px; align-items:center; }
    .autoplay-toggle{ color:var(--dt-text-2); font-size:12px; min-height:var(--dt-target); }
    .upnext-head a{ font-size:12px; color:var(--dt-accent-3); text-decoration:none; min-height:var(--dt-target); display:inline-flex; align-items:center; }
    .upnext-rail{ display:grid; grid-auto-flow:column; grid-auto-columns:minmax(220px,260px); gap:12px; overflow-x:auto; scroll-snap-type:x mandatory; padding-bottom:8px; }
    .upnext-card{ text-decoration:none; scroll-snap-align:start; display:grid; gap:8px; }
    .upnext-card .thumb{ position:relative; aspect-ratio:16/9; border-radius:var(--dt-radius-card); overflow:hidden; background:var(--dt-sunken); border:1px solid var(--dt-line); }
    .upnext-card img{ width:100%; height:100%; object-fit:cover; display:block; }
    .play-overlay{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 180ms; pointer-events:none; background:radial-gradient(ellipse at center, rgba(0,0,0,0.35), transparent 60%); }
    .upnext-card:hover .play-overlay, .upnext-card:focus-visible .play-overlay{ opacity:1; }
    .play-btn{ width:52px; height:52px; border-radius:50%; background:rgba(255,255,255,0.94); box-shadow:0 8px 24px rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; }
    .play-btn mat-icon{ font-size:28px; width:28px; height:28px; line-height:28px; color:#0B0B0C; }
    @media (hover: none){ .play-overlay{ opacity:1; background:none; } }
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
  private readonly documentTitle = inject(Title);
  private readonly library = inject(VideoService);
  private sub: Subscription | null = null;

  video = signal<YoutubeVideo | null>(null);
  likes = signal(0);
  liked = signal(false);
  saved = signal(false);
  upNext = signal<YoutubeVideo[]>([]);
  upNextLoading = signal(true);
  autoplayNext = signal(this.readAutoplayPref());
  repeatOne = signal(this.readRepeatPref());
  descExpanded = signal(false);
  // Stable trusted URL: embedUrl() mints a NEW SafeResourceUrl object per
  // call, and rebinding [src] reloads the iframe — so compute once per video.
  // (This was the "player restarts on like" bug.)
  embedSrc = signal<SafeResourceUrl | null>(null);
  private readonly currentId = signal('');
  private ytPlayer: { destroy?: () => void; playVideo?: () => void; pauseVideo?: () => void; getPlayerState?: () => number; mute?: () => void; unMute?: () => void; isMuted?: () => boolean } | null = null;
  private readonly onKeyDown = (e: KeyboardEvent) => this.handleKey(e);

  @Input() videoId?: string;
  @ViewChild('ytFrame') private frame?: ElementRef<HTMLIFrameElement>;

  constructor() {
    // Bind the official player API whenever a fresh iframe mounts
    // (initial load, rail hops, repeat replays).
    effect(() => {
      if (this.embedSrc()) {
        setTimeout(() => this.attachPlayer(), 0);
      }
    });
  }

  ngOnInit(): void {
    // Rail taps reuse this component: reload on param change, not just init.
    this.sub = this.route.paramMap.subscribe((params) => {
      const id = this.videoId ?? params.get('id') ?? '';
      if (id) this.loadVideo(id);
    });
    window.addEventListener('keydown', this.onKeyDown);
    // Rail pages are 1-based (page 0 returns empty and starves prev/next).
    this.media.getTrending(12, 1).subscribe({
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

  toggleAutoplay(): void {
    const next = !this.autoplayNext();
    this.autoplayNext.set(next);
    try {
      localStorage.setItem('dtv-autoplay-next', next ? '1' : '0');
    } catch {
      // private mode: preference simply doesn't persist
    }
  }

  private readAutoplayPref(): boolean {
    try {
      return localStorage.getItem('dtv-autoplay-next') !== '0';
    } catch {
      return true;
    }
  }

  /** Manual next-video advance (same target as autoplay-on-ended). */
  playNext(): void {
    const next = this.rail()[0];
    if (next) this.router.navigate(['/media/watch', next.youtubeVideoId]);
  }

  /** Previous video in rail order; none before the first. */
  playPrevious(): void {
    const rail = this.rail();
    const idx = rail.findIndex((v) => v.youtubeVideoId === this.currentId());
    if (idx > 0) this.router.navigate(['/media/watch', rail[idx - 1].youtubeVideoId]);
  }

  hasPrevious(): boolean {
    return this.rail().findIndex((v) => v.youtubeVideoId === this.currentId()) > 0;
  }

  toggleRepeat(): void {
    const next = !this.repeatOne();
    this.repeatOne.set(next);
    try {
      localStorage.setItem('dtv-repeat-one', next ? '1' : '0');
    } catch {
      // private mode: preference simply doesn't persist
    }
  }

  private readRepeatPref(): boolean {
    try {
      return localStorage.getItem('dtv-repeat-one') === '1';
    } catch {
      return false;
    }
  }

  /** Replay the current video (repeat takes precedence over autoplay-next). */
  private replayCurrent(id: string): void {
    this.embedSrc.set(null);
    setTimeout(() => {
      if (this.currentId() === id) this.embedSrc.set(this.trustedEmbed(id, true));
    }, 60);
  }

  /** Official YT.Player binding (deterministic ended events). */
  private attachPlayer(): void {
    const iframe = this.frame?.nativeElement;
    if (!iframe || !iframe.isConnected) return;
    loadYouTubeApi().then(() => {
      try {
        this.ytPlayer?.destroy?.();
      } catch {
        // stale player already gone
      }
      const YT = (window as unknown as { YT?: any }).YT;
      if (!YT?.Player || !iframe.isConnected) return;
      this.ytPlayer = new YT.Player(iframe, {
        events: { onStateChange: (e: { data: number }) => this.onPlayerState(e?.data) },
      });
    });
  }

  /** YT.PlayerState.ENDED === 0. Repeat wins; both off sits on end screen. */
  private onPlayerState(state: number): void {
    if (state !== 0) return;
    if (this.repeatOne()) this.replayCurrent(this.currentId());
    else if (this.autoplayNext()) this.playNext();
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    try {
      this.ytPlayer?.destroy?.();
    } catch {
      // already gone
    }
    this.ytPlayer = null;
    this.sub?.unsubscribe();
  }

  /**
   * Keyboard shortcuts (desktop power users). Never hijack typing or native
   * control activation: inputs and buttons/links keep their default keys.
   * Cross-origin iframe focus swallows keys natively — accepted limitation.
   */
  private handleKey(e: KeyboardEvent): void {
    const t = e.target as HTMLElement | null;
    if (!t || t.closest('input, textarea, select, [contenteditable="true"], button, a')) return;
    const k = e.key.toLowerCase();
    if (k === 'k' || k === ' ') {
      e.preventDefault();
      this.togglePlay();
    } else if (k === 'm') {
      this.toggleMute();
    } else if (k === 'f') {
      this.goFullscreen();
    }
  }

  private togglePlay(): void {
    try {
      if (this.ytPlayer?.getPlayerState?.() === 1) this.ytPlayer?.pauseVideo?.();
      else this.ytPlayer?.playVideo?.();
    } catch {
      // player not ready yet
    }
  }

  private toggleMute(): void {
    try {
      if (this.ytPlayer?.isMuted?.()) this.ytPlayer?.unMute?.();
      else this.ytPlayer?.mute?.();
    } catch {
      // player not ready yet
    }
  }

  private goFullscreen(): void {
    const stage = this.frame?.nativeElement?.closest('.stage') as HTMLElement | null;
    const el = (stage ?? this.frame?.nativeElement) as (HTMLElement & { webkitRequestFullscreen?: () => void }) | undefined;
    try {
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      } else if (el) {
        if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else void el.requestFullscreen();
      }
    } catch {
      // fullscreen unavailable
    }
  }

  private loadVideo(id: string): void {
    this.video.set(null);
    this.embedSrc.set(this.trustedEmbed(id));
    this.currentId.set(id);
    this.descExpanded.set(false);
    this.liked.set(false);
    this.saved.set(false);
    // WEF-01: consumption signal (anon-safe: service skips when signed out).
    this.analytics.track('video_watch', id);
    this.media.getById(id).subscribe({
      next: (res:any)=>{
        const v = res?.data ?? res;
        this.video.set(v);
        this.likes.set(v?.appLikes ?? v?.likes ?? 0);
        if (v?.title) this.documentTitle.setTitle(`${v.title} — DavidoTV`);
        this.refreshSavedState(v?.youtubeVideoId);
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

  private trustedEmbed(id: string, autoplay = true): SafeResourceUrl {
    // Bypass is safe: id is validated to video-id characters only, and the
    // host + path are fixed (plain-string binding blanks the iframe).
    // enablejsapi exposes ended events so autoplay-next can advance.
    const clean = /^[\w-]{6,}$/.test(id || '') ? id : '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${clean}?autoplay=${autoplay ? 1 : 0}&rel=0&enablejsapi=1&origin=${origin}`
    );
  }

  like(v: YoutubeVideo): void {
    const user = this.auth.user();
    if (!user) {
      this.snack.open('Sign in to like videos.', 'Dismiss', { duration: 3000 });
      return;
    }
    this.analytics.track('like', v.youtubeVideoId);
    this.media.like(v.youtubeVideoId, user._id).subscribe({
      next: (r: any) => {
        this.likes.set(r?.appLikes ?? this.likes() + 1);
        this.liked.set(true);
      },
      error: (e) => this.snack.open(e?.message ?? 'Like failed.', 'Dismiss', { duration: 3000 }),
    });
  }
  /** Library save toggle: retention loop with real state (replaces the
   *  feedback-less dislike, which has no count field to display). */
  toggleSave(v: YoutubeVideo): void {
    const user = this.auth.user();
    if (!user) {
      this.snack.open('Sign in to save videos.', 'Dismiss', { duration: 3000 });
      return;
    }
    if (this.saved()) {
      this.library.removeVideoFromLibrary(user._id, v.youtubeVideoId).subscribe({
        next: () => {
          this.saved.set(false);
          this.snack.open('Removed from your library.', 'Close', { duration: 2000 });
        },
        error: (e) => this.snack.open(e?.message ?? 'Could not unsave.', 'Dismiss', { duration: 3000 }),
      });
      return;
    }
    this.library.saveVideoToLibrary(user._id, {
      videoId: v.youtubeVideoId, title: v.title, channel: v.channel,
    }).subscribe({
      next: () => {
        this.saved.set(true);
        this.snack.open('Saved to your library.', 'View', { duration: 3000 })
          .onAction().subscribe(() => this.router.navigate(['/library']));
      },
      error: (e) => this.snack.open(e?.message ?? 'Could not save.', 'Dismiss', { duration: 3000 }),
    });
  }
  private refreshSavedState(youtubeVideoId?: string): void {
    const user = this.auth.user();
    if (!user || !youtubeVideoId) return;
    this.library.getSavedVideos(user._id).subscribe({
      next: (res: any) => {
        const list = res?.data ?? res ?? [];
        this.saved.set(Array.isArray(list) && list.some((s: any) => (s?.videoId ?? s?.youtubeVideoId) === youtubeVideoId));
      },
      error: () => {},
    });
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
