import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { Router, ActivatedRoute } from "@angular/router";
import { MatChipsModule } from "@angular/material/chips";
import { Subscription } from "rxjs";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { timeAgo as timeAgoUtil, formatDuration as videoDuration, formatViewCount as viewFormat } from '../common/utils/time.util';
import { YoutubeService } from "../common/services/youtube.service";

@Component({
  selector: 'async-official',
  providers: [],
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
        <h1>Davido's Official Videos</h1>
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

      <!-- Content tabs -->
      <mat-tab-group class="content-tabs" (selectedTabChange)="onTabChange($event)">
        <mat-tab label="All Videos">
          <div class="tab-content">
            <!-- Videos grid -->
            <div *ngIf="videos.length > 0" class="video-grid">
              <mat-card *ngFor="let video of filteredVideos" class="video-card" (click)="goToVideo(video.youtubeVideoId)">
                <div class="thumbnail-container">
                  <img mat-card-image [src]="'https://i.ytimg.com/vi/' + video.youtubeVideoId + '/mqdefault.jpg'" [alt]="video.title" loading="lazy">
                  <div class="video-duration">{{ formatDuration(video.duration) }}</div>
                </div>
                <mat-card-content>
                  <div class="video-info">
                    <img src="./img/ytch.jpeg" alt="Channel" class="channel-icon" loading="lazy">
                    <div class="video-meta">
                      <h3>{{ video.title }}</h3>
                      <p class="channel-name">Davido</p>
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

            <!-- Initial loading -->
          <div *ngIf="initialLoading && !error" class="loading-container">
            <mat-spinner diameter="50" strokeWidth="3"></mat-spinner>
            <p class="loading-text">Loading videos...</p>
          </div>

            <!-- No results -->
            <div *ngIf="!initialLoading && filteredVideos.length === 0 && !error" class="no-results">
              <mat-icon>search_off</mat-icon>
              <h3>No videos found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button mat-flat-button color="primary" (click)="resetFilters()">Reset Filters</button>
            </div>

            <!-- Error state -->
            <div *ngIf="error" class="error-state">
              <mat-icon>error_outline</mat-icon>
              <h3>Error loading videos</h3>
              <p>{{ error }}</p>
              <button mat-raised-button color="primary" (click)="retryLoading()">Retry</button>
            </div>
          </div>
        </mat-tab>
        <mat-tab label="Music Videos">
          <div class="tab-content">
            <!-- Content for Music Videos tab -->
          </div>
        </mat-tab>
        <mat-tab label="Live">
          <div class="tab-content">
            <!-- Content for Live tab -->
          </div>
        </mat-tab>
      </mat-tab-group>

     <!-- Loading more (at bottom) -->
    <div *ngIf="loadingMore && !error" class="loading-more">
      <mat-spinner diameter="30" strokeWidth="2" color="accent"></mat-spinner>
      <span>Loading more videos...</span>
    </div>
    </div>
  `,
  styleUrls: ['./official.component.scss']
})
export class OfficialComponent implements OnInit, OnDestroy {
 videos: any[] = [];
  filteredVideos: any[] = [];
  musicVideos: any[] = [];
  liveVideos: any[] = [];
  initialLoading = false; // for first load
  loadingMore = false;    // for infinite scroll
  error: string | null = null;
  allLoaded = false;
  activeTab = 'all';
  
  // Pagination
  private page = 0;
  private readonly pageSize = 12;

  // Filters
  searchQuery = '';
  selectedCategory = 'all';
  private videosSubscription?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private youtubeService: YoutubeService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadVideos();
  }

  /* loadVideos() {
    if (this.loading || this.allLoaded) return;
    
    this.loading = true;
    this.error = null;

    this.videosSubscription = this.youtubeService.getMusicVideos(this.pageSize, this.page, true).subscribe({
      next: (response: any) => {
        const newVideos = response.data || [];
        
        if (newVideos.length < this.pageSize) {
          this.allLoaded = true;
        }

        const newUnique = newVideos.filter(
          (v: any) => !this.videos.some(existing => existing.youtubeVideoId === v.youtubeVideoId)
        );

        this.videos = [...this.videos, ...newUnique];
        this.filteredVideos = [...this.videos];
        this.musicVideos = this.videos.filter(video => video.title.toLowerCase().includes('music'));
        this.liveVideos = this.videos.filter(video => video.title.toLowerCase().includes('live'));
        this.page++;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load videos. Please try again later.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading videos:', err);
      }
    });
  } */

    loadVideos() {
    // If it's the initial load
    if (this.videos.length === 0) {
      this.initialLoading = true;
    } else {
      // If it's loading more
      if (this.loadingMore || this.allLoaded) return;
      this.loadingMore = true;
    }
    
    this.error = null;

    this.videosSubscription = this.youtubeService.getOfficialVideos(this.pageSize, this.page, true).subscribe({
      next: (response: any) => {
        const newVideos = response.data || [];
        
        if (newVideos.length < this.pageSize) {
          this.allLoaded = true;
        }

        const newUnique = newVideos.filter(
          (v: any) => !this.videos.some(existing => existing.youtubeVideoId === v.youtubeVideoId)
        );

        this.videos = [...this.videos, ...newUnique];
        this.filteredVideos = [...this.videos];
        this.musicVideos = this.videos.filter(video => video.title.toLowerCase().includes('music'));
        this.liveVideos = this.videos.filter(video => video.title.toLowerCase().includes('live'));
        this.page++;
        
        this.initialLoading = false;
        this.loadingMore = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load videos. Please try again later.';
        this.initialLoading = false;
        this.loadingMore = false;
        this.cdr.detectChanges();
        console.error('Error loading videos:', err);
      }
    });
  }

  onTabChange(event: any) {
    this.activeTab = event.tab.textLabel.toLowerCase();
    if (this.activeTab === 'all videos') {
      this.filteredVideos = [...this.videos];
    } else if (this.activeTab === 'music videos') {
      this.filteredVideos = this.musicVideos;
    } else if (this.activeTab === 'live') {
      this.filteredVideos = this.liveVideos;
    }
  }

  // ... rest of the methods remain the same ...
  sortBy(property: 'title' | 'views' | 'publishedAt') {
    this.filteredVideos.sort((a, b) => {
      if (property === 'publishedAt') {
        const aYears = parseInt(a.publishedAt);
        const bYears = parseInt(b.publishedAt);
        return aYears - bYears;
      } else if (property === 'views') {
        const aViews = parseFloat(a.views ?? '');
        const bViews = parseFloat(b.views ?? '');
        return bViews - aViews;
      } else {
        return (a.title ?? '').localeCompare(b.title ?? '');
      }
    });
  }

  applySearch() {
    if (!this.searchQuery) {
      this.filteredVideos = [...this.videos];
      return;
    }
    const query = this.searchQuery.toLowerCase();
    this.filteredVideos = this.videos.filter(video => 
      video.title?.toLowerCase().includes(query)
    );
  }

  applyFilters() {
    if (this.selectedCategory === 'all') {
      this.filteredVideos = [...this.videos];
      return;
    }
    
    this.filteredVideos = this.videos.filter(video => 
      video.title?.toLowerCase().includes(this.selectedCategory)
    );
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.filteredVideos = [...this.videos];
  }

  goBack() {
    this.router.navigate(['/']);
  }

  goToVideo(videoId: string) {
    this.router.navigate(['/watch', videoId]);
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredVideos = [...this.videos];
  }

  retryLoading() {
    this.error = null;
    this.loadVideos();
  }

  ngOnDestroy() {
    this.videosSubscription?.unsubscribe();
  }

  onContainerScroll(event: Event): void {
    const container = event.target as HTMLElement;
    const threshold = 100;
    
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - threshold) {
      this.loadVideos();
    }
  }

  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }

  formatDuration(duration: string): string {
    return videoDuration(duration)
  }

   formatViewCount(views: number | 0): string {
    return viewFormat(views);
  }
}