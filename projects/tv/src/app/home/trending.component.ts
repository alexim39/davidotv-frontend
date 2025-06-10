import { CommonModule } from "@angular/common";
import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { VideoItem } from "../videos/videos.service";
import { Router, RouterModule } from "@angular/router";
import { YoutubeService } from "../common/services/youtube.service";
import { MatChipsModule } from "@angular/material/chips";
import { Subscription, catchError, finalize, of } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'async-trending',
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    MatChipsModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatTooltipModule
  ],
  animations: [
    trigger('slideFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 0, transform: 'translateX(-20px)' }))
      ])
    ]),
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition('void <=> *', animate('300ms ease-in-out'))
    ])
  ],
  template: `
    <section class="trending-section" [@fadeInOut]>
      <div class="section-header">
        <div class="header-content">
          <div class="title-container">
            <mat-icon class="section-icon" aria-hidden="false" aria-label="Trending now">local_fire_department</mat-icon>
            <h2 class="section-title">Trending Now</h2>
          </div>
          <a mat-button routerLink="trending/videos" class="see-all" aria-label="See all trending videos">
            See all
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>
      </div>

      @if (loading) {
        <div class="loading-container" [@fadeInOut]>
          <mat-spinner diameter="50" strokeWidth="2" color="accent"></mat-spinner>
          <p class="loading-text">Loading trending videos...</p>
        </div>
      }
      @else if (videos.length > 0) {
        <div class="carousel-container">
          <button 
            mat-icon-button 
            class="nav-button prev-button" 
            (click)="previous()" 
            [disabled]="currentIndex === 0"
            aria-label="Previous videos"
            matTooltip="Previous"
          >
            <mat-icon>chevron_left</mat-icon>
          </button>

          <div class="carousel-wrapper">
            <div 
              class="carousel-track" 
              [style.transform]="'translateX(' + (-currentIndex * (100 / itemsPerView)) + '%)'"
            >
              @for (video of videos; track video.id.videoId) {
                <mat-card 
                  class="video-card" 
                  [@slideFade] 
                  (click)="goToVideo(video.id.videoId)"
                  (keyup.enter)="goToVideo(video.id.videoId)"
                  tabindex="0"
                  role="button"
                >
                  <div [attr.aria-label]="'Watch ' + video.title"></div>
                  <div class="card-image-container">
                    <img 
                      mat-card-image 
                      [src]="video.thumbnail" 
                      [alt]="video.title + ' thumbnail'" 
                      loading="lazy"
                      (load)="onImageLoad()"
                    >
                    @if (video.snippet.liveBroadcastContent === 'live') {
                      <mat-chip color="warn" class="live-chip" aria-label="Live video">
                        LIVE
                      </mat-chip>
                    }
                    <div class="duration-overlay" *ngIf="video.duration">
                      {{video.duration}}
                    </div>
                  </div>
                  <mat-card-content>
                    <div class="video-info">
                      <img 
                        [src]="video.channelIcon" 
                        alt="{{video.channel}} channel icon" 
                        class="channel-icon" 
                        loading="lazy"
                      >
                      <div class="video-meta">
                        <h3 class="video-title" [matTooltip]="video.title">{{video.title}}</h3>
                        <p class="channel-name">{{video.channel}}</p>
                        <div class="video-stats">
                          <span class="views">{{67 | number}} views</span>
                         <!--  <span class="views">{{video.viewCount | number}} views</span> -->
                          <span class="separator">•</span>
                          <span class="date">{{ timeAgo(video.snippet.publishedAt) }}</span>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </div>

          <button 
            mat-icon-button 
            class="nav-button next-button" 
            (click)="next()" 
            [disabled]="currentIndex >= videos.length - itemsPerView"
            aria-label="Next videos"
            matTooltip="Next"
          >
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>

        <div class="carousel-indicators" *ngIf="!loading && videos.length > itemsPerView">
          @for (_ of getIndicatorArray(); track $index) {
            <button 
              [class.active]="$index === currentPage"
              (click)="goToPage($index)"
              [attr.aria-label]="'Go to page ' + ($index + 1)"
              [attr.aria-current]="$index === currentPage ? 'true' : 'false'"
            ></button>
          }
        </div>
      }
      @else if (!loading && videos.length === 0) {
        <div class="no-results" [@fadeInOut]>
          <mat-icon class="no-results-icon" aria-hidden="false" aria-label="No videos found">search_off</mat-icon>
          <h3>No videos found</h3>
          <p>We couldn't load trending videos at this time. Please try again.</p>
          <button 
            mat-raised-button 
            color="primary" 
            (click)="retry()"
            aria-label="Retry loading videos"
          >
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
        </div>
      }
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .trending-section {
      margin: 0 auto 48px;
      max-width: 1800px;
      padding: 15px 24px;
      position: relative;
    }

    .section-header {
      margin-bottom: 32px;
      
      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .title-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .section-icon {
        color: #8f0045;
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .section-title {
        margin: 0;
        flex: 1;
        font-size: clamp(1rem, 2vw, 1.10rem);
      }

      .see-all {
        color: #8f0045;;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s ease;

        &:hover {
          color: #E60000;
          transform: translateX(4px);
        }

        mat-icon {
          width: 18px;
          height: 18px;
          font-size: 18px;
        }
      }
    }

    .carousel-container {
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
      margin: 0 -12px;
    }

    .carousel-wrapper {
      overflow: hidden;
      width: 100%;
      position: relative;
    }

    .carousel-track {
      display: flex;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform;
    }

    .video-card {
      flex: 0 0 calc(100% / var(--items-per-view));
      padding: 0 12px;
      transition: all 0.3s ease;
      border: none;
      background: transparent;
      cursor: pointer;
      outline: none;

      &:hover, &:focus {
        .card-image-container img {
          transform: scale(1.03);
        }

        .video-title {
          color: #FF4D4D;
        }
      }

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 12px;
        padding: 1px;
        background: linear-gradient(135deg, rgba(255,77,77,0.2) 0%, rgba(255,77,77,0) 50%);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover::before {
        opacity: 1;
      }
    }

    .card-image-container {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 12px;
      aspect-ratio: 16 / 9;
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.3s ease;
      }
    }

    .live-chip {
      position: absolute;
      top: 8px;
      left: 8px;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      background-color: #FF4D4D;
      color: white;
    }

    .duration-overlay {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .video-info {
      display: flex;
      gap: 12px;
    }

    .channel-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      background: #f0f0f0;
    }

    .video-meta {
      flex: 1;
      min-width: 0;
    }

    .video-title {
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.4;
      margin: 0 0 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #1A1A1A;
      transition: color 0.2s ease;
    }

    .channel-name {
      font-size: 0.875rem;
      color: #666;
      margin: 0 0 4px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .video-stats {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: #888;

      .separator {
        font-size: 0.5rem;
      }
    }

    .nav-button {
      background: white;
      color: #FF4D4D;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      z-index: 2;
      flex-shrink: 0;

      &:hover:not([disabled]) {
        background: #FF4D4D;
        color: white;
        transform: scale(1.1);
      }

      &[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .carousel-indicators {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;

      button {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #DDD;
        border: none;
        cursor: pointer;
        padding: 0;
        transition: all 0.3s ease;

        &.active {
          background: #FF4D4D;
          width: 24px;
          border-radius: 4px;
        }

        &:hover:not(.active) {
          background: #AAA;
        }
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      gap: 16px;
    }

    .loading-text {
      font-size: 0.875rem;
      color: #666;
      font-weight: 500;
    }

    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 0;
      gap: 16px;

      .no-results-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #AAA;
      }

      h3 {
        font-size: 1.25rem;
        font-weight: 500;
        color: #333;
        margin: 0;
      }

      p {
        font-size: 0.875rem;
        color: #666;
        margin: 0;
        max-width: 300px;
      }

      button {
        margin-top: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    /* Responsive styles */
    @media (max-width: 1920px) {
      :root {
        --items-per-view: 5;
      }
    }

    @media (max-width: 1600px) {
      :root {
        --items-per-view: 4;
      }
    }

    @media (max-width: 1200px) {
      :root {
        --items-per-view: 3;
      }
    }

    @media (max-width: 900px) {
      :root {
        --items-per-view: 2;
      }

      .trending-section {
        padding: 5px 10px;
      }

      .section-header {
        margin-bottom: 24px;
      }
    }

    @media (max-width: 600px) {
      :root {
        --items-per-view: 1;
      }

      .section-header {
        .header-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .see-all {
          align-self: flex-end;
        }
      }

      .video-card {
        padding: 0 8px;
      }

      .nav-button {
        width: 32px;
        height: 32px;
        
        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }

    @media (max-width: 400px) {
      .trending-section {
        padding: 5px 12px;
      }

      .video-info {
        gap: 8px;
      }

      .channel-icon {
        width: 32px;
        height: 32px;
      }

      .video-title {
        font-size: 0.875rem;
      }

      .channel-name, .video-stats {
        font-size: 0.75rem;
      }
    }
  `]
})
export class TrendingComponent implements OnInit, OnDestroy {
  videos: VideoItem[] = [];
  private trendingSub?: Subscription;
  loading = true;
  currentIndex = 0;
  itemsPerView = 5;
  currentPage = 0;
  loadedImages = 0;

  constructor(private youtube: YoutubeService, private router: Router) {
    this.updateItemsPerView();
  }

  ngOnInit() {
    this.fetchTrendingVideos();
  }

  ngOnDestroy() {
    this.trendingSub?.unsubscribe();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateItemsPerView();
  }

  private fetchTrendingVideos() {
    this.loading = true;
    this.trendingSub = this.youtube.getTrendingDavidoVideos(60).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching trending videos:', error);
        return of(null);
      }),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response: any) => {
        if (response?.items) {
          this.videos = response.items.map((item: any) => ({
            id: item.id,
            snippet: item.snippet,
            channelIcon: './img/logo.PNG',
            date: new Date(item.snippet.publishedAt).toDateString(),
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
            channel: item.snippet.channelTitle,
            viewCount: Math.floor(Math.random() * 1000000), // Mock view count - replace with actual data if available
            duration: this.formatDuration(Math.floor(Math.random() * 3600)) // Mock duration - replace with actual data if available
          }));
        }
      }
    });
  }

  onImageLoad() {
    this.loadedImages++;
    // You could use this to implement a more sophisticated loading state
  }

  getIndicatorArray() {
    return Array(Math.ceil(this.videos.length / this.itemsPerView)).fill(0);
  }

  updateItemsPerView() {
    if (window.innerWidth >= 1920) {
      this.itemsPerView = 5;
    } else if (window.innerWidth >= 1600) {
      this.itemsPerView = 4;
    } else if (window.innerWidth >= 1200) {
      this.itemsPerView = 3;
    } else if (window.innerWidth >= 900) {
      this.itemsPerView = 2;
    } else {
      this.itemsPerView = 1;
    }
    this.currentIndex = Math.min(this.currentIndex, Math.max(0, this.videos.length - this.itemsPerView));
    this.currentPage = Math.floor(this.currentIndex / this.itemsPerView);
  }

  next() {
    const nextIndex = this.currentIndex + this.itemsPerView;
    if (nextIndex <= this.videos.length - this.itemsPerView) {
      this.currentIndex = nextIndex;
      this.currentPage = Math.floor(this.currentIndex / this.itemsPerView);
    } else if (nextIndex < this.videos.length) {
      // Handle case where there are fewer items left than itemsPerView
      this.currentIndex = this.videos.length - this.itemsPerView;
      this.currentPage = Math.floor(this.currentIndex / this.itemsPerView);
    }
  }

  previous() {
    const prevIndex = this.currentIndex - this.itemsPerView;
    this.currentIndex = Math.max(0, prevIndex);
    this.currentPage = Math.floor(this.currentIndex / this.itemsPerView);
  }

  goToPage(page: number) {
    this.currentIndex = page * this.itemsPerView;
    this.currentPage = page;
  }

  goToVideo(videoId: string | undefined) {
    if (videoId) {
      this.router.navigate(['/watch', videoId]);
    }
  }

  timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }

    return 'Just now';
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  retry(): void {
    this.loading = true;
    this.fetchTrendingVideos();
  }
}