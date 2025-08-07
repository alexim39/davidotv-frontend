import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { Router, ActivatedRoute } from "@angular/router";
import { MatChipsModule } from "@angular/material/chips";
import { Subscription, fromEvent } from "rxjs";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { timeAgo as timeAgoUtil, formatDuration as videoDuration, formatViewCount as viewFormat } from '../common/utils/time.util';
import { YoutubeService, YoutubeVideoInterface } from "../common/services/youtube.service";
import { throttleTime } from 'rxjs/operators';
import { TruncatePipe } from "../common/pipes/truncate.pipe";

@Component({
  selector: 'async-videos',
  providers: [],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatMenuModule,
    MatDividerModule,
    MatTabsModule,
    TruncatePipe
  ],
  template: `
    <div class="trending-all-container" 
         (scroll)="onContainerScroll($event)" 
         style="overflow-y: auto; max-height: 100vh;">
      <!-- Header with back button and title -->
      <mat-toolbar class="header-toolbar">
        <button mat-icon-button (click)="goBack()" aria-label="Back button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Davido's Related Videos</h1>
        <span class="spacer"></span>
        <button mat-icon-button [matMenuTriggerFor]="sortMenu" aria-label="Sort options">
          <mat-icon>sort</mat-icon>
        </button>
        <mat-menu #sortMenu="matMenu">
          <button mat-menu-item (click)="sortBy('publishedAt')">
            <mat-icon>schedule</mat-icon>
            <span>Newest First</span>
          </button>
          <button mat-menu-item (click)="sortBy('views')">
            <mat-icon>visibility</mat-icon>
            <span>Most Viewed</span>
          </button>
          <button mat-menu-item (click)="sortBy('title')">
            <mat-icon>title</mat-icon>
            <span>By Title</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <!-- Search and filter bar -->
      <div class="search-filter-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput placeholder="Search for videos" [(ngModel)]="searchQuery" (input)="applySearch()">
          <button mat-icon-button matSuffix *ngIf="searchQuery" (click)="clearSearch()">
            <mat-icon>close</mat-icon>
          </button>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Category</mat-label>
          <mat-select [(value)]="selectedCategory" (selectionChange)="applyFilters()">
            <mat-option value="all">All Categories</mat-option>
            <mat-option value="music">Music Videos</mat-option>
            <mat-option value="live">Live Performances</mat-option>
            <mat-option value="interview">Interviews</mat-option>
            <mat-option value="behind">Behind The Scenes</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Video content with tabs -->
      <mat-tab-group animationDuration="0ms" class="video-tabs" (selectedTabChange)="onTabChange($event.index)">
        <mat-tab label="Shorts">
          <div class="tab-content">
            <!-- Short videos grid -->
            <div *ngIf="shortVideos.length > 0" class="video-grid short-videos">
              <mat-card *ngFor="let video of filteredShortVideos" class="video-card" (click)="goToVideo(video.youtubeVideoId)">
                <div class="thumbnail-container">
                  <img mat-card-image [src]="'https://i.ytimg.com/vi/' + video.youtubeVideoId + '/mqdefault.jpg'" [alt]="video.title" loading="lazy">
                  <div class="video-duration">{{ formatDuration(video.duration) }}</div>
                  <div class="short-badge">SHORT</div>
                </div>
                <mat-card-content>
                  <div class="video-info">
                    <img src="./img/ytch.jpeg" alt="Channel" class="channel-icon" loading="lazy">
                    <div class="video-meta">
                      <h3 title="{{video.title}}">{{ video.title | truncate:50 }}</h3>
                      <p class="channel-name">{{ video.channel }}</p>
                      <div class="video-stats">
                        <span class="stat-item">
                          <mat-icon class="stat-icon">visibility</mat-icon>
                          {{ formatViewCount(video.views) }}
                        </span>
                        <span class="stat-item">
                          {{ timeAgo(video.publishedAt) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- No short videos -->
            <div *ngIf="!loadingShorts && filteredShortVideos.length === 0 && !error" class="no-results">
              <mat-icon>search_off</mat-icon>
              <h3>No short videos found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button mat-flat-button color="primary" (click)="resetFilters()">Reset Filters</button>
            </div>

            <!-- Short videos loading indicator -->
            <div *ngIf="loadingShorts" class="loading-more">
              <mat-spinner diameter="30" strokeWidth="2" color="accent"></mat-spinner>
              <span>Loading shorts...</span>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Full Videos">
          <div class="tab-content">
            <!-- Full videos grid -->
            <div *ngIf="fullVideos.length > 0" class="video-grid full-videos">
              <mat-card *ngFor="let video of filteredFullVideos" class="video-card" (click)="goToVideo(video.youtubeVideoId)">
                <div class="thumbnail-container">
                  <img mat-card-image [src]="'https://i.ytimg.com/vi/' + video.youtubeVideoId + '/mqdefault.jpg'" [alt]="video.title" loading="lazy">
                  <div class="video-duration">{{ formatDuration(video.duration) }}</div>
                </div>
                <mat-card-content>
                  <div class="video-info">
                    <img src="./img/ytch.jpeg" alt="Channel" class="channel-icon" loading="lazy">
                    <div class="video-meta">
                      <h3 title="{{video.title}}">{{ video.title }}</h3>
                      <p class="channel-name">{{ video.channel }}</p>
                      <div class="video-stats">
                        <span class="stat-item">
                          <mat-icon class="stat-icon">visibility</mat-icon>
                          {{ formatViewCount(video.views) }}
                        </span>
                        <span class="stat-item">
                          {{ timeAgo(video.publishedAt) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- No full videos -->
            <div *ngIf="!loadingFullVideos && filteredFullVideos.length === 0 && !error" class="no-results">
              <mat-icon>search_off</mat-icon>
              <h3>No full videos found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button mat-flat-button color="primary" (click)="resetFilters()">Reset Filters</button>
            </div>

            <!-- Full videos loading indicator -->
            <div *ngIf="loadingFullVideos" class="loading-more">
              <mat-spinner diameter="30" strokeWidth="2" color="accent"></mat-spinner>
              <span>Loading videos...</span>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Error state -->
      <div *ngIf="error" class="error-state">
        <mat-icon>error_outline</mat-icon>
        <h3>Error loading videos</h3>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="retryLoading()">Retry</button>
      </div>
    </div>
  `,
  styleUrls: ['./videos.component.scss']
})
export class VideosComponent implements OnInit, OnDestroy {
  shortVideos: YoutubeVideoInterface[] = [];
  fullVideos: YoutubeVideoInterface[] = [];
  filteredShortVideos: YoutubeVideoInterface[] = [];
  filteredFullVideos: YoutubeVideoInterface[] = [];
  
  // Separate loading states
  loadingShorts = false;
  loadingFullVideos = false;
  error: string | null = null;
  
  // Filters
  searchQuery = '';
  selectedCategory = 'all';
  private videosSubscription?: Subscription;

  // Infinite scroll state
  private shortPage = 0;
  private fullPage = 0;
  private pageSize = 15;
  private allShortsLoaded = false;
  private allFullVideosLoaded = false;
  private scrollSubscription?: Subscription;
  private activeTabIndex = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private youtubeService: YoutubeService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadInitialVideos();
    setTimeout(() => this.initScrollListener());
  }

  private initScrollListener() {
    const container = document.querySelector('.trending-all-container');
    if (!container) return;
    this.scrollSubscription = fromEvent(container, 'scroll')
      .pipe(throttleTime(200))
      .subscribe(() => {
        if ((this.activeTabIndex === 0 && this.loadingShorts) || 
            (this.activeTabIndex === 1 && this.loadingFullVideos)) return;
            
        const threshold = 200;
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - threshold) {
          if (this.activeTabIndex === 0 && !this.allShortsLoaded) {
            this.loadMoreShortVideos();
          } else if (this.activeTabIndex === 1 && !this.allFullVideosLoaded) {
            this.loadMoreFullVideos();
          }
        }
      });
  }

  onTabChange(index: number) {
    this.activeTabIndex = index;
    if (index === 0 && this.shortVideos.length === 0 && !this.allShortsLoaded) {
      this.loadMoreShortVideos();
    } else if (index === 1 && this.fullVideos.length === 0 && !this.allFullVideosLoaded) {
      this.loadMoreFullVideos();
    }
  }

  loadInitialVideos() {
    this.error = null;
    this.loadInitialShortVideos();
    this.loadInitialFullVideos();
  }

  private loadInitialShortVideos() {
    this.loadingShorts = true;
    this.youtubeService.getAllShortVideos(this.pageSize, 0).subscribe({
      next: (shorts) => {
        this.shortVideos = (shorts.data || []).filter((v: YoutubeVideoInterface) => v.isShort || (v.durationSeconds && v.durationSeconds <= 120));
        this.filteredShortVideos = [...this.shortVideos];
        this.shortPage = 1;
        this.allShortsLoaded = this.shortVideos.length < this.pageSize;
        this.loadingFullVideos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.handleInitialLoadError(err, 'short videos');
        this.loadingFullVideos = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loadingShorts = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadInitialFullVideos() {
    this.loadingFullVideos = true;
    this.youtubeService.getAllFullVideos(this.pageSize, 0).subscribe({
      next: (fullVideos) => {
        console.log('Initial full videos loaded:', fullVideos);
        this.fullVideos = (fullVideos.data || []).filter((v: YoutubeVideoInterface) => !v.isShort && (!v.durationSeconds || v.durationSeconds > 120));
        this.filteredFullVideos = [...this.fullVideos];
        this.fullPage = 1;
        this.allFullVideosLoaded = this.fullVideos.length < this.pageSize;
        this.loadingFullVideos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.handleInitialLoadError(err, 'full videos');
        this.loadingFullVideos = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loadingFullVideos = false;
        this.cdr.detectChanges();
      }
    });
  }

  private handleInitialLoadError(err: any, videoType: string) {
    console.error(`Error loading initial ${videoType}:`, err);
    if (!this.error) {
      this.error = `Failed to load ${videoType}. Some content may not be available.`;
    }
  }

  loadMoreShortVideos() {
    if (this.loadingShorts || this.allShortsLoaded) return;
    
    this.loadingShorts = true;
    this.error = null;

    this.youtubeService.getAllShortVideos(this.pageSize, this.shortPage).subscribe({
      next: (response) => {
        const newVideos = response.data || [];
        
        if (newVideos.length < this.pageSize) {
          this.allShortsLoaded = true;
        }

        const newUnique = newVideos.filter(
          (v: any) => !this.shortVideos.some(existing => existing.youtubeVideoId === v.youtubeVideoId) &&
                     (v.isShort || (v.durationSeconds && v.durationSeconds <= 120))
        );

        this.shortVideos = [...this.shortVideos, ...newUnique];
        this.filteredShortVideos = [...this.shortVideos];
        this.shortPage++;
      },
      error: (err) => {
        this.error = 'Failed to load more short videos. Please try again later.';
        console.error('Error loading more short videos:', err);
      },
      complete: () => {
        this.loadingShorts = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMoreFullVideos() {
    if (this.loadingFullVideos || this.allFullVideosLoaded) return;
    
    this.loadingFullVideos = true;
    this.error = null;

    this.youtubeService.getAllFullVideos(this.pageSize, this.fullPage).subscribe({
      next: (response) => {
        const newVideos = response.data || [];
        
        if (newVideos.length < this.pageSize) {
          this.allFullVideosLoaded = true;
        }

        const newUnique = newVideos.filter(
          (v: any) => !this.fullVideos.some(existing => existing.youtubeVideoId === v.youtubeVideoId) &&
                     !v.isShort && (!v.durationSeconds || v.durationSeconds > 120)
        );

        this.fullVideos = [...this.fullVideos, ...newUnique];
        this.filteredFullVideos = [...this.fullVideos];
        this.fullPage++;
      },
      error: (err) => {
        this.error = 'Failed to load more full videos. Please try again later.';
        console.error('Error loading more full videos:', err);
      },
      complete: () => {
        this.loadingFullVideos = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Sorting
  sortBy(property: 'title' | 'views' | 'publishedAt') {
    this.filteredShortVideos.sort((a, b) => this.getSortComparator(a, b, property));
    this.filteredFullVideos.sort((a, b) => this.getSortComparator(a, b, property));
  }

  private getSortComparator(a: any, b: any, property: 'title' | 'views' | 'publishedAt'): number {
    if (property === 'publishedAt') {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    } else if (property === 'views') {
      return (b.views || 0) - (a.views || 0);
    } else {
      return (a.title || '').localeCompare(b.title || '');
    }
  }

  // Filtering and searching
  applySearch() {
    if (!this.searchQuery) {
      this.filteredShortVideos = [...this.shortVideos];
      this.filteredFullVideos = [...this.fullVideos];
      return;
    }
    const query = this.searchQuery.toLowerCase();
    this.filteredShortVideos = this.shortVideos.filter(video => 
      video.title?.toLowerCase().includes(query)
    );
    this.filteredFullVideos = this.fullVideos.filter(video => 
      video.title?.toLowerCase().includes(query)
    );
  }

  applyFilters() {
    if (this.selectedCategory === 'all') {
      this.filteredShortVideos = [...this.shortVideos];
      this.filteredFullVideos = [...this.fullVideos];
      return;
    }
    
    this.filteredShortVideos = this.shortVideos.filter(video => 
      video.title?.toLowerCase().includes(this.selectedCategory)
    );
    this.filteredFullVideos = this.fullVideos.filter(video => 
      video.title?.toLowerCase().includes(this.selectedCategory)
    );
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.filteredShortVideos = [...this.shortVideos];
    this.filteredFullVideos = [...this.fullVideos];
  }

  // Navigation
  goBack() {
    this.router.navigate(['/']);
  }

  goToVideo(videoId: string) {
    this.router.navigate(['/watch', videoId]);
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredShortVideos = [...this.shortVideos];
    this.filteredFullVideos = [...this.fullVideos];
  }

  retryLoading() {
    this.error = null;
    if (this.activeTabIndex === 0) {
      this.loadMoreShortVideos();
    } else {
      this.loadMoreFullVideos();
    }
  }

  ngOnDestroy() {
    this.videosSubscription?.unsubscribe();
    this.scrollSubscription?.unsubscribe();
  }

  onContainerScroll(event: Event): void {
    const container = event.target as HTMLElement;
    const threshold = 100;
    
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - threshold) {
      if (this.activeTabIndex === 0 && !this.allShortsLoaded) {
        this.loadMoreShortVideos();
      } else if (this.activeTabIndex === 1 && !this.allFullVideosLoaded) {
        this.loadMoreFullVideos();
      }
    }
  }

  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }

  formatDuration(duration: string): string {
    return videoDuration(duration);
  }

  formatViewCount(views: number | 0): string {
    return viewFormat(views);
  }
}