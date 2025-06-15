import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { VideoService } from "../videos.service";
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
import { timeAgo as timeAgoUtil } from '../../common/utils/time.util';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'async-trending-all',
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
    MatTabsModule
  ],
  template: `
    <div class="trending-all-container">
      <!-- Header with back button and title -->
      <mat-toolbar class="header-toolbar">
        <button mat-icon-button (click)="goBack()" aria-label="Back button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Trending Videos</h1>
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
          <input matInput placeholder="Search trending videos" [(ngModel)]="searchQuery" (input)="applySearch()">
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
            <!-- Loading state -->
            <div *ngIf="loading" class="loading-container">
              <mat-spinner diameter="50" strokeWidth="2" color="accent"></mat-spinner>
              <p class="loading-text">Loading trending videos...</p>
            </div>

            <!-- Videos grid -->
            <div *ngIf="!loading && videos.length > 0" class="video-grid">
              <mat-card *ngFor="let video of filteredVideos" class="video-card" (click)="goToVideo(video.youtubeVideoId)">
                <div class="thumbnail-container">
                  <img mat-card-image [src]="'https://i.ytimg.com/vi/' + video.youtubeVideoId + '/mqdefault.jpg'"  [alt]="video.title" loading="lazy">
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
            <div *ngIf="!loading && filteredVideos.length === 0 && videos.length > 0" class="no-results">
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
        </mat-tab>
        <mat-tab label="Music Videos">
          <!-- Similar content structure for music videos -->
        </mat-tab>
        <mat-tab label="Live">
          <!-- Similar content structure for live videos -->
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styleUrls: ['./trending-all.component.scss'],
})
export class TrendingAllComponent implements OnInit, OnDestroy {
  videos: any[] = [];
  filteredVideos: any[] = [];
  loading = true;
  error: string | null = null;
  currentSortOrder: 'viewCount' | 'date' | 'relevance' = 'viewCount';
  
  // Filters
  searchQuery = '';
  selectedCategory = 'all';
  activeTab = 'all';

  private videoSubscription?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private videoService: VideoService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadVideos();
  }

 /*  loadVideos() {
    this.loading = true;
    this.error = null;
    
    this.videoSubscription = this.videoService.getDavidoVideos().subscribe({
      next: (response) => {
        this.videos = response.data || [];
        this.filteredVideos = [...this.videos];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load videos. Please try again later.';
        this.loading = false;
        console.error('Error loading videos:', err);
      }
    });
  } */

    loadVideos() {
      this.loading = true;
      this.error = null;
      
      this.videoSubscription = this.videoService.getDavidoVideos().subscribe({
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

  changeSortOrder(order: 'viewCount' | 'date' | 'relevance') {
    if (this.currentSortOrder !== order) {
      this.currentSortOrder = order;
      // Sort the videos based on the selected order
      this.filteredVideos.sort((a, b) => {
        if (order === 'date') {
          return this.extractTimeValue(b.publishedAt) - this.extractTimeValue(a.publishedAt);
        } else if (order === 'viewCount') {
          return this.extractViewCount(b.views) - this.extractViewCount(a.views);
        }
        return 0; // For relevance, we keep the original order
      });
    }
  }

  private extractTimeValue(publishedAt: string): number {
    // Convert "X years ago" to a numerical value for sorting
    const match = publishedAt.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  }

  private extractViewCount(views: string): number {
    // Convert "245M views" to a numerical value for sorting
    const match = views.match(/([\d.]+)([MK])?/);
    if (!match) return 0;
    
    const num = parseFloat(match[1]);
    const unit = match[2];
    
    if (unit === 'M') return num * 1000000;
    if (unit === 'K') return num * 1000;
    return num;
  }

  applySearch() {
    if (!this.searchQuery) {
      this.filteredVideos = [...this.videos];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredVideos = this.videos.filter(video => 
        video.title.toLowerCase().includes(query)
      );
    }
  }

  applyFilters() {
    if (this.selectedCategory === 'all') {
      this.filteredVideos = [...this.videos];
    } else {
      this.filteredVideos = this.videos.filter(video => 
        video.title.toLowerCase().includes(this.selectedCategory)
      );
    }
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.filteredVideos = [...this.videos];
  }

  onTabChange(event: any) {
    this.activeTab = event.tab.textLabel.toLowerCase();
    if (this.activeTab === 'all videos') {
      this.filteredVideos = [...this.videos];
    } else {
      this.filteredVideos = this.videos.filter(video => 
        video.title.toLowerCase().includes(this.activeTab.split(' ')[0])
      );
    }
  }

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
    this.filteredVideos = [...this.videos];
  }

  retryLoading() {
    this.error = null;
    this.loadVideos();
  }

  ngOnDestroy() {
    if (this.videoSubscription) {
      this.videoSubscription.unsubscribe();
    }
  }

   timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }
}