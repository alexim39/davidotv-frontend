import { Component, Input, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MediaService, YoutubeVideo } from '../media.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ShortNumberPipe } from '../../../shared/pipes/short-number.pipe';

/**
 * Premium watch page - responsive 16:9 + glass meta + engagement bar.
 */
@Component({
  selector: 'async-video-player',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule, ShortNumberPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (video(); as v) {
      <div class="player-wrap obsidian-bg">
        <div class="stage">
          <iframe
            [src]="embedUrl(v.youtubeVideoId)"
            title="{{v.title}}"
            frameborder="0"
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
            <button mat-flat-button class="rose-btn"><mat-icon>share</mat-icon> Share</button>
          </div>
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
    .meta{ max-width:1100px; margin:16px auto; padding:20px; border-radius:20px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10); backdrop-filter:blur(16px); }
    .title{ margin:0 0 8px; color:#F8F7F8; font-size:20px; font-weight:700; line-height:1.3; }
    .chan-row{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; color:#A1A1AA; font-size:13px; }
    .badge{ background:linear-gradient(135deg,#BE123C,#FB7185); color:white; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700; }
    .desc{ color:#A1A1AA; font-size:13px; white-space:pre-wrap; margin-top:12px; }
    .actions{ display:flex; gap:10px; margin-top:16px; }
    .rose-btn{ background:linear-gradient(135deg,#BE123C,#E11D48 50%,#FB7185); color:white; border-radius:999px; }
    .loading{ padding:40px; text-align:center; color:#A1A1AA; }
  `]
})
export class VideoPlayerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  private readonly media = inject(MediaService);
  private readonly auth = inject(AuthStateService);
  private readonly analytics = inject(AnalyticsService);

  video = signal<YoutubeVideo | null>(null);
  likes = signal(0);

  @Input() videoId?: string;

  ngOnInit(): void {
    const id = this.videoId ?? this.route.snapshot.paramMap.get('id') ?? '';
    if (!id) return;
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

  embedUrl(id: string): string {
    // Use sanitized trusted url via string - caller should use DomSanitizer in production
    return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
  }

  like(v: YoutubeVideo): void {
    const user = this.auth.user();
    if(!user) return;
    this.analytics.track('like', v.youtubeVideoId);
    this.media.like(v.youtubeVideoId, user._id).subscribe((r:any)=> this.likes.set(r?.appLikes ?? this.likes()+1));
  }
  dislike(v: YoutubeVideo): void {
    const user = this.auth.user();
    if(!user) return;
    this.media.dislike(v.youtubeVideoId, user._id).subscribe();
  }
}
