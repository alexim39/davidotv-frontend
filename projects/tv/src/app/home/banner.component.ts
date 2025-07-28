import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
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
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule],
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
      <div class="video-loader-bar">
        <div class="progress" [style.width.%]="progress"></div>
    </div>

      <iframe
        [src]="safeVideoUrl"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen>
      </iframe>

      <div class="banner-overlay"></div>

      <div class="banner-content" [@bannerFadeSlide]>
        <h1 class="banner-title">Welcome to <span class="highlight">DavidoTV</span></h1>
        <span class="banner-subtitle">Built by fans for fans</span>

        <div class="banner-description-wrapper">
          <div *ngIf="isLoading" class="message-loader"><!-- Loading next... --></div>
          <p *ngIf="!isLoading" [@messageAnimation] class="banner-description">
            {{ messages[currentMessageIndex] }}
          </p>
        </div>

        <div class="banner-buttons">
          <button mat-flat-button (click)="authDialog()">Join Now</button>
          <button mat-raised-button (click)="loadVideos()">Watch Videos</button>
        </div>
      </div>


    </div>
  `,
  styles: [`
    .video-section {
      position: relative;
      width: 100%;
      height: 85vh;
      overflow: hidden;
      background-color: #000;
    }

    .video-section iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    .banner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.2));
      z-index: 1;
    }

    .banner-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
      color: #fff;
      max-width: 700px;
      text-align: center;
      padding: 1rem;
    }

    .banner-title {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 0.4rem;
    }

    .banner-subtitle {
      font-size: 0.8rem;
      color: #ccc;
      border-radius: 10px;
      padding: 0.2rem 0.5rem;
      border: 1px solid #ccc;
      display: inline-block;
    }

    .highlight {
      color: #8f0045;
    }

    .banner-description-wrapper {
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .banner-description {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .message-loader {
      font-size: 1rem;
      color: #ccc;
      animation: fade 0.8s ease-in-out infinite alternate;
    }

    @keyframes fade {
      from { opacity: 0.3; }
      to { opacity: 1; }
    }

    .banner-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .banner-buttons button {
      font-size: 1rem;
      padding: 0.75rem 1.5rem;
    }

    .video-loader-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background-color: rgba(255, 255, 255, 0.1);
      z-index: 3;
    }

    .video-loader-bar .progress {
      height: 100%;
      background-color: #e53935;
      transition: width 1s linear;
    }

    @media (max-width: 768px) {
      .banner-title {
        font-size: 2.2rem;
      }

      .banner-description {
        font-size: 1rem;
      }

      .banner-buttons {
        flex-direction: column;
        align-items: center;
      }
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
