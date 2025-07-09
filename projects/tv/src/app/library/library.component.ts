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
import { VideoInterface, VideoService } from '../common/services/videos.service';
import { TruncatePipe } from '../common/pipes/truncate.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { UserInterface, UserService } from '../common/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { PlaylistComponent } from './playlist/playlist.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { AddPlaylistDialogComponent } from './playlist/add-video.component';
import { SavedVideoComponent } from './saved/saved.component';

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
    MatDividerModule,
    PlaylistComponent,
    MatMenuModule,
    SavedVideoComponent
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
            <async-saved-video/>
          </mat-tab>

          <mat-tab label="Playlists">
            <app-playlist/>
          </mat-tab>
        </mat-tab-group>
      </div>


    </div>
  `,
styles: [`
      .header-section {
  padding: 16px 24px;
  background-color: var(--background-color);
  position: relative;
  top: 0;
  z-index: 10;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1800px;
    margin: 0 auto;

    .title-group {
      display: flex;
      align-items: center;
      gap: 12px;

      .header-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--primary-color);
      }

      h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 500;
      }
    }

    .sort-btn, .clear-btn {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .actions-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

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

`]
})
export class LibraryComponent{}