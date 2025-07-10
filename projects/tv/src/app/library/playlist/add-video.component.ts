import { ChangeDetectorRef, Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LibraryService } from '../library.service';
import { UserInterface, UserService } from '../../common/services/user.service';
import { Subscription } from 'rxjs';
import { CreatePlaylistDialogComponent } from './create-playlist.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'async-add-playlist-dialog',
  providers: [LibraryService],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="add-to-playlist-dialog">
      <!-- Loading state -->
      <div class="loading-state" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading your playlists...</p>
      </div>

      <!-- Signed out state -->
      <div class="empty-state" *ngIf="!isLoading && !currentUser">
        <mat-icon class="empty-icon">login</mat-icon>
        <h2>Sign in to manage playlists</h2>
        <p class="empty-description">You need to sign in to add videos to playlists</p>
      </div>

      <!-- Empty playlist state -->
      <div class="empty-state" *ngIf="!isLoading && currentUser && playlists.length === 0">
        <mat-icon class="empty-icon">playlist_add</mat-icon>
        <h2>No playlists yet</h2>
        <p class="empty-description">Create your first playlist to save this video</p>
        <button mat-raised-button color="primary" (click)="createPlaylist()">
          <mat-icon>add</mat-icon>
          CREATE PLAYLIST
        </button>
      </div>

      <!-- Playlist selection -->
      <div *ngIf="!isLoading && currentUser && playlists.length > 0" class="playlist-selection">
        <h2 mat-dialog-title>Save to playlist</h2>
        <mat-dialog-content>
          <div class="playlist-list">
            <div *ngFor="let playlist of playlists" class="playlist-item" (click)="addVideoToPlaylist(playlist._id)">
              <div class="playlist-thumbnail">
                <img [src]="getPlaylistThumbnail(playlist)" alt="Playlist thumbnail">
                <div class="video-count">{{ playlist.videoCount || 0 }} videos</div>
              </div>
              
              <div class="playlist-info">
                <h3 class="playlist-title">{{ playlist.title }}</h3>
                <p class="playlist-description">{{ playlist.description || 'No description' }}</p>
                <div class="playlist-meta">
                  <span class="visibility-badge" [class.public]="playlist.isPublic" [class.private]="!playlist.isPublic">
                    {{ playlist.isPublic ? 'Public' : 'Private' }}
                  </span>
                  <span>• Updated {{ playlist.updatedAt | date }}</span>
                </div>
              </div>
              
              <div class="add-button">
                <button mat-icon-button color="primary" matTooltip="Add to playlist">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </mat-dialog-content>

        <mat-divider></mat-divider>

        <mat-dialog-actions>
          <button mat-button (click)="dialogRef.close()">CANCEL</button>
          <button mat-button color="primary" (click)="createPlaylist()">
            <mat-icon>add</mat-icon>
            NEW PLAYLIST
          </button>
        </mat-dialog-actions>
      </div>
    </div>
  `,
  styles: [`
    .add-to-playlist-dialog {
      max-width: 500px;
      width: 100%;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;
    }

    .loading-state p {
      color: var(--text-secondary);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 40px 24px;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }

    .empty-state h2 {
      font-size: 20px;
      margin: 0 0 8px;
      color: var(--text-primary);
    }

    .empty-description {
      color: var(--text-secondary);
      margin-bottom: 24px;
    }

    .playlist-selection {
      display: flex;
      flex-direction: column;
    }

    h2.mat-dialog-title {
      padding: 16px 24px 8px;
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    mat-dialog-content {
      padding: 0;
      max-height: 60vh;
      overflow-y: auto;
    }

    .playlist-list {
      padding: 8px 0;
    }

    .playlist-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .playlist-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .playlist-thumbnail {
      position: relative;
      width: 80px;
      height: 45px;
      border-radius: 4px;
      overflow: hidden;
      background-color: var(--bg-thumbnail);
      flex-shrink: 0;
      margin-right: 16px;
    }

    .playlist-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-count {
      position: absolute;
      bottom: 0;
      right: 0;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 2px 4px;
      font-size: 10px;
      border-top-left-radius: 4px;
    }

    .playlist-info {
      flex: 1;
      min-width: 0;
    }

    .playlist-title {
      font-size: 14px;
      font-weight: 500;
      margin: 0 0 4px;
      color: var(--text-primary);
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .playlist-description {
      font-size: 12px;
      color: var(--text-secondary);
      margin: 0 0 4px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .playlist-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: var(--text-secondary);
    }

    .visibility-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
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

    .add-button {
      margin-left: 8px;
    }

    mat-dialog-actions {
      display: flex;
      justify-content: space-between;
      padding: 16px 24px;
    }

    @media (max-width: 600px) {
      .add-to-playlist-dialog {
        max-width: 100%;
      }

      .playlist-item {
        padding: 12px;
      }

      mat-dialog-actions {
        padding: 12px 16px;
      }
    }
  `]
})
export class AddPlaylistDialogComponent implements OnInit {
  playlists: any[] = [];
  isLoading = true;

  private userService = inject(UserService);
  currentUser: UserInterface | null = null;
  subscriptions: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddPlaylistDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { videoId: string, userId: string },
    private libraryService: LibraryService,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog, 
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.currentUser = user;
          if (!this.currentUser) {
            this.isLoading = false;
            this.cdRef.detectChanges();
            return;
          }
          this.loadPlaylists();
        },
        error: () => {
          this.isLoading = false;
          this.cdRef.detectChanges();
        }
      })
    );
  }

  loadPlaylists(): void {
    this.libraryService.getPlaylists(this.data.userId).subscribe({
      next: (response) => {
        this.playlists = response.data || [];
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Failed to load playlists', 'OK', { duration: 3000 });
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  getPlaylistThumbnail(playlist: any): string {
    if (playlist.previewVideos.length > 0) {
      return playlist.previewVideos[0].thumbnailUrl;
    }
    return 'img/default-playlist-thumbnail.png';
    //return playlist.videos?.[0]?.thumbnailUrl || 'assets/default-playlist-thumbnail.jpg';
  }

  

  addVideoToPlaylist(playlistId: string): void {
    const formattedPayload = {
      playlistId,
      userId: this.data.userId,
      videoId: this.data.videoId
    };
    
    this.libraryService.addVideoToPlaylist(formattedPayload).subscribe({
      next: (response) => {
        this.snackBar.open(response.message, 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to add video to playlist', 'Close', { duration: 3000 });
      }
    });
  }

  createPlaylist() {
    if (!this.currentUser) return;
    
    const dialogRef = this.dialog.open(CreatePlaylistDialogComponent, {
      width: '500px',
      disableClose: false,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPlaylists();
      }
    });
  }
}