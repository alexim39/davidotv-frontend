import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { timeAgo as timeAgoUtil } from '../common/utils/time.util';
import { YoutubeVideoInterface } from '../common/services/youtube.service';
import { VideoService } from '../common/services/videos.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'async-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    RouterModule,
    MatDividerModule
  ],
  template: `
    <div class="history-container">
      <div class="header-section">
        <div class="header-content">
          <div class="title-group">
            <mat-icon class="header-icon">history</mat-icon>
            <h1>Watch History</h1>
          </div>
          <div class="actions-group">
            <button mat-stroked-button class="clear-btn" (click)="clearHistory()" matTooltip="Clear all history">
              <mat-icon>delete_sweep</mat-icon>
              <span>Clear all</span>
            </button>
            <button mat-icon-button [matMenuTriggerFor]="sortMenu" matTooltip="Sort options">
              <mat-icon>sort</mat-icon>
            </button>
            <mat-menu #sortMenu="matMenu">
              <button mat-menu-item (click)="sortByDate('newest')">
                <mat-icon>arrow_downward</mat-icon>
                <span>Newest first</span>
              </button>
              <button mat-menu-item (click)="sortByDate('oldest')">
                <mat-icon>arrow_upward</mat-icon>
                <span>Oldest first</span>
              </button>
            </mat-menu>
          </div>
        </div>
        <br>
        <mat-divider></mat-divider>
      </div>

      <div class="content-section">
        <ng-container *ngIf="!isLoading; else loadingTpl">
          <div class="history-list" *ngIf="watchedVideos.length > 0; else emptyStateTpl">
            <div class="history-item" *ngFor="let video of watchedVideos" [routerLink]="['/watch', video.youtubeVideoId]">
              <div class="thumbnail-container">
                <img [src]="'https://i.ytimg.com/vi/' + video.youtubeVideoId + '/mqdefault.jpg'" 
                     alt="{{ video.title }}" 
                     class="thumbnail">
                <div class="progress-indicator" *ngIf="video.watchProgress > 0">
                  <div class="progress-bar" [style.width.%]="video.watchProgress"></div>
                </div>
                <div class="watched-time">{{ timeAgo(video.watchedAt) }}</div>
              </div>
              <div class="video-info">
                <h3 class="video-title">{{ video.title }}</h3>
                <p class="video-channel">{{ video.channel }}</p>
                <p class="video-stats">
                  <span>{{ video.views | number }} views</span>
                  <span>{{ timeAgo(video.publishedAt) }}</span>
                </p>
              </div>
              <button mat-icon-button class="more-btn" (click)="removeFromHistory(video.youtubeVideoId); $event.stopPropagation()" 
                      matTooltip="Remove from history">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        </ng-container>
      </div>

      <ng-template #loadingTpl>
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading your history...</p>
        </div>
      </ng-template>

      <ng-template #emptyStateTpl>
        <div class="empty-state">
          <mat-icon class="empty-icon">history</mat-icon>
          <h3>No watch history</h3>
          <p>Videos you watch will appear here</p>
          <button mat-raised-button color="primary" [routerLink]="['/']" class="browse-btn">
            Browse videos
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  //watchedVideos: YoutubeVideoInterface[] = [];
  watchedVideos: any[] = [];
  isLoading = true;
  sortOrder: 'newest' | 'oldest' = 'newest';

  constructor(private videoService: VideoService) {}

  ngOnInit(): void {
    this.loadWatchHistory();
  }

  loadWatchHistory(): void {
    this.isLoading = true;
    this.videoService.getWatchHistory().subscribe({
      next: (videos) => {
        this.watchedVideos = videos;
        this.sortByDate(this.sortOrder);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading watch history:', err);
        this.isLoading = false;
      }
    });
  }

  removeFromHistory(videoId: string): void {
    this.videoService.removeFromHistory(videoId).subscribe({
      next: () => {
        this.watchedVideos = this.watchedVideos.filter(v => v.youtubeVideoId !== videoId);
      },
      error: (err) => console.error('Error removing video:', err)
    });
  }

  clearHistory(): void {
    if (confirm('Are you sure you want to clear all watch history?')) {
      this.videoService.clearHistory().subscribe({
        next: () => {
          this.watchedVideos = [];
        },
        error: (err) => console.error('Error clearing history:', err)
      });
    }
  }

  sortByDate(order: 'newest' | 'oldest'): void {
    this.sortOrder = order;
    this.watchedVideos.sort((a, b) => {
      const dateA = new Date(a.watchedAt).getTime();
      const dateB = new Date(b.watchedAt).getTime();
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }

  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }
}