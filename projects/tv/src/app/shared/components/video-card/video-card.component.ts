import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';
import { TruncatePipe } from '../../pipes/truncate.pipe';

export interface VideoCardData {
  youtubeVideoId: string;
  title: string;
  channel: string;
  thumbnail?: string;
  duration?: string;
  views?: number;
  publishedAt?: string | Date;
  isOfficialContent?: boolean;
}

/**
 * Dumb premium video card - inspired by Spotify/TikTok.
 * Zoneless: OnPush + pure inputs.
 */
@Component({
  selector: 'async-video-card',
  standalone: true,
  imports: [RouterModule, MatIconModule, ShortNumberPipe, TruncatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="video-card" [routerLink]="['/watch', data.youtubeVideoId]" [attr.aria-label]="'Watch ' + data.title">
      <div class="thumb-wrap">
        <img
          [src]="data.thumbnail || ('https://i.ytimg.com/vi/' + data.youtubeVideoId + '/mqdefault.jpg')"
          [alt]="data.title"
          loading="lazy"
          class="thumb"
        />
        @if (data.duration) {
          <span class="duration">{{ data.duration }}</span>
        }
        @if (data.isOfficialContent) {
          <span class="badge official">OFFICIAL</span>
        }
        <span class="play-overlay"><mat-icon>play_arrow</mat-icon></span>
      </div>
      <div class="meta">
        <h3 class="title">{{ data.title | truncate:58 }}</h3>
        <p class="channel">{{ data.channel }}</p>
        <p class="stats">{{ (data.views ?? 0) | shortNumber }} views</p>
      </div>
    </a>
  `,
  styles: [`
    .video-card {
      display: block;
      border-radius: 16px;
      overflow: hidden;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      text-decoration: none;
      color: inherit;
      transition: transform 180ms cubic-bezier(0.4,0,0.2,1), box-shadow 180ms, border-color 180ms;
    }
    .video-card:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 8px 32px rgba(0,0,0,0.55);
      border-color: rgba(255,255,255,0.14);
    }
    .thumb-wrap { position: relative; aspect-ratio: 16/9; overflow: hidden; background: #0B0B0C; }
    .thumb { width: 100%; height: 100%; object-fit: cover; transition: transform 300ms; }
    .video-card:hover .thumb { transform: scale(1.04); }
    .duration {
      position: absolute; bottom: 8px; right: 8px;
      background: rgba(0,0,0,0.75); color: white; font-size: 11px; padding: 2px 6px; border-radius: 6px;
    }
    .badge {
      position: absolute; top: 8px; left: 8px; font-size: 10px; letter-spacing: 0.08em; font-weight: 700;
      padding: 4px 8px; border-radius: 999px; background: linear-gradient(135deg,#BE123C,#FB7185); color: white;
    }
    .play-overlay {
      position: absolute; inset: 0; display: grid; place-items: center; opacity: 0; transition: opacity 180ms;
      background: radial-gradient(ellipse at center, rgba(0,0,0,0.35), transparent 60%);
    }
    .video-card:hover .play-overlay { opacity: 1; }
    .play-overlay mat-icon { background: rgba(255,255,255,0.92); border-radius: 50%; padding: 8px; width: 44px; height: 44px; display: grid; place-items: center; }
    .meta { padding: 12px; display: grid; gap: 4px; }
    .title { font-size: 14px; font-weight: 600; line-height: 1.35; color: #F8F7F8; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 38px; }
    .channel { font-size: 12px; color: #A1A1AA; margin: 0; }
    .stats { font-size: 11px; color: #71717A; margin: 0; }
  `]
})
export class VideoCardComponent {
  @Input({ required: true }) data!: VideoCardData;
}
