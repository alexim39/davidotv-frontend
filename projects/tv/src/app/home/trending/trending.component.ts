import { CommonModule } from "@angular/common";
import { Component, HostListener, OnDestroy, OnInit, ChangeDetectorRef } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { Router, RouterModule } from "@angular/router";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { MatTooltipModule } from '@angular/material/tooltip';
import { timeAgo as timeAgoUtil } from '../../common/utils/time.util';
import { HomeService } from "../home.service";
import { Subscription } from 'rxjs';
import { YoutubeService } from "../../common/services/youtube.service";

@Component({
  selector: 'async-trending',
  providers: [HomeService],
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
          <a mat-button routerLink="videos/trending" class="see-all" aria-label="See all trending videos">
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
              @for (video of videos; track video.youtubeVideoId) {
                <mat-card 
                  class="video-card" 
                  [@slideFade] 
                  (click)="goToVideo(video.youtubeVideoId)"
                  (keyup.enter)="goToVideo(video.youtubeVideoId)"
                  tabindex="0"
                  role="button"
                >
                  <div [attr.aria-label]="'Watch ' + video.title"></div>
                  <div class="card-image-container">
                    <img 
                      mat-card-image 
                      [src]="'https://i.ytimg.com/vi/' + video.youtubeVideoId + '/mqdefault.jpg'"
                      [alt]="video.title + ' thumbnail'" 
                      loading="lazy"
                      (load)="onImageLoad()"
                    >
                    <!-- <div class="duration-overlay" *ngIf="video.duration">
                      {{video.duration}}
                    </div> -->
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
                          <span class="views">Views {{video.views}}</span>
                          <span class="separator">•</span>
                          <span class="date"> {{ timeAgo(video.publishedAt) }} </span>
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
            mat-flat-button 
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
  styleUrls: ['./trending.component.scss']
})
export class TrendingComponent implements OnInit, OnDestroy {
  videos: any[] = [];
  loading = true;
  currentIndex = 0;
  itemsPerView = 5;
  currentPage = 0;
  loadedImages = 0;
  private videoSubscription?: Subscription;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private youtubeService: YoutubeService
  ) {
    this.videos = []; // Initialize videos array
    this.updateItemsPerView(false);
  }

  ngOnInit() {
    this.fetchVideos();
  }

  ngOnDestroy() {
    this.videoSubscription?.unsubscribe();
  }

  private fetchVideos() {
    this.loading = true;
    this.videoSubscription = this.youtubeService.getTrendingVideos().subscribe({
      next: (response: any) => {
        console.log('data ',response)
        if (response) {
          this.videos = response.data.map((video: any) => ({
            youtubeVideoId: video.youtubeVideoId,
            channelIcon: './img/ytch.jpeg',
            title: video.title,
            channel: video.channel,
            views: (video.views ? video.views : 0),
            publishedAt: video.publishedAt,
          }));
        }
        this.loading = false;
        this.updateItemsPerView();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching videos:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateItemsPerView();
  }

  onImageLoad() {
    this.loadedImages++;
  }

  getIndicatorArray() {
    return Array(Math.ceil(this.videos.length / this.itemsPerView)).fill(0);
  }

  updateItemsPerView(shouldDetectChanges = true) {
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
    
    if (this.videos && this.videos.length > 0) {
      this.currentIndex = Math.min(this.currentIndex, Math.max(0, this.videos.length - this.itemsPerView));
      this.currentPage = Math.floor(this.currentIndex / this.itemsPerView);
    }
    
    if (shouldDetectChanges) {
      this.cdr.detectChanges();
    }
  }

  next() {
    const nextIndex = this.currentIndex + this.itemsPerView;
    if (nextIndex <= this.videos.length - this.itemsPerView) {
      this.currentIndex = nextIndex;
      this.currentPage = Math.floor(this.currentIndex / this.itemsPerView);
    } else if (nextIndex < this.videos.length) {
      this.currentIndex = this.videos.length - this.itemsPerView;
      this.currentPage = Math.floor(this.currentIndex / this.itemsPerView);
    }
    this.cdr.detectChanges();
  }

  previous() {
    const prevIndex = this.currentIndex - this.itemsPerView;
    this.currentIndex = Math.max(0, prevIndex);
    this.currentPage = Math.floor(this.currentIndex / this.itemsPerView);
    this.cdr.detectChanges();
  }

  goToPage(page: number) {
    this.currentIndex = page * this.itemsPerView;
    this.currentPage = page;
    this.cdr.detectChanges();
  }

  goToVideo(videoId: string | undefined) {
    if (videoId) {
      this.router.navigate(['/watch', videoId]);
    }
  }

  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
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
    this.fetchVideos();
  }
}