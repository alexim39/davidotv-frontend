import { CommonModule } from "@angular/common";
import { Component, HostListener, OnDestroy, OnInit, ChangeDetectorRef } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { timeAgo as timeAgoUtil } from '../../common/utils/time.util';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { YoutubeService, YoutubeVideoInterface } from "../../common/services/youtube.service";
import { TruncatePipe } from "../../common/pipes/truncate.pipe";

@Component({
  selector: 'async-search-results',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    MatChipsModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatPaginatorModule,
    TruncatePipe
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ],
  template: `
    <section class="search-results-section" [@fadeIn]>
      <!-- Search Header -->
      <div class="search-header">
        <div class="search-bar-container">
          <mat-form-field appearance="outline" class="search-input">
            <input 
              matInput 
              type="text" 
              placeholder="Search DavidoTV videos..." 
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearch()"
              #searchInput
            >
            <button 
              mat-icon-button 
              matSuffix 
              (click)="onSearch()"
              aria-label="Search"
            >
              <mat-icon>search</mat-icon>
            </button>
          </mat-form-field>
        </div>

        <div class="results-count" *ngIf="!loading && videos.length > 0">
          About {{ totalResults }} results for "{{ currentSearchTerm }}"
        </div>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="loading-container" [@fadeIn]>
          <mat-spinner diameter="50" strokeWidth="2" color="accent"></mat-spinner>
          <p class="loading-text">Searching for "{{ currentSearchTerm }}"...</p>
        </div>
      }

      <!-- No Results State -->
      @if (!loading && videos.length === 0 && currentSearchTerm) {
        <div class="no-results" [@slideIn]>
          <mat-icon class="no-results-icon" aria-hidden="false" aria-label="No results found">search_off</mat-icon>
          <h3>No results found for "{{ currentSearchTerm }}"</h3>
          <p>Try different keywords or check out our trending videos</p>
          <button 
            mat-flat-button 
            color="primary" 
            routerLink="/videos/trending"
            aria-label="Browse trending videos"
          >
            <mat-icon>explore</mat-icon>
            Browse Trending
          </button>
        </div>
      }

      <!-- Initial State - Before Search -->
      @if (!loading && videos.length === 0 && !currentSearchTerm) {
        <div class="initial-state" [@slideIn]>
          <mat-icon class="search-icon" aria-hidden="false" aria-label="Search DavidoTV">search</mat-icon>
          <h3>Search DavidoTV Videos</h3>
          <p>Find official music videos, fan content, interviews and more</p>
        </div>
      }

      <!-- Search Results Grid -->
      @if (!loading && videos.length > 0) {
        <div class="results-grid">
          @for (video of videos; track video.youtubeVideoId) {
            <mat-card 
              class="video-card" 
              [@slideIn] 
              (click)="goToVideo(video.youtubeVideoId)"
              (keyup.enter)="goToVideo(video.youtubeVideoId)"
              tabindex="0"
              role="button"
            >
              <div class="card-image-container">
                <img 
                  mat-card-image 
                  [src]="'https://i.ytimg.com/vi/' + video.youtubeVideoId + '/mqdefault.jpg'"
                  [alt]="video.title + ' thumbnail'" 
                  loading="lazy"
                >
                @if (video.duration) {
                  <div class="duration-overlay">
                    {{ formatDuration(video.duration) }}
                  </div>
                }
                @if (video.isLive) {
                  <div class="live-chip">LIVE</div>
                }
              </div>
              <mat-card-content>
                <div class="video-info">
                  <img 
                    [src]="video.channelIcon || './img/ytch.jpeg'" 
                    alt="{{video.channel}} channel icon" 
                    class="channel-icon" 
                    loading="lazy"
                  >
                  <div class="video-meta">
                    <h3 class="video-title" [matTooltip]="video.title">{{video.title}}</h3>
                    <p class="channel-name">{{video.channel}}</p>
                    <div class="video-stats">
                      <span class="views">{{ video.views | number }} views</span>
                      <span class="separator">•</span>
                      <span class="date">{{ timeAgo(video.publishedAt) }}</span>
                    </div>
                    @if (video.description) {
                      <p class="video-description">{{ video.description | truncate:100 }}</p>
                    }
                    @if (video.tags && video.tags.length > 0) {
                      <div class="tags-container">
                        @for (tag of video.tags.slice(0, 3); track tag) {
                          <mat-chip class="tag-chip">{{ tag }}</mat-chip>
                        }
                      </div>
                    }
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <!-- Pagination -->
        <mat-paginator 
          [length]="totalResults" 
          [pageSize]="pageSize" 
          [pageIndex]="currentPage"
          [pageSizeOptions]="[12, 24, 48]"
          (page)="onPageChange($event)"
          aria-label="Select page of search results"
          class="search-paginator"
        ></mat-paginator>
      }
    </section>
  `,
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  videos: any[] = [];
  loading = false;
  searchQuery = '';
  currentSearchTerm = '';
  totalResults = 0;
  pageSize = 12;
  currentPage = 0;
  private routeSubscription!: Subscription;
  private searchSubscription!: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private youtubeService: YoutubeService
  ) {}

  ngOnInit() {
    // Get search query from URL
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
        this.currentSearchTerm = params['q'];
        this.searchVideos();
      }
    });

    // Debounce search input for better UX
    this.searchSubscription = this.route.queryParams
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(params => {
        if (params['q']) {
          this.searchQuery = params['q'];
          this.currentSearchTerm = params['q'];
          if (this.currentSearchTerm) {
            this.searchVideos();
          }
        }
      });
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery.trim() },
        queryParamsHandling: 'merge'
      });
    }
  }

    // In search-results.component.ts
    private searchVideos() {
    if (!this.currentSearchTerm.trim()) return;

    this.loading = true;
    this.videos = [];
    this.cdr.detectChanges();

    this.youtubeService.searchVideos(this.currentSearchTerm, this.currentPage + 1, this.pageSize)
        .subscribe({
        next: (response) => {
            console.log('search result ',response)
            this.videos = response.data.map((video: YoutubeVideoInterface) => ({
            ...video,
            channelIcon: ''//video.channelIcon || './img/ytch.jpeg'
            }));
            this.totalResults = response.meta.total;
            this.loading = false;
            this.cdr.detectChanges();
        },
        error: (error) => {
            console.error('Error searching videos:', error);
            this.loading = false;
            this.cdr.detectChanges();
        }
        });
    }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.searchVideos();
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToVideo(videoId: string | undefined) {
    if (videoId) {
      this.router.navigate(['/watch', videoId]);
    }
  }

  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }

  formatDuration(duration: string): string {
    // Convert ISO 8601 duration to readable format (PT1M33S -> 1:33)
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!matches) return '';

    const hours = matches[1] ? parseInt(matches[1]) : 0;
    const minutes = matches[2] ? parseInt(matches[2]) : 0;
    const seconds = matches[3] ? parseInt(matches[3]) : 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }
}