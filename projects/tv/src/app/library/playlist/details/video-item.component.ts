import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { timeAgo as timeAgoUtil, formatDuration as videoDuration, formatViewCount as viewFormat, formatLikeCount as likeFormat, formatDislikesCount as dislikesFormat } from '../../../common/utils/time.util';
import { LibraryService } from '../../library.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserInterface, UserService } from '../../../common/services/user.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-video-item',
  standalone: true,
  providers: [LibraryService],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <div class="video-item">
      <div class="thumbnail-container">
        <img [src]="video.thumbnailUrl" alt="Video thumbnail" class="thumbnail">
        <div class="duration-badge" *ngIf="showDuration && video.duration">
          {{ formatDuration(video.duration) }}
        </div>
        <div class="index-badge" *ngIf="showIndex">
          {{ index }}
        </div>
      </div>
      
      <div class="video-info">
        <div class="video-meta">
          <h3 class="video-title">{{ video.title }}</h3>
          <div class="video-stats" *ngIf="showChannel || showViews || showDate">
            <span *ngIf="showChannel && video.channel">{{ video.channel }}</span>
            <span *ngIf="showViews && video.views">{{ formatViews(video.views) }} views</span>
            <span *ngIf="showDate && video.uploadDate">{{ video.uploadDate | date }}</span>
          </div>
        </div>
        
        <div class="video-actions">
          <button mat-icon-button [matMenuTriggerFor]="menu" *ngIf="showMenu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="removeVideo(video)">
              <mat-icon>auto_delete</mat-icon>
              <span>Remove from playlist</span>
            </button>
            <button mat-menu-item (click)="playVideo(video)">
              <mat-icon>music_video</mat-icon>
              <span>Play video</span>
            </button>
            <!--<mat-divider></mat-divider>
             <button mat-menu-item (click)="shareVideo(video)">
              <mat-icon>share</mat-icon>
              <span>Share</span>
            </button> -->
          </mat-menu>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .video-item {
      display: flex;
      gap: 16px;
      padding: 8px;
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .video-item:hover {
      background-color: var(--bg-hover);
    }

    .thumbnail-container {
      position: relative;
      flex-shrink: 0;
      width: 168px;
      height: 94px;
      border-radius: 4px;
      overflow: hidden;
      background-color: var(--bg-thumbnail);
    }

    .thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .duration-badge {
      position: absolute;
      bottom: 4px;
      right: 4px;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 2px 4px;
      border-radius: 2px;
      font-size: 12px;
      font-weight: 500;
    }

    .index-badge {
      position: absolute;
      top: 4px;
      left: 4px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 500;
    }

    .video-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      min-width: 0;
    }

    .video-meta {
      flex: 1;
      min-width: 0;
    }

    .video-title {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .video-stats {
      font-size: 12px;
      color: var(--text-secondary);
      display: flex;
      flex-wrap: wrap;
      gap: 4px 8px;
    }

    .video-actions {
      flex-shrink: 0;
    }

    @media (max-width: 600px) {
      .thumbnail-container {
        width: 120px;
        height: 68px;
      }
    }
  `]
})
export class VideoItemComponent implements OnInit, OnDestroy {
  @Input() video: any;
  @Input() playlistId!: string;
  @Input() showIndex = false;
  @Input() index = 0;
  @Input() showMenu = true;
  @Input() showDuration = true;
  @Input() showChannel = true;
  @Input() showViews = true;
  @Input() showDate = true;

  @Output() videoRemoved = new EventEmitter<string>();// Emit the video ID when removed

  private snackBar = inject(MatSnackBar);
  private libraryService = inject(LibraryService);
  private cd = inject(ChangeDetectorRef);
  private router = inject(Router);

  private userService = inject(UserService);
  currentUser: UserInterface | null = null;
  subscriptions: Subscription[] = [];

  ngOnInit(): void {
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

  formatDuration(duration: string): string {
      return videoDuration(duration);
  }

  formatViews(views: number): string {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  }

 removeVideo(video: any) {
    //console.log('this video ', video);
    if (this.video.youtubeVideoId && this.currentUser && this.playlistId) {
      this.libraryService.removeVideoFromPlaylist(
        this.video.youtubeVideoId,
        this.currentUser?._id,
        this.playlistId
      ).subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Ok', { duration: 3000 });
          // Emit the video ID to the parent component
          this.videoRemoved.emit(this.video.youtubeVideoId);
        },
        error: (error) => {
          let errorMessage = 'Server error occurred, please try again.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Ok', { duration: 3000 });
          this.cd.detectChanges();
        }
      });
    }
  }

  playVideo(video: any) {
    this.router.navigate(['/watch', video.youtubeVideoId]);
  }
  
  shareVideo(video: any) {
    if (navigator.share) {
      navigator.share({
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.snackBar.open('Link copied to clipboard!', '', { duration: 2000 });
    }
  }
}