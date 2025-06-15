import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { VideoItem, VideoService } from "./videos.service";
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
import { timeAgo as timeAgoUtil } from '../common/utils/time.util';

@Component({
  selector: 'async-videos',
  providers: [VideoService],
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
        <h1>Davido's Videos</h1>
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

      <!-- video content -->
      <div class="video-content">
        <!-- Loading state -->
        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="50" strokeWidth="2" color="accent"></mat-spinner>
          <p class="loading-text">Loading Davido videos...</p>
        </div>

        <!-- Videos grid -->
        <div *ngIf="videos.length > 0" class="video-grid">
          <mat-card *ngFor="let video of filteredVideos" class="video-card" (click)="goToVideo(video.youtubeVideoId)">
            <div class="thumbnail-container">
              <img mat-card-image [src]="'https://i.ytimg.com/vi/' + video.youtubeVideoId + '/mqdefault.jpg'" [alt]="video.title" loading="lazy">
              <div class="video-duration">3:45</div>
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
                      {{ video.views }}
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

        <!-- No results -->
        <div *ngIf="!loading && filteredVideos.length === 0 && !error" class="no-results">
          <mat-icon class="no-results-icon">search_off</mat-icon>
          <h3>No videos found</h3>
          <p>Try adjusting your search or filter criteria</p>
          <button mat-raised-button color="primary" (click)="resetFilters()">Reset Filters</button>
        </div>

        <!-- Error state -->
        <div *ngIf="error" class="error-state">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <h3>Error loading videos</h3>
          <p>{{ error }}</p>
          <button mat-raised-button color="primary" (click)="retryLoading()">Retry</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./videos.component.scss']
})
export class VideosComponent implements OnInit, OnDestroy {
  allVideos: VideoItem[] = []
  /* allVideos: DavidoVideo[] = [
    { youtubeVideoId: 'NnWe5Lhi0G8', title: 'Davido - Fall',  thumbnail: 'https://i.ytimg.com/vi/NnWe5Lhi0G8/mqdefault.jpg', views: '245M views', publishedAt: '5 years ago' },
    { youtubeVideoId: 'helEv0kGHd4', title: 'Davido - IF',  thumbnail: 'https://i.ytimg.com/vi/helEv0kGHd4/mqdefault.jpg', views: '187M views', publishedAt: '4 years ago' },
    { youtubeVideoId: 'l6QMJniQWxQ', title: 'Davido - Assurance',  thumbnail: 'https://i.ytimg.com/vi/l6QMJniQWxQ/mqdefault.jpg', views: '98M views', publishedAt: '3 years ago' },
    { youtubeVideoId: '8ORvJcpe2Oc', title: 'Davido - Assurance',  thumbnail: 'https://i.ytimg.com/vi/8ORvJcpe2Oc/mqdefault.jpg', views: '98M views', publishedAt: '3 years ago' },
    { youtubeVideoId: 'oiHh2-6jmnU', title: 'Davido - Assurance',  thumbnail: 'https://i.ytimg.com/vi/oiHh2-6jmnU/mqdefault.jpg', views: '98M views', publishedAt: '3 years ago' },
    { youtubeVideoId: '3Iyuym-Gci0', title: 'Davido - Fall',  thumbnail: 'https://i.ytimg.com/vi/3Iyuym-Gci0/mqdefault.jpg', views: '98M views', publishedAt: '3 years ago' },
    { youtubeVideoId: 'QGrxqOcZpZU', title: 'Davido - Fall',  thumbnail: 'https://i.ytimg.com/vi/QGrxqOcZpZU/mqdefault.jpg', views: '98M views', publishedAt: '3 years ago' },
    { youtubeVideoId: 'dAD73UeU6Dw', title: 'Davido - Fall',  thumbnail: 'https://i.ytimg.com/vi/dAD73UeU6Dw/mqdefault.jpg', views: '98M views', publishedAt: '3 years ago' },
  ]; */
  videos: VideoItem[] = [];
  filteredVideos: VideoItem[] = [];
  loading = false;
  error: string | null = null;
  
  // Filters
  searchQuery = '';
  selectedCategory = 'all';
  private videosSubscription?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private videoService: VideoService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadVideos();
  }


    loadVideos() {
      this.loading = true;
      this.error = null;
      
      this.videosSubscription = this.videoService.getDavidoVideos().subscribe({
        next: (response) => {
          this.videos = response.data || [];
          this.filteredVideos = [...this.videos];
          this.loading = false;
          this.cdr.detectChanges(); // <-- add this
        },
        error: (err) => {
          this.error = 'Failed to load videos. Please try again later.';
          this.loading = false;
          this.cdr.detectChanges(); // <-- add this
          console.error('Error loading videos:', err);
        }
      });
    }

  // Sorting
  sortBy(property: 'title' | 'views' | 'publishedAt') {
    this.filteredVideos.sort((a, b) => {
      if (property === 'publishedAt') {
        // Extract numeric value from "X years ago"
        const aYears = parseInt(a.publishedAt);
        const bYears = parseInt(b.publishedAt);
        return aYears - bYears;
      } else if (property === 'views') {
        // Extract numeric value from views string (e.g., "245M views" -> 245)
        const aViews = parseFloat(a.views ?? '');
        const bViews = parseFloat(b.views ?? '');
        return bViews - aViews;
      } else {
        // Sort by title
        return (a.title ?? '').localeCompare(b.title ?? '');
      }
    });
  }

  // Filtering and searching
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

  // Navigation
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

  // Handle scroll event (currently does nothing, but required for template binding)
  onContainerScroll(event: Event): void {
    // You can implement infinite scroll or analytics here if needed
  }

   timeAgo(date: string | Date): string {
      return timeAgoUtil(date);
    }
}