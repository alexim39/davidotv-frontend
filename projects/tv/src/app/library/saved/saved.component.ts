import { Component, OnDestroy, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { timeAgo as timeAgoUtil, formatDuration as videoDuration } from '../../common/utils/time.util';
import { VideoInterface, VideoService } from '../../common/services/videos.service';
import { TruncatePipe } from '../../common/pipes/truncate.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { UserInterface, UserService } from '../../common/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { AddPlaylistDialogComponent } from '../playlist/add-video.component';
import { tap, filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'async-saved-video',
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
    MatDividerModule,
    MatMenuModule
  ],
  template: `
    <div class="library-container">
      

      <div class="content-section">
        
            <div class="tab-content">
              <ng-container *ngIf="!isLoading || !user  else loadingTpl">
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
                        <br>
                        <br>
                        <button mat-icon-button [matMenuTriggerFor]="playlistMenu" (click)="addToPlaylist(video.videoId); $event.stopPropagation()"
                                matTooltip="Add to playlist">
                          <mat-icon>playlist_add</mat-icon>
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

                    <mat-menu #playlistMenu="matMenu">
                   <!--  <button mat-menu-item (click)="addToPlaylist(video.videoId)">
                      <mat-icon>add_to_queue</mat-icon>
                      <span>Add to playlist</span>
                    </button> -->
                    <!-- <button mat-menu-item (click)="addToPlaylist('favorites')">
                      <mat-icon>favorite</mat-icon>
                      <span>Favorites</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item [routerLink]="['/library/playlists']">
                      <mat-icon>add</mat-icon>
                      <span>Create new playlist</span>
                    </button> -->
                  </mat-menu>

                  </mat-card>
                </div>
              </ng-container>
            </div>
       
      </div>

      <ng-template #loadingTpl>
        <div class="loading-container">
          <mat-spinner diameter="50"/>
          <p>Loading your library...</p>
        </div>
      </ng-template>

      <ng-template #emptyStateTpl>
        <div class="empty-state">
          <mat-icon class="empty-icon">bookmark_border</mat-icon>
          <h3>No saved videos yet</h3>
          <p>Tap the bookmark icon on any video to save it here</p>
          <button mat-flat-button color="primary" [routerLink]="['/videos']" class="browse-btn">
            Browse videos
          </button>
        </div>
      </ng-template>
    </div>
  `,
styles: [`



.content-section {
  padding: 16px 24px;
  max-width: 1800px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;

  p {
    margin: 0;
    color: var(--text-secondary);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
  max-width: 500px;
  margin: 0 auto;

  .empty-icon {
    font-size: 48px;
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    color: var(--text-secondary);
    opacity: 0.7;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
    font-weight: 500;
  }

  p {
    margin: 0 0 24px 0;
    color: var(--text-secondary);
  }

  .browse-btn, .create-btn {
    padding: 8px 24px;
    border-radius: 20px;
  }
}
 
/* Library specific styles */
.library-container {
  background-color: var(--background-color);
  min-height: 100vh;

  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    padding: 16px 0;
  }

  .video-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--card-background);
  position: relative; // Add this line

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    
    .card-actions {
      opacity: 1;
    }
  }

  .thumbnail-container {
    position: relative;
    padding-top: 56.25%; /* 16:9 aspect ratio */
    overflow: hidden;

    .thumbnail {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .duration-badge {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .card-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 2; // Add this to ensure it's above other elements
      opacity: 1 !important;
      transition: opacity 0.2s ease;

      button {
        background-color: rgb(191, 29, 29) !important; /* Make it stand out */
        color: white !important;
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.1);
          background-color: rgba(0, 0, 0, 0.9);
        }

        &.active {
          color: var(--primary-color);
        }
      }
    }
  }

  mat-card-content {
    padding: 16px;
    position: relative; // Add this
    z-index: 1; // Add this

    .video-title {
      margin: 0 0 8px 0;
      font-size: 1rem;
      font-weight: 500;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .video-meta {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-secondary);
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      span {
        display: inline-block;
      }
    }
  }
}

  .playlists-empty-state {
    padding: 40px 0;
  }
}


/* Responsive adjustments */
@media (max-width: 768px) {
  .header-section {
    padding: 16px;

    .header-content {
      .title-group {
        h1 {
          font-size: 1.25rem;
        }
      }
    }
  }

  .content-section {
    padding: 16px;
  }

  .library-container {
    .video-grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }
  }
}

@media (max-width: 480px) {
  .library-container {
    .video-grid {
      grid-template-columns: 1fr;
    }
  }

  .history-container {
    .history-item {
      .video-info {
        .video-title {
          font-size: 0.9rem;
        }
      }
    }
  }
}

`]
})
export class SavedVideoComponent implements OnInit, OnDestroy {
  savedVideos: VideoInterface[] = [];
  isLoading = true;
  isAuthenticated = false;

  subscriptions: Subscription[] = [];
  user: UserInterface | null = null;
 ;
  private snackBar = inject(MatSnackBar);

  constructor(
    private videoService: VideoService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog, 
  ) {}

  ngOnInit(): void {
  this.subscriptions.push(
    this.userService.getCurrentUser$.pipe(
      tap(user => {
        this.user = user;
        this.isAuthenticated = !!user;
        this.cdRef.markForCheck(); // Mark for check instead of detectChanges
      }),
      filter(user => !!user), // Only proceed if user exists
      switchMap(user => {
        this.isLoading = true;
        this.cdRef.markForCheck();
        return this.videoService.getSavedVideos(user._id);
      })
    ).subscribe({
      next: (response) => {
        this.savedVideos = response.data;
        this.isLoading = false;
        this.cdRef.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'Server error occurred, please try again.';
        this.snackBar.open(errorMessage, 'Ok', {duration: 3000});
        this.isLoading = false;
        this.cdRef.markForCheck();
      }
    })
  );
}

  loadSavedVideos(): void {
    // Only proceed if authenticated and user exists
    if (this.user && this.isAuthenticated) {
        this.isLoading = true;
        this.cdRef.detectChanges(); 
        this.videoService.getSavedVideos(this.user._id).subscribe({
            next: (response) => {
              //console.log('saved video ',response.data)
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

 // Update the addToPlaylist method
  addToPlaylist(videoId: string): void {
    if (!this.user) return;

    const dialogRef = this.dialog.open(AddPlaylistDialogComponent, {
      width: '500px',
      data: { videoId, userId: this.user._id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Optional: Handle any post-dialog actions
      }
    });
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