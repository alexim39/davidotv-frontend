import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { timeAgo as timeAgoUtil } from '../common/utils/time.util';
import { YoutubeVideoInterface } from '../common/services/youtube.service';
import { VideoService } from '../common/services/videos.service';
import { TruncatePipe } from '../common/pipes/truncate.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { UserInterface, UserService } from '../common/services/user.service';

@Component({
  selector: 'async-library',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    RouterModule,
    TruncatePipe,
    MatDividerModule
  ],
  template: `
    <div class="library-container">
      <div class="header-section">
        <div class="header-content">
          <div class="title-group">
            <mat-icon class="header-icon">video_library</mat-icon>
            <h1>Your Library</h1>
          </div>
          <div class="sort-options">
            <button mat-stroked-button class="sort-btn">
              <mat-icon>sort</mat-icon>
              <span>Sort</span>
            </button>
          </div>
        </div>
        <br>
        <mat-divider></mat-divider>
      </div>

      <div class="content-section">
        <mat-tab-group dynamicHeight>
          <mat-tab label="Saved Videos">
            <div class="tab-content">
              <ng-container *ngIf="!isLoading || !user; else loadingTpl">
                <div class="video-grid" *ngIf="savedVideos.length > 0; else emptyStateTpl">
                  <mat-card class="video-card" *ngFor="let video of savedVideos" [routerLink]="['/watch', video.videoId]">
                    <div class="thumbnail-container">
                      <img [src]="'https://i.ytimg.com/vi/' + video.videoId + '/mqdefault.jpg'" 
                           alt="{{ video.title }}" 
                           class="thumbnail">
                      <div class="duration-badge" *ngIf="video.duration">{{ formatDuration(video.duration) }}</div>
                      <div class="card-actions">
                        <button mat-icon-button (click)="removeFromLibrary(video.videoId); $event.stopPropagation()" 
                                matTooltip="Remove from library">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                    <mat-card-content>
                      <h3 class="video-title" matTooltip="{{ video.title }}">{{ video.title | truncate:50 }}</h3>
                      <p class="video-meta">
                        <span>{{ video.channel }}</span>
                        <!-- <span>{{ video.views | number }} views</span> -->
                        <span>saved: {{ timeAgo(video.savedAt) }}</span>
                      </p>
                    </mat-card-content>
                  </mat-card>
                </div>
              </ng-container>
            </div>
          </mat-tab>

          <mat-tab label="Playlists">
            <div class="tab-content">
              <div class="playlists-empty-state">
                <mat-icon class="empty-icon">playlist_add</mat-icon>
                <h3>Your playlists will appear here</h3>
                <p>Create playlists to organize your favorite Davido content</p>
                <button mat-raised-button color="primary" class="create-btn">
                  Create playlist
                </button>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <ng-template #loadingTpl>
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading your library...</p>
        </div>
      </ng-template>

      <ng-template #emptyStateTpl>
        <div class="empty-state">
          <mat-icon class="empty-icon">bookmark_border</mat-icon>
          <h3>No saved videos yet</h3>
          <p>Tap the bookmark icon on any video to save it here</p>
          <button mat-raised-button color="primary" [routerLink]="['/']" class="browse-btn">
            Browse videos
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit, OnDestroy {
  savedVideos: any[] = [];
  isLoading = true;

  subscriptions: Subscription[] = [];
  user!: UserInterface;

  constructor(
    private videoService: VideoService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef
  ) {}

 ngOnInit(): void {
    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          if (user) {
            this.user = user;
            this.loadSavedVideos();
          }
        }
      })
    );
  }

  loadSavedVideos(): void {
     if (this.user) {
      this.isLoading = true;
      this.cdRef.detectChanges(); 

      this.videoService.getSavedVideos(this.user._id).subscribe({
        next: (response) => {
          console.log('video ',response)
          this.savedVideos = response.data;
          this.isLoading = false;
          this.cdRef.detectChanges(); 
        },
        error: (err) => {
          console.error('Error loading saved videos:', err);
          this.isLoading = false;
          this.cdRef.detectChanges(); 
        }
      });
     } 

   
  }

  removeFromLibrary(videoId: string): void {
    this.videoService.removeVideoFromLibrary(this.user._id, videoId).subscribe({
      next: () => {
        this.savedVideos = this.savedVideos.filter(v => v.youtubeVideoId !== videoId);
      },
      error: (err) => console.error('Error removing video:', err)
    });
  }

  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }

  formatDuration(duration: string): string {
    // Convert ISO 8601 duration to readable format (e.g., PT4M32S -> 4:32)
    const matches = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!matches) return '';

    const hours = matches[1] ? matches[1].replace('H', '') : '';
    const minutes = matches[2] ? matches[2].replace('M', '') : '0';
    const seconds = matches[3] ? matches[3].replace('S', '') : '0';

    return hours 
      ? `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
      : `${minutes}:${seconds.padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    // destroy the subscription for user
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}