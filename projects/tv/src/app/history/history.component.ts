import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { timeAgo as timeAgoUtil, formatDuration as videoDuration, formatViewCount as viewFormat } from '../common/utils/time.util';
import { VideoService } from '../common/services/videos.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserInterface, UserService } from '../common/services/user.service';
import { distinctUntilChanged, filter, finalize, Observable, Subscription, switchMap, tap } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';

interface WatchedVideo {
  videoId: string;
  title: string;
  channel: string;
  views: number; // Optional
  publishedAt: string | Date;
  watchedAt: string | Date;
  watchProgress: number;
}

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
    MatDividerModule,
    MatTabsModule
  ],
  template: `
    <div class="history-container">
  <!-- Header Section -->
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

  <!-- Content Section -->
  <div class="content-section">
    <ng-container *ngIf="!isLoading; else loadingTpl">
      <div class="video-grid" *ngIf="watchedVideos.length > 0 && isAuthenticated; else emptyStateTpl">
        <!-- Video Cards -->
        <mat-card class="video-card" *ngFor="let video of watchedVideos" [routerLink]="['/watch', video.videoId]">
        <div class="thumbnail-container">
          <img [src]="'https://i.ytimg.com/vi/' + video.videoId + '/mqdefault.jpg'" 
              alt="{{ video.title  }}" 
              class="thumbnail">
          <div class="progress-indicator" *ngIf="video.watchProgress > 0">
            <div class="progress-bar" [style.width.%]="video.watchProgress"></div>
          </div>
          <div class="watched-time">{{ timeAgo(video.watchedAt) }}</div>
          <div class="card-actions">
            <button mat-icon-button (click)="removeFromHistory(video.videoId); $event.stopPropagation()" 
                    matTooltip="Remove from history">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
        <mat-card-content>
          <h3 class="video-title">{{ video.title }}</h3>
          <p class="video-meta">
            <span>{{ video.channel }}</span>
            <span>{{ formatViewCount(video.views)}} views</span>
            <span>{{ timeAgo(video.publishedAt) }}</span>
          </p>
        </mat-card-content>
      </mat-card>
      </div>
    </ng-container>
  </div>

  <!-- Loading Template -->
  <ng-template #loadingTpl>
    <div class="loading-container">
      <mat-spinner diameter="50"></mat-spinner>
      <p>Loading your history...</p>
    </div>
  </ng-template>

  <!-- Empty State Template -->
  <ng-template #emptyStateTpl>
    <div class="empty-state">
      <mat-icon class="empty-icon">history</mat-icon>
      <h3>No watch history</h3>
      <p>Videos you watch will appear here</p>
      <button mat-raised-button color="primary" [routerLink]="['/videos']" class="browse-btn">
        Browse videos
      </button>
    </div>
  </ng-template>
</div>
  `,
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {
 watchedVideos: WatchedVideo[] = [];
  isLoading = true;
  sortOrder: 'newest' | 'oldest' = 'newest';
  private snackBar = inject(MatSnackBar);
  private subscriptions: Subscription[] = [];
  user: UserInterface | null = null;

  // Compute isAuthenticated as a getter to avoid state management issues
  get isAuthenticated(): boolean {
    return !!this.user;
  }

  constructor(
    private videoService: VideoService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef
  ) {}

 /*  ngOnInit(): void {
    this.subscriptions.push(
      this.userService.getCurrentUser$.pipe(
        filter(user => {
          // Update user first
          this.user = user;
          return !!user;
        }),
        switchMap(() => this.loadWatchHistory())
      ).subscribe()
    );
  }

  loadWatchHistory(): Observable<void> {
    this.isLoading = true;
    return this.videoService.getWatchHistory(this.user!._id).pipe(
      tap({
        next: (response: any) => {
          //console.log('watched ', response.data)
          this.watchedVideos = response.data as WatchedVideo[];
          this.sortByDate(this.sortOrder);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading watch history:', err);
          this.isLoading = false;
          this.snackBar.open('Failed to load history', 'Close', { duration: 2000 });
        }
      })
    );
  } */


    ngOnInit(): void {
  this.subscriptions.push(
    this.userService.getCurrentUser$.pipe(
      distinctUntilChanged(),
      tap(user => {
        this.user = user;
        this.cdRef.markForCheck(); // Trigger change detection after user update
      }),
      filter(user => !!user),
      switchMap(() => this.loadWatchHistory())
    ).subscribe()
  );
}

loadWatchHistory(): Observable<void> {
  this.isLoading = true;
  this.cdRef.markForCheck(); // Trigger change detection immediately
  
  return this.videoService.getWatchHistory(this.user!._id).pipe(
    tap({
      next: (response: any) => {
        this.watchedVideos = response.data;
        this.sortByDate(this.sortOrder);
        this.isLoading = false;
        this.cdRef.markForCheck(); // Trigger change detection after data load
      },
      error: (err) => {
        this.isLoading = false;
        this.cdRef.markForCheck(); // Trigger change detection on error
        this.snackBar.open('Failed to load history', 'Close', { duration: 2000 });
      }
    })
  );
}

 removeFromHistory(watchedVideoId: string): void {
  this.isLoading = true;
  this.cdRef.markForCheck();

  if (this.user?._id) {
    this.subscriptions.push(
      this.videoService.removeFromHistory(watchedVideoId, this.user._id).subscribe({
        next: (response) => {
          this.watchedVideos = this.watchedVideos.filter(v => v.videoId !== watchedVideoId);
          this.isLoading = false;
          this.cdRef.markForCheck();
          this.snackBar.open(response.message, 'Close', { duration: 2000 });
        },
        error: (err) => {
          console.error('Error removing video:', err);
          this.isLoading = false;
          this.cdRef.markForCheck();
          this.snackBar.open('Failed to remove from history', 'Close', { duration: 2000 });
        }
      })
    );
  }
}

clearHistory(): void {
  if (confirm('Are you sure you want to clear all watch history?')) {
    this.isLoading = true;
    this.cdRef.markForCheck();

    if (this.user?._id) {
      this.subscriptions.push(
        this.videoService.clearHistory(this.user._id).subscribe({
          next: (response) => {
            this.watchedVideos = [];
            this.isLoading = false;
            this.cdRef.markForCheck();
            this.snackBar.open(response.message, 'Close', { duration: 2000 });
          },
          error: (err) => {
            console.error('Error clearing history:', err);
            this.isLoading = false;
            this.cdRef.markForCheck();
            this.snackBar.open('Failed to clear history', 'Close', { duration: 2000 });
          }
        })
      );
    }
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

  formatDuration(duration: string): string {
      return videoDuration(duration);
  }

  formatViewCount(views: number | 0): string {
    return viewFormat(views);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}