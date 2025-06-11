import { CommonModule } from "@angular/common";
import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { VideoItem } from "./videos.service";
import { Router, ActivatedRoute } from "@angular/router";
import { YoutubeService } from "./../common/services/youtube.service";
import { MatChipsModule } from "@angular/material/chips";
import { Subscription } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'async-videos',
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
          <button mat-menu-item (click)="changeSortOrder('date')">
            <mat-icon>schedule</mat-icon>
            <span>Newest First</span>
          </button>
          <button mat-menu-item (click)="changeSortOrder('viewCount')">
            <mat-icon>visibility</mat-icon>
            <span>Most Viewed</span>
          </button>
          <button mat-menu-item (click)="changeSortOrder('relevance')">
            <mat-icon>thumb_up</mat-icon>
            <span>Most Relevant</span>
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
        <div *ngIf="loading && videos.length === 0" class="loading-container">
          <mat-spinner diameter="50" strokeWidth="2" color="accent"></mat-spinner>
          <p class="loading-text">Loading Davido videos...</p>
        </div>

        <!-- Videos grid -->
        <div *ngIf="videos.length > 0" class="video-grid">
          <mat-card *ngFor="let video of videos" class="video-card" (click)="goToVideo(video.id.videoId)">
            <div class="thumbnail-container">
              <img mat-card-image [src]="video.snippet.thumbnails.high.url" [alt]="video.snippet.title" loading="lazy">
              <div class="video-duration">{{ getRandomDuration() }}</div>
              <mat-chip *ngIf="video.snippet.liveBroadcastContent === 'live'" color="warn" class="live-chip">
                LIVE
              </mat-chip>
            </div>
            <mat-card-content>
              <div class="video-info">
                <img src="./img/ytch.jpeg" alt="Channel" class="channel-icon" loading="lazy">
                <div class="video-meta">
                  <h3>{{ video.snippet.title }}</h3>
                  <p class="channel-name">{{ video.snippet.channelTitle }}</p>
                  <div class="video-stats">
                    <span class="stat-item">
                      <mat-icon class="stat-icon">visibility</mat-icon>
                      {{ formatViews(Math.floor(Math.random() * 10000000)) }}
                    </span>
                    <span class="stat-item">
                      <mat-icon class="stat-icon">thumb_up</mat-icon>
                      {{ formatViews(Math.floor(Math.random() * 500000)) }}
                    </span>
                    <span class="stat-item">
                      {{ timeAgo(video.snippet.publishedAt) }}
                    </span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Loading more indicator -->
        <div *ngIf="loadingMore" class="loading-more">
          <mat-spinner diameter="40" strokeWidth="2" color="accent"></mat-spinner>
          <p>Loading more videos...</p>
        </div>

        <!-- No results -->
        <div *ngIf="!loading && videos.length === 0 && !error" class="no-results">
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
  videos: any[] = [];
  loading = true;
  loadingMore = false;
  error: string | null = null;
  currentSortOrder: 'viewCount' | 'date' | 'relevance' = 'date';
  
  // Filters
  searchQuery = '';
  selectedCategory = 'all';
  private nextPageToken = '';
  private videosSubscription?: Subscription;

  // For manual infinite scroll
  private scrollThreshold = 300; // px from bottom
Math: any;

  constructor(
    private youtubeService: YoutubeService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadVideos();
  }

  loadVideos() {
    this.loading = true;
    this.error = null;
    
    this.videosSubscription = this.youtubeService.fetchDavidoVideos(this.currentSortOrder).subscribe({
      next: (response) => {
        this.videos = response.items;
        this.nextPageToken = response.nextPageToken || '';
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to load videos. Please try again later.';
        this.loading = false;
        console.error('Error loading videos:', err);
      }
    });
  }

  // Manual infinite scroll handler
  onContainerScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (
      !this.loadingMore &&
      this.nextPageToken &&
      target.scrollHeight - target.scrollTop - target.clientHeight < this.scrollThreshold
    ) {
      this.loadMoreVideos();
    }
  }

  loadMoreVideos() {
    if (!this.nextPageToken) return;

    this.loadingMore = true;
    this.youtubeService.fetchDavidoVideos(this.currentSortOrder, 12, this.nextPageToken).subscribe({
      next: (response) => {
        this.videos = [...this.videos, ...response.items];
        this.nextPageToken = response.nextPageToken || '';
        this.loadingMore = false;
      },
      error: (err) => {
        this.error = 'Failed to load more videos.';
        this.loadingMore = false;
        console.error('Error loading more videos:', err);
      }
    });
  }

  changeSortOrder(order: 'viewCount' | 'date' | 'relevance') {
    if (this.currentSortOrder !== order) {
      this.currentSortOrder = order;
      this.videos = [];
      this.loadVideos();
    }
  }

  // Filtering and sorting
  applySearch() {
    if (!this.searchQuery) {
      return;
    }
    const query = this.searchQuery.toLowerCase();
    this.videos = this.videos.filter(video => 
      video.snippet.title.toLowerCase().includes(query) || 
      video.snippet.channelTitle.toLowerCase().includes(query)
    );
  }

  applyFilters() {
    if (this.selectedCategory === 'all') {
      return;
    }
    this.videos = this.videos.filter(() => Math.random() > 0.3);
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.loadVideos();
  }

  // Navigation
  goBack() {
    this.router.navigate(['/']);
  }

  goToVideo(videoId: string | undefined) {
    if (videoId) {
      this.router.navigate(['/watch', videoId]);
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.loadVideos();
  }

  retryLoading() {
    this.error = null;
    this.loadVideos();
  }

  // Helper functions
  timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const i in intervals) {
      const interval = Math.floor(seconds / intervals[i]);
      if (interval >= 1) {
        return `${interval} ${i}${interval > 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  }

  formatViews(views: number): string {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  }

  getRandomDuration(): string {
    const seconds = Math.floor(Math.random() * 3600);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  }

  ngOnDestroy() {
    this.videosSubscription?.unsubscribe();
  }
}