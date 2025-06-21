import { Component, OnDestroy, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { timeAgo as timeAgoUtil, formatDuration as videoDuration } from '../common/utils/time.util';
import { YoutubeVideoInterface } from '../common/services/youtube.service';
import { VideoService } from '../common/services/videos.service';
import { TruncatePipe } from '../common/pipes/truncate.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { UserInterface, UserService } from '../common/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

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
              <ng-container *ngIf="!isLoading  else loadingTpl">
                <div class="video-grid" *ngIf="savedVideos.length > 0 && isAuthenticated; else emptyStateTpl">
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
  isAuthenticated = false;

  subscriptions: Subscription[] = [];
  user: UserInterface | null = null; ;
  private snackBar = inject(MatSnackBar);

  constructor(
    private videoService: VideoService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef
  ) {}

 /* ngOnInit(): void {
    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          if (user) {
            this.user = user;
            this.loadSavedVideos();
            this.isAuthenticated = true;
          }
        },
        error: () => this.isAuthenticated = false
      })
    );
  }
 */

  ngOnInit(): void {
    this.subscriptions.push(
        this.userService.getCurrentUser$.subscribe({
            next: (user) => {
                this.user = user;
                this.isAuthenticated = !!user;
                if (this.isAuthenticated) {
                    this.loadSavedVideos();
                } else {
                    this.isLoading = false;
                }
            },
            error: () => {
                this.isAuthenticated = false;
                this.isLoading = false;
            }
        })
    );
}

  /* loadSavedVideos(): void {
    if (this.isAuthenticated) {
      this.isLoading = true;
      this.cdRef.detectChanges(); 

      this.videoService.getSavedVideos(this.user._id).subscribe({
        next: (response) => {
          console.log('video ',response)
          this.savedVideos = response.data;
          this.isLoading = false;
          this.cdRef.detectChanges(); 
        },
        error: (error: HttpErrorResponse) => {
          //console.error('Error loading saved videos:', err);
          let errorMessage = 'Server error occurred, please try again.'; // default error message.
          if (error.error && error.error.message) {
            errorMessage = error.error.message; // Use backend's error message if available.
          }  
          this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
          this.isLoading = false;
          this.cdRef.detectChanges(); 
        }
      });
    } 
    this.isAuthenticated = false
  } */

    loadSavedVideos(): void {
    // Only proceed if authenticated and user exists
    if (this.user && this.isAuthenticated) {
        this.isLoading = true;
        this.cdRef.detectChanges(); 
        this.videoService.getSavedVideos(this.user._id).subscribe({
            next: (response) => {
              console.log('saved video ',response.data)
              this.savedVideos = response.data;
              this.isLoading = false;
              this.cdRef.detectChanges();  
            },
            error: (error: HttpErrorResponse) => {
                const errorMessage = error.error?.message || 'Server error occurred, please try again.';
                this.snackBar.open(errorMessage, 'Ok', {duration: 3000});
                this.isLoading = false;
                this.cdRef.detectChanges(); 
            }
        });
    } else {
        this.isAuthenticated = false;
    }
}

  removeFromLibrary(youtubeVideoId: string): void {
    if (this.user && this.isAuthenticated) {
       this.videoService.removeVideoFromLibrary(this.user._id, youtubeVideoId).subscribe({
        next: (response) => {
          this.savedVideos = this.savedVideos.filter(v => v.videoId !== youtubeVideoId);
          this.snackBar.open(response.message, 'Ok',{duration: 3000});
          this.cdRef.detectChanges(); 
        },
        error: (error: HttpErrorResponse) => {
          let errorMessage = 'Server error occurred, please try again.'; // default error message.
            if (error.error && error.error.message) {
              errorMessage = error.error.message; // Use backend's error message if available.
            }  
            this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
            this.cdRef.detectChanges(); 
        }
      });
    } else {
        this.isAuthenticated = false;
    }
   
  }

  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }

  formatDuration(duration: string): string {
    return videoDuration(duration)
  }

  ngOnDestroy(): void {
    // destroy the subscription for user
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}