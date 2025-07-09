import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreatePlaylistDialogComponent } from './create-playlist.component';
import { LibraryService, PlaylistInterface } from '../library.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserInterface, UserService } from '../../common/services/user.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ConfirmationDialogComponent } from './details/confirmation-dialog.component';
import { PlaylistEditDialogComponent } from './details/playlist-edit.component';

@Component({
  selector: 'app-playlist',
  providers: [LibraryService],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="playlist-library-container">
      <!-- Loading state -->
      <div class="loading-state" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading your playlists...</p>
      </div>

      <!-- Signed out state -->
      <div class="empty-state signed-out" *ngIf="!loading && !currentUser">
        <div class="empty-content">
          <mat-icon class="empty-icon">video_library</mat-icon>
          <h2>Enjoy your favorite videos in playlists</h2>
          <p class="empty-description">Sign in to access your playlists or create new ones</p>
          <div class="empty-actions">
            <button mat-raised-button color="primary" (click)="router.navigate(['/auth/login'])">
              SIGN IN
            </button>
            <button mat-stroked-button (click)="router.navigate(['/videos'])">
              BROWSE VIDEOS
            </button>
          </div>
        </div>
      </div>

      <!-- Empty playlist state -->
      <div class="empty-state" *ngIf="!loading && currentUser && playlists.length === 0">
        <div class="empty-content">
          <mat-icon class="empty-icon">playlist_add</mat-icon>
          <h2>Create your first playlist</h2>
          <p class="empty-description">Save and organize your favorite DavidoTV videos in playlists</p>
          <button mat-raised-button color="primary" (click)="createPlaylist()">
            <mat-icon>add</mat-icon>
            NEW PLAYLIST
          </button>
        </div>
      </div>

      <!-- Playlist grid -->
      <div *ngIf="!loading && currentUser && playlists.length > 0" class="playlist-content">
        <div class="section-header">
          <h1 class="section-title">Your Playlists</h1>
          <button mat-raised-button color="primary" (click)="createPlaylist()" class="create-button">
            <mat-icon>add</mat-icon>
            NEW PLAYLIST
          </button>
        </div>

        <div class="playlist-grid">
          <mat-card *ngFor="let playlist of playlists" class="playlist-card" (click)="getPlaylist(playlist)">
            <div class="thumbnail-container">
              <img [src]="getPlaylistThumbnail(playlist)" alt="Playlist thumbnail" class="playlist-thumbnail">
              <div class="video-count">{{ playlist.videoCount || 0 }} videos</div>
              <div class="visibility-badge" [class.public]="playlist.isPublic" [class.private]="!playlist.isPublic">
                {{ playlist.isPublic ? 'Public' : 'Private' }}
              </div>
            </div>

            <div class="playlist-info">
              <h3 class="playlist-title">{{ playlist.title | titlecase }}</h3>
              <p class="playlist-description">{{ playlist.description || 'No description' }}</p>
              
              <div class="playlist-meta">
                <span>Updated {{ playlist.updatedAt | date }}</span>
              </div>

              <div class="playlist-tags" *ngIf="playlist.tags?.length">
                <mat-chip-set>
                  <mat-chip *ngFor="let tag of playlist.tags" [style.backgroundColor]="getTagColor(tag)">
                    {{ tag }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </div>

            <div class="playlist-actions">
              <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="editPlaylist(playlist)">
                  <mat-icon>edit</mat-icon>
                  <span>Edit</span>
                </button>
                <button mat-menu-item (click)="deletePlaylist(playlist)" color="warn">
                  <mat-icon>delete</mat-icon>
                  <span>Delete</span>
                </button>
                <mat-divider></mat-divider>
                <!-- <button mat-menu-item>
                  <mat-icon>share</mat-icon>
                  <span>Share</span>
                </button> -->
              </mat-menu>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .playlist-library-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      gap: 16px;
    }

    .loading-state p {
      color: var(--text-secondary);
    }

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: calc(100vh - 200px);
    }

    .empty-state.signed-out {
      background-color: var(--bg-card);
      border-radius: 12px;
    }

    .empty-content {
      text-align: center;
      max-width: 500px;
      padding: 24px;
    }

    .empty-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }

    .empty-state h2 {
      font-size: 24px;
      margin: 0 0 8px;
      color: var(--text-primary);
    }

    .empty-description {
      color: var(--text-secondary);
      margin-bottom: 24px;
      font-size: 16px;
    }

    .empty-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 24px;
      font-weight: 500;
      margin: 0;
      color: var(--text-primary);
    }

    .create-button {
      border-radius: 20px;
    }

    .playlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .playlist-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 0;
      overflow: hidden;
    }

    .playlist-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }

    .thumbnail-container {
      position: relative;
      width: 100%;
      aspect-ratio: 16/9;
      background-color: var(--bg-thumbnail);
    }

    .playlist-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-count {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .visibility-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 4px 8px;
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

    .playlist-info {
      padding: 16px;
      flex: 1;
    }

    .playlist-title {
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 8px;
      color: var(--text-primary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .playlist-description {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0 0 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .playlist-meta {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .playlist-tags {
      margin-top: 8px;
    }

    .playlist-actions {
      display: flex;
      justify-content: flex-end;
      padding: 0 8px 8px;
    }

    @media (max-width: 900px) {
      .playlist-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      }
    }

    @media (max-width: 600px) {
      .playlist-library-container {
        padding: 16px;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .create-button {
        width: 100%;
      }

      .playlist-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PlaylistComponent implements OnInit, OnDestroy {
  playlists: PlaylistInterface[] = [];
  loading = true;

  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);
  currentUser: UserInterface | null = null;
  subscriptions: Subscription[] = [];
  router = inject(Router);

  constructor(
    private dialog: MatDialog, 
    private libraryService: LibraryService,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.currentUser = user;
          if (!this.currentUser) {
            this.loading = false;
            this.cd.detectChanges();
            return;
          }
          this.fetchPlaylists(this.currentUser._id);
        },
        error: () => {
          this.loading = false;
          this.cd.detectChanges();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  } 

  fetchPlaylists(userId: string) {
    this.libraryService.getPlaylists(userId).subscribe({
      next: (response) => {
        //console.log('playlists ',response)
        this.playlists = response.data || [];
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  getPlaylistThumbnail(playlist: PlaylistInterface): string {
    if (playlist.previewVideos.length > 0) {
      return playlist.previewVideos?.[0]?.thumbnailUrl;
    }
    return '/img/default-playlist-thumbnail.png';
    //return playlist.previewVideos?.[0]?.thumbnail.default || 'img/default-playlist-thumbnail.png';
  }

  // getTagColor(tag: string): string {
  //   const hash = tag.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  //   const h = Math.abs(hash) % 360;
  //   return `hsl(${h}, 70%, 85%)`;
  // }

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

  createPlaylist() {
    if (!this.currentUser) return;
    
    const dialogRef = this.dialog.open(CreatePlaylistDialogComponent, {
      width: '500px',
      disableClose: false,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchPlaylists(this.currentUser?._id || '');
      }
    });
  }

  editPlaylist(playlist: PlaylistInterface) {
    const dialogRef = this.dialog.open(PlaylistEditDialogComponent, {
      width: '500px',
      data: { playlist }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchPlaylists(this.currentUser?._id || '');
      }
    });
  }

  deletePlaylist(playlist: PlaylistInterface) {
    if (!playlist._id) return;
    
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Playlist',
        message: 'Are you sure you want to delete this playlist? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (playlist._id && this.currentUser)
        this.libraryService.deletePlaylist(playlist._id, this.currentUser._id).subscribe({
          next: () => {
            this.fetchPlaylists(this.currentUser?._id || '');
            this.snackBar.open('Playlist deleted', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error deleting playlist:', err);
            this.snackBar.open('Failed to delete playlist', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  getPlaylist(playlist: PlaylistInterface) {
    if (!playlist?._id) return;
    this.router.navigate(['/library/playlist', playlist._id]);
  }
}