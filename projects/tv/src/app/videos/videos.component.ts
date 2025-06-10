import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'async-videos',
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
    MatPaginatorModule,
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
        <h1>Davido's Videos</h1>
        <span class="spacer"></span>
        <button mat-icon-button [matMenuTriggerFor]="sortMenu" aria-label="Sort options">
          <mat-icon>sort</mat-icon>
        </button>
        <mat-menu #sortMenu="matMenu">
          <button mat-menu-item (click)="sortBy('date')">
            <mat-icon>schedule</mat-icon>
            <span>Newest First</span>
          </button>
          <button mat-menu-item (click)="sortBy('views')">
            <mat-icon>visibility</mat-icon>
            <span>Most Viewed</span>
          </button>
          <button mat-menu-item (click)="sortBy('likes')">
            <mat-icon>thumb_up</mat-icon>
            <span>Most Liked</span>
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
        <div *ngIf="!loading && filteredVideos.length > 0" class="video-grid">
            <mat-card *ngFor="let video of paginatedVideos" class="video-card" (click)="goToVideo(video.id.videoId)">
            <div class="thumbnail-container">
                <img mat-card-image [src]="video.thumbnail" [alt]="video.title" loading="lazy">
                <div class="video-duration" *ngIf="video.duration">{{ video.duration }}</div>
                <mat-chip *ngIf="video.snippet.liveBroadcastContent === 'live'" color="warn" class="live-chip">
                LIVE
                </mat-chip>
            </div>
            <mat-card-content>
                <div class="video-info">
                <img [src]="video.channelIcon" alt="Channel" class="channel-icon" loading="lazy">
                <div class="video-meta">
                    <h3>{{video.title}}</h3>
                    <p class="channel-name">{{video.channel}}</p>
                    <div class="video-stats">
                    <span class="stat-item">
                        <mat-icon class="stat-icon">visibility</mat-icon>
                        {{video.views || 'N/A'}}
                    </span>
                    <span class="stat-item">
                        <mat-icon class="stat-icon">thumb_up</mat-icon>
                        {{video.likes || 'N/A'}}
                    </span>
                    <span class="stat-item">
                        {{ timeAgo(video.snippet.publishedAt)}}
                    </span>
                    </div>
                </div>
                </div>
            </mat-card-content>
            </mat-card>
        </div>

        <!-- No results -->
        <div *ngIf="!loading && filteredVideos.length === 0" class="no-results">
            <mat-icon class="no-results-icon">search_off</mat-icon>
            <h3>No videos found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button mat-raised-button color="primary" (click)="resetFilters()">Reset Filters</button>
        </div>

        <!-- Pagination -->
        <mat-paginator *ngIf="filteredVideos.length > 0" 
            [length]="filteredVideos.length"
            [pageSize]="pageSize"
            [pageSizeOptions]="[12, 24, 48]"
            (page)="onPageChange($event)"
            class="video-paginator">
        </mat-paginator>
    </div>


    </div>
  `,
  styles: [`
    .trending-all-container {
      max-width: 1600px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .header-toolbar {
      background: transparent;
      padding: 16px 0;
      margin-bottom: 16px;

      h1 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
        color: #8f0045;
      }

      .spacer {
        flex: 1 1 auto;
      }

      @media (max-width: 600px) {
        padding: 8px 0;
        h1 {
          font-size: 1.25rem;
        }
      }
    }

    .search-filter-bar {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      align-items: center;

      .search-field {
        flex: 1;
        min-width: 200px;
      }

      .filter-field {
        width: 200px;
      }

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 12px;

        .search-field, .filter-field {
          width: 100%;
        }
      }
    }



    .video-grid {
      display: grid;
      gap: 24px;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      margin-bottom: 24px;

      @media (max-width: 900px) {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      }

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    .video-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
      border-radius: 8px;
      overflow: hidden;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      }

      @media (max-width: 600px) {
        &:hover {
          transform: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .thumbnail-container {
      position: relative;
      padding-top: 56.25%; /* 16:9 aspect ratio */
      overflow: hidden;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .video-duration {
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

    .live-chip {
      position: absolute;
      top: 8px;
      left: 8px;
      font-size: 10px;
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .video-info {
      display: flex;
      margin-top: 12px;
      gap: 12px;

      .channel-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .video-meta {
        flex: 1;
        overflow: hidden;

        h3 {
          font-size: 0.95rem;
          margin: 0 0 4px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
        }

        .channel-name {
          font-size: 0.85rem;
          color: rgba(0, 0, 0, 0.7);
          margin: 0 0 6px;
        }

        .video-stats {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;

          .stat-item {
            display: flex;
            align-items: center;
            font-size: 0.8rem;
            color: rgba(0, 0, 0, 0.6);

            .stat-icon {
              font-size: 0.9rem;
              width: 16px;
              height: 16px;
              margin-right: 4px;
            }
          }
        }
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      animation: fadeIn 0.5s ease-in-out;
    }

    .loading-text {
      margin-top: 16px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.7);
      font-weight: 500;
    }

    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      text-align: center;
      padding: 24px;

      .no-results-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: rgba(0, 0, 0, 0.3);
        margin-bottom: 16px;
      }

      h3 {
        font-size: 1.25rem;
        margin: 0 0 8px;
        color: rgba(0, 0, 0, 0.8);
      }

      p {
        font-size: 1rem;
        color: rgba(0, 0, 0, 0.6);
        margin: 0 0 16px;
      }
    }

    .video-paginator {
      margin-top: 24px;
      background: transparent;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class VideosComponent {
  videos: VideoItem[] = [];
  filteredVideos: VideoItem[] = [];
  paginatedVideos: VideoItem[] = [];
  private trendingSub?: Subscription;
  loading = true;
  
  // Pagination
  pageSize = 12;
  currentPage = 0;
  
  // Filters
  searchQuery = '';
  selectedCategory = 'all';
  activeTab = 'all';

  constructor(
    private youtube: YoutubeService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadTrendingVideos();
  }

  loadTrendingVideos() {
    this.loading = true;
    this.trendingSub = this.youtube.getTrendingDavidoVideos().subscribe({
      next: (response: any) => {
        this.videos = response.items.map((item: any) => ({
          id: item.id,
          snippet: item.snippet,
          channelIcon: './img/logo.PNG',
          date: new Date(item.snippet.publishedAt).toDateString(),
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          channel: item.snippet.channelTitle,
          duration: this.formatDuration(Math.floor(Math.random() * 3600)), // Mock duration
          views: this.formatViews(Math.floor(Math.random() * 10000000)), // Mock views
          likes: this.formatViews(Math.floor(Math.random() * 500000)), // Mock likes
          category: this.getRandomCategory() // Mock category
        }));
        this.filteredVideos = [...this.videos];
        this.updatePaginatedVideos();
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
      }
    });
  }

  // Helper functions for mock data
  private formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  }

  private formatViews(views: number): string {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  }

  private getRandomCategory(): string {
    const categories = ['music', 'live', 'interview', 'behind'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  // Filtering and sorting
  applySearch() {
    if (!this.searchQuery) {
      this.filteredVideos = [...this.videos];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredVideos = this.videos.filter(video => 
        video.title?.toLowerCase().includes(query) || 
        video.channel?.toLowerCase().includes(query)
      );
    }
    this.currentPage = 0;
    this.updatePaginatedVideos();
  }

  applyFilters() {
    if (this.selectedCategory === 'all') {
      this.filteredVideos = [...this.videos];
    } else {
      this.filteredVideos = this.videos.filter((video: any) => 
        video.category === this.selectedCategory
      );
    }
    this.currentPage = 0;
    this.updatePaginatedVideos();
  }

  sortBy(criteria: string) {
    this.filteredVideos.sort((a, b) => {
      if (criteria === 'date') {
        return new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime();
      } else if (criteria === 'views') {
        // In a real app, you would compare actual view counts
        return Math.random() > 0.5 ? 1 : -1;
      } else if (criteria === 'likes') {
        // In a real app, you would compare actual like counts
        return Math.random() > 0.5 ? 1 : -1;
      }
      return 0;
    });
    this.updatePaginatedVideos();
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.filteredVideos = [...this.videos];
    this.currentPage = 0;
    this.updatePaginatedVideos();
  }



  // Pagination
  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedVideos();
  }

  updatePaginatedVideos() {
    const startIndex = this.currentPage * this.pageSize;
    this.paginatedVideos = this.filteredVideos.slice(startIndex, startIndex + this.pageSize);
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
    this.applySearch();
  }

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

  ngOnDestroy() {
    this.trendingSub?.unsubscribe();
  }
}