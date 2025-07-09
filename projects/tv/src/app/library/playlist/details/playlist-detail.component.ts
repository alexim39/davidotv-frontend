import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LibraryService, PlaylistInterface } from '../../library.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VideoItemComponent } from './video-item.component';
import { PlaylistEditDialogComponent } from './playlist-edit.component';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { UserInterface, UserService } from '../../../common/services/user.service';
//import { PlaylistEditDialogComponent } from '../playlist-edit-dialog/playlist-edit-dialog.component';
//import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
//import { VideoItemComponent } from '../video-item/video-item.component';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  providers: [LibraryService],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    VideoItemComponent
  ],
  template: `
    <div class="playlist-detail-container">
      <!-- Header with back button and actions -->
      <div class="playlist-header">
        <button mat-button class="back-button" (click)="handleBack()">
          <mat-icon>arrow_back</mat-icon>
          Back
        </button>
        
        <div class="action-buttons" *ngIf="playlist">
          <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Playlist actions">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="openEditDialog()">
              <mat-icon>edit</mat-icon>
              <span>Edit playlist</span>
            </button>
            <button mat-menu-item (click)="openDeleteDialog()" color="warn">
              <mat-icon>delete</mat-icon>
              <span>Delete playlist</span>
            </button>
            <!-- <mat-divider></mat-divider>
             <button mat-menu-item>
              <mat-icon>share</mat-icon>
              <span>Share</span>
            </button> -->
          </mat-menu>
        </div>
      </div>

      <!-- Loading state -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading playlist details...</p>
      </div>

      <!-- Playlist content -->
      <div *ngIf="!loading && playlist" class="playlist-content">
        <!-- Playlist info section -->
        <div class="playlist-info-section">
          <div class="playlist-thumbnail">
            <img [src]="getPlaylistThumbnail()" alt="Playlist thumbnail" class="thumbnail-image">
            <div class="video-count">{{ playlist.videos?.length || 0 }} videos</div>
          </div>
          
          <div class="playlist-meta">
            <div class="playlist-title">{{ playlist.title | titlecase }}</div>
            <div class="playlist-stats">
              <span class="visibility-badge" [class.public]="playlist.isPublic" [class.private]="!playlist.isPublic">
                {{ playlist.isPublic ? 'Public' : 'Private' }}
              </span>
              <span>•</span>
              <span>{{ playlist.videos?.length || 0 }} videos</span>
              <span>•</span>
              <span>Updated {{ playlist.updatedAt | date }}</span>
            </div>
            
            <div class="playlist-description">
              {{ playlist.description || 'No description provided.' }}
            </div>
            
            <div class="playlist-actions">
              <button mat-raised-button color="primary" class="play-all-button">
                <mat-icon>play_arrow</mat-icon>
                PLAY ALL
              </button>
              <button mat-stroked-button class="shuffle-button">
                <mat-icon>shuffle</mat-icon>
                SHUFFLE
              </button>
              <!-- <button mat-icon-button matTooltip="Save to library">
                <mat-icon>bookmark_add</mat-icon>
              </button> -->
              <button mat-icon-button matTooltip="Share">
                <mat-icon>share</mat-icon>
              </button>
            </div>
            
            <div class="playlist-tags" *ngIf="playlist.tags?.length">
              <mat-chip-listbox>
                <mat-chip *ngFor="let tag of playlist.tags" [style.backgroundColor]="getTagColor(tag)">
                  {{ tag }}
                </mat-chip>
              </mat-chip-listbox>
            </div>
          </div>
        </div>

        <!-- Video list section -->
        <div class="video-list-section">
          <div class="section-header">
            <h2>Videos in this playlist</h2>
            <div class="sort-options">
              <button mat-button [matMenuTriggerFor]="sortMenu">
                <span>Sort by</span>
                <mat-icon>arrow_drop_down</mat-icon>
              </button>
              <mat-menu #sortMenu="matMenu">
                <button mat-menu-item>Date added (newest first)</button>
                <button mat-menu-item>Date added (oldest first)</button>
                <button mat-menu-item>Most popular</button>
                <button mat-menu-item>Video title (A-Z)</button>
              </mat-menu>
            </div>
          </div>
          
          <div *ngIf="playlist.videos?.length; else noVideos" class="video-grid">
            <app-video-item 
              *ngFor="let video of playlist.videos; let i = index" 
              [video]="video" 
              [playlistId]="playlistId" 
              [showIndex]="true"
              [index]="i + 1"
              [showMenu]="true"
              [showDuration]="true"
              [showChannel]="true"
              [showViews]="true"
              [showDate]="true"
              (videoRemoved)="onVideoRemoved($event)"
            />
          </div>
          
          <ng-template #noVideos>
            <div class="empty-state">
              <mat-icon class="empty-icon">playlist_play</mat-icon>
              <h3>This playlist has no videos yet</h3>
              <p>Add videos to this playlist to see them appear here</p>
             <!--  <button mat-raised-button color="primary" class="add-videos-button">
                <mat-icon>add</mat-icon>
                ADD VIDEOS
              </button> -->
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Not found state -->
      <div *ngIf="!loading && !playlist" class="not-found-state">
        <mat-icon class="not-found-icon">error_outline</mat-icon>
        <h2>Playlist not found</h2>
        <p>The playlist you're looking for doesn't exist or may have been removed.</p>
        <button mat-raised-button color="primary" (click)="handleBack()">
          <mat-icon>arrow_back</mat-icon>
          BACK TO LIBRARY
        </button>
      </div>
    </div>
  `,
  styles: [`
    .playlist-detail-container {
      padding: 16px 24px;
      max-width: 1280px;
      margin: 0 auto;
      color: var(--text-primary);
    }

    .playlist-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .back-button {
      display: flex;
      align-items: center;
      color: var(--text-primary);
      font-weight: 500;
    }

    .back-button mat-icon {
      margin-right: 8px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      gap: 16px;
    }

    .loading-container p {
      color: var(--text-secondary);
    }

    .playlist-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .playlist-info-section {
      display: flex;
      gap: 24px;
      padding: 16px;
      border-radius: 8px;
      background-color: var(--bg-card);
    }

    .playlist-thumbnail {
      position: relative;
      min-width: 320px;
      height: 180px;
      border-radius: 8px;
      overflow: hidden;
      background-color: var(--bg-thumbnail);
    }

    .thumbnail-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-count {
      position: absolute;
      bottom: 0;
      right: 0;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      font-size: 12px;
      border-top-left-radius: 4px;
    }

    .playlist-meta {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }

    .playlist-title {
      font-size: 24px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .playlist-stats {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .visibility-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .visibility-badge.public {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .visibility-badge.private {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .playlist-description {
      font-size: 14px;
      color: var(--text-primary);
      line-height: 1.5;
    }

    .playlist-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .play-all-button, .shuffle-button {
      border-radius: 20px;
    }

    .playlist-tags {
      margin-top: 12px;
    }

    .video-list-section {
      background-color: var(--bg-card);
      border-radius: 8px;
      padding: 16px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-header h2 {
      font-size: 20px;
      font-weight: 500;
      margin: 0;
      color: var(--text-primary);
    }

    .sort-options button {
      color: var(--text-primary);
    }

    .video-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
      text-align: center;
    }

    .empty-icon {
      font-size: 60px;
      width: 60px;
      height: 60px;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 18px;
      margin: 8px 0;
      color: var(--text-primary);
    }

    .empty-state p {
      color: var(--text-secondary);
      margin-bottom: 16px;
    }

    .add-videos-button {
      border-radius: 20px;
    }

    .not-found-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      text-align: center;
    }

    .not-found-icon {
      font-size: 60px;
      width: 60px;
      height: 60px;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }

    .not-found-state h2 {
      font-size: 22px;
      margin: 8px 0;
      color: var(--text-primary);
    }

    .not-found-state p {
      color: var(--text-secondary);
      margin-bottom: 24px;
      max-width: 400px;
    }

    @media (max-width: 900px) {
      .playlist-info-section {
        flex-direction: column;
      }

      .playlist-thumbnail {
        width: 100%;
        min-width: auto;
        aspect-ratio: 16/9;
        height: auto;
      }
    }

    @media (max-width: 600px) {
      .playlist-detail-container {
        padding: 16px;
      }

      .playlist-title {
        font-size: 20px;
      }

      .playlist-actions {
        flex-wrap: wrap;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class PlaylistDetailComponent implements OnInit, OnDestroy {
  playlist: PlaylistInterface & { videos?: any[] } | null = null;
  loading = true;
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  private userService = inject(UserService);
  currentUser: UserInterface | null = null;
  subscriptions: Subscription[] = [];
  playlistId = ''

  constructor(
    private route: ActivatedRoute,
    private libraryService: LibraryService,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    const playlistId = this.route.snapshot.paramMap.get('playlistId');
    if (playlistId) {
      this.playlistId = playlistId; // set playlist id for video item component
      this.libraryService.getPlaylistById(playlistId).subscribe({
        next: (response) => {
          this.playlist = response.data;
          this.loading = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cd.detectChanges();
        }
      });
    } else {
      this.loading = false;
      this.cd.detectChanges();
    }

     this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.currentUser = user;
          //console.log('current user ',this.user)
        }
      })
    )
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleBack(): void {
    this.router.navigate(['/library/']);
  }

  getPlaylistThumbnail(): string {
    if (this.playlist?.thumbnailUrl) {
      return this.playlist.thumbnailUrl;
    }
    // Return first video's thumbnail or default image
    return this.playlist?.videos?.[0]?.thumbnailUrl || 'img/default-playlist-thumbnail.png';
  }

  getTagColor(tag: string, textColor: 'auto' | 'black' | 'white' = 'auto'): string {
    const hash = tag.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const h = Math.abs(hash) % 360;
    const backgroundColor = `hsl(${h}, 70%, 85%)`;

    if (textColor === 'black') return `${backgroundColor}; color: black`;
    if (textColor === 'white') return `${backgroundColor}; color: white`;
    
    // Auto-determine text color based on background brightness
    const lightness = 85; // Matches the lightness in HSL
    return `${backgroundColor}; color: ${lightness > 60 ? 'black' : 'white'}`;
  }

  openEditDialog(): void {
    if (!this.playlist) return;
    
    const dialogRef = this.dialog.open(PlaylistEditDialogComponent, {
      width: '600px',
      data: { playlist: this.playlist }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle playlist update
        this.playlist = { ...this.playlist, ...result };
      }
    });
  }

  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Playlist',
        message: 'Are you sure you want to delete this playlist? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.playlist) {
        // Call delete service method
        if (this.playlist._id && this.currentUser) 
        this.libraryService.deletePlaylist(this.playlist._id, this.currentUser?._id).subscribe({
          next: (response) => {
            
            this.snackBar.open(response.message, 'Ok',{duration: 3000});
            this.router.navigate(['/library']);
          },
          error: (error) => {
            //console.error('Error deleting playlist:', err);
            let errorMessage = 'Server error occurred, please try again.'; // default error message.
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Use backend's error message if available.
            }  
            this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
           this.cd.detectChanges();
          }
        });
      }
    });
  }

 onVideoRemoved(videoId: string): void {
  if (!this.playlist?.videos) return;
  
  // Create a new array reference for change detection
  this.playlist = {
    ...this.playlist,
    videos: this.playlist.videos.filter((video: any) => video.youtubeVideoId !== videoId)
  };
}
}