import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'async-video-info-sheet',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
  
  <div class="video-info-sheet">
  <div class="sheet-header">
    <h3>{{ data.video.title }}</h3>
    <button mat-icon-button (click)="close()">
      <mat-icon>close</mat-icon>
    </button>
  </div>

  <div class="video-stats">
    <div class="stat-item">
      <mat-icon>visibility</mat-icon>
      <span>{{ formatViewCount(data.video.views) }} views</span>
    </div>
    <div class="stat-item">
      <mat-icon>schedule</mat-icon>
      <span>{{ data.video.publishedAt | date }}</span>
    </div>
  </div>

  <div class="channel-info">
    <div class="channel-avatar">
      <img [src]="'https://i.ytimg.com/vi/' + data.video.youtubeVideoId + '/mqdefault.jpg'" alt="Channel avatar">
    </div>
    <div class="channel-details">
      <h4>{{ data.video.channel }}</h4>
      <p>Official Channel</p>
    </div>
  </div>

  <div class="video-description">
    <p>{{ data.video.description || 'No description available' }}</p>
  </div>

  <div class="action-buttons">
    <button mat-button (click)="likeVideo()" [class.liked]="data.isLiked">
      <mat-icon>{{ data.isLiked ? 'favorite' : 'favorite_border' }}</mat-icon>
      {{ formatViewCount(data.appLikes) }}
    </button>
    <button mat-button (click)="dislikeVideo()" [class.disliked]="data.isDisliked">
      <mat-icon>thumb_down</mat-icon>
      {{ formatViewCount(data.appDislikes) }}
    </button>
    <button mat-button (click)="saveVideo()">
      <mat-icon>{{ data.isSaved ? 'bookmark' : 'bookmark_border' }}</mat-icon>
      {{ data.isSaved ? 'Saved' : 'Save' }}
    </button>
    <button mat-button (click)="shareVideo()">
      <mat-icon>share</mat-icon>
      Share
    </button>
  </div>
</div>
  
  `,
styles: [`

.video-info-sheet {
  padding: 16px;
  color: white;
  background: #121212;
  max-height: 80vh;
  overflow-y: auto;

  .sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      flex: 1;
    }

    button {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .video-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }
  }

  .channel-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .channel-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .channel-details {
      h4 {
        margin: 0;
        font-size: 16px;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }

  .video-description {
    margin-bottom: 24px;
    font-size: 14px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.9);
    white-space: pre-line;
  }

  .action-buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 16px;

    button {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: rgba(255, 255, 255, 0.9);
      min-width: 64px;

      mat-icon {
        margin-bottom: 4px;
      }

      &.liked {
        color: #ff2d55;
      }

      &.disliked {
        color: #5c6bc0;
      }
    }
  }
}
  
  `]
})
export class VideoInfoSheetComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheetRef: MatBottomSheetRef<VideoInfoSheetComponent>
  ) {}

  likeVideo() {
    this.bottomSheetRef.dismiss({ action: 'like' });
  }

  dislikeVideo() {
    this.bottomSheetRef.dismiss({ action: 'dislike' });
  }

  saveVideo() {
    this.bottomSheetRef.dismiss({ action: 'save' });
  }

  shareVideo() {
    this.bottomSheetRef.dismiss({ action: 'share' });
  }

  close() {
    this.bottomSheetRef.dismiss();
  }

  formatViewCount(views: number): string {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  }
}