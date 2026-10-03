import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthComponent } from '../auth/auth.component';

@Component({
  selector: 'async-banner',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  animations: [
    trigger('bannerFadeSlide', [
     /* transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]), */
      transition(':leave', [
        animate('400ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30%)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('400ms ease-in', style({ opacity: 0, transform: 'translateX(-30%)' }))
      ])
    ])
  ],
  template: `
    <div class="video-section">
      <div class="video-loader-bar"><div class="progress" [style.width.%]="progress"></div></div>
      <iframe [src]="safeVideoUrl" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
      <div class="banner-overlay"></div>
      <div class="banner-content" [@bannerFadeSlide]>
        <span class="eyebrow">AFROBEAT HOME • NEXT GLOBAL STAR</span>
        <h1 class="banner-title">Welcome to <span class="highlight">DavidoTV</span></h1>
        <span class="banner-subtitle">Built by fans for fans</span>
        <div class="banner-description-wrapper">
          <div *ngIf="isLoading" class="message-loader">Curating vibes…</div>
          <p *ngIf="!isLoading" [@messageAnimation] class="banner-description">{{ messages[currentMessageIndex] }}</p>
        </div>
        <div class="banner-buttons">
          <button mat-flat-button class="rose-btn" (click)="authDialog()"><mat-icon>rocket_launch</mat-icon> Join Now</button>
          <button mat-stroked-button class="ghost-btn" (click)="loadVideos()">Watch Videos</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .video-section { position: relative; width: 100%; height: 86vh; min-height: 520px; overflow: hidden; background: #0B0B0C; }
    .video-section iframe { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; filter: saturate(1.05) brightness(0.92); }
    .banner-overlay {
      position: absolute; inset: 0; z-index: 1;
      background:
        linear-gradient(to right, rgba(11,11,12,0.78) 0%, rgba(11,11,12,0.42) 52%, rgba(11,11,12,0.18) 100%),
        radial-gradient(ellipse at 30% 20%, rgba(225,29,72,0.14), transparent 55%);
    }
    .banner-content {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 2;
      color: #F8F7F8; max-width: 720px; text-align: center; padding: 1rem; width: 92%;
    }
    .eyebrow {
      display: inline-block; font-size: 11px; letter-spacing: 0.14em; font-weight: 700; color: #FB7185;
      border: 1px solid rgba(251,113,133,0.28); background: rgba(225,29,72,0.10); padding: 6px 10px; border-radius: var(--dt-radius-pill); margin-bottom: 12px;
      backdrop-filter: blur(8px);
    }
    .banner-title { font-size: clamp(2.4rem,5vw,3.4rem); font-weight: 800; letter-spacing: -0.02em; margin: 0 0 8px; line-height: 1.05; }
    .banner-subtitle { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dt-text-2, #C9C9D1); border-radius: var(--dt-radius-pill); padding: 6px 10px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); backdrop-filter: blur(8px); }
    .highlight { background: linear-gradient(135deg,#BE123C 0%,#E11D48 50%,#FB7185 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
    .banner-description-wrapper { min-height: 84px; display: flex; align-items: center; justify-content: center; margin: 14px 0 0; }
    .banner-description { font-size: clamp(1rem,2.2vw,1.18rem); color: #E4E4E7; line-height: 1.6; max-width: 640px; text-shadow: 0 2px 18px rgba(0,0,0,0.45); }
    .message-loader { font-size: 13px; color: #A1A1AA; letter-spacing: 0.06em; animation: fade 0.8s ease-in-out infinite alternate; }
    @keyframes fade { from { opacity: 0.45; } to { opacity: 1; } }
    .banner-buttons { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 22px; }
    .rose-btn { background: linear-gradient(135deg,#BE123C,#E11D48 50%,#FB7185) !important; color: white !important; border-radius: var(--dt-radius-pill) !important; padding: 0 22px !important; height: 44px; font-weight: 700; box-shadow: 0 8px 24px rgba(225,29,72,0.35); display: inline-flex; gap: 8px; align-items: center; }
    .ghost-btn { border-radius: var(--dt-radius-pill) !important; height: 44px; padding: 0 22px !important; color: #F8F7F8 !important; border-color: rgba(255,255,255,0.16) !important; background: rgba(255,255,255,0.06) !important; backdrop-filter: blur(10px); font-weight: 600; }
    .ghost-btn:hover { background: rgba(255,255,255,0.10) !important; border-color: rgba(255,255,255,0.22) !important; }
    .video-loader-bar { position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: rgba(255,255,255,0.08); z-index: 3; }
    .video-loader-bar .progress { height: 100%; background: linear-gradient(90deg,#BE123C,#FB7185); box-shadow: 0 0 10px rgba(225,29,72,0.45); transition: width 1s linear; }
    @media (max-width: 768px) {
      .video-section { height: 78vh; }
      .banner-title { font-size: 2.1rem; }
      .banner-description { font-size: 1rem; }
      .banner-buttons { flex-direction: column; align-items: stretch; max-width: 320px; margin: 18px auto 0; }
      .banner-buttons button { width: 100%; justify-content: center; }
    }
  `]
})
export class BannerComponent {
  messages: string[] = [
    'Join thousands of Davido fans sharing exclusive videos, covers, fan art, and more.',
    'Upload your remix of Davido songs, and fan art to share with the community.',
    'Vote for your favorite Davido performances and remixes.',
    'Get customized Davido shirts, caps, etc, and exclusive content by being an active fan.',
    'Be part of an active fan community and get free giveaways'
  ];

  videoUrls: string[] = [
    'https://www.youtube.com/embed/NnWe5Lhi0G8?autoplay=1&mute=1&playlist=NnWe5Lhi0G8&loop=1&controls=0&showinfo=0&modestbranding=1',
    'https://www.youtube.com/embed/anPYTDj0Lrc?autoplay=1&mute=1&playlist=anPYTDj0Lrc&loop=1&controls=0&showinfo=0&modestbranding=1',
    'https://www.youtube.com/embed/l6QMJniQWxQ?autoplay=1&mute=1&playlist=l6QMJniQWxQ&loop=1&controls=0&showinfo=0&modestbranding=1',
    'https://www.youtube.com/embed/7adDm9YACpE?autoplay=1&mute=1&playlist=7adDm9YACpE&loop=1&controls=0&showinfo=0&modestbranding=1',
    'https://www.youtube.com/embed/helEv0kGHd4?autoplay=1&mute=1&playlist=helEv0kGHd4&loop=1&controls=0&showinfo=0&modestbranding=1'
  ];

  currentMessageIndex = 0;
  currentVideoIndex = 0;
  safeVideoUrl: SafeResourceUrl;
  isLoading = false;
  progress = 0;
  intervalId: any;

  readonly dialog = inject(MatDialog);

  constructor(private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef, private router: Router) {
    this.safeVideoUrl = this.sanitizeUrl(this.videoUrls[this.currentVideoIndex]);

    // Rotate messages
    setInterval(() => {
      this.isLoading = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 800);
    }, 9000);

    // Rotate videos every 60 seconds
    setInterval(() => {
      this.currentVideoIndex = (this.currentVideoIndex + 1) % this.videoUrls.length;
      this.safeVideoUrl = this.sanitizeUrl(this.videoUrls[this.currentVideoIndex]);
      this.progress = 0;
      this.cdr.detectChanges(); 
    }, 60000);

    // Progress bar update every 1 second
    this.intervalId = setInterval(() => {
      if (this.progress < 100) {
        this.progress += 100 / 60;
      } else {
        this.progress = 0;
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  private sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  authDialog() {
     this.dialog.open(AuthComponent);
   }

  loadVideos(): void {
    this.router.navigate(['/videos']);
  }
}
