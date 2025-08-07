import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SocialFeedService, SocialPost } from './feed.service';
import { MatTabsModule } from '@angular/material/tabs';
import { CommentDialogComponent } from './comment-dialog.component';
import { ShortNumberPipe } from './short-number.pipe';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-social-feed',
  standalone: true,
  providers: [SocialFeedService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTabsModule,
    CommonModule,
    ShortNumberPipe,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  template: `
    <div class="social-feed-container">
      <div class="header">
        <h1>Davido's Social Feed</h1>
        <p>All updates from Davido's social networks in one place</p>
      </div>

      <mat-tab-group (selectedTabChange)="filterPosts($event.index)">
        <mat-tab label="All"></mat-tab>
        <mat-tab label="Instagram"></mat-tab>
        <mat-tab label="Twitter"></mat-tab>
        <mat-tab label="TikTok"></mat-tab>
      </mat-tab-group>

      <div *ngIf="isLoading && posts.length === 0" class="loading-spinner">
         <mat-spinner diameter="50" strokeWidth="2"/>
         <p class="loading-text">Loading feeds...</p>
      </div>

      <div class="posts-grid">
        <mat-card 
          *ngFor="let post of posts; trackBy: trackByPostId" 
          class="post-card"
        >
          <!-- Rest of your template remains the same -->
          <div class="post-header">
            <img [src]="post.platformIcon" [alt]="post.platform" class="platform-icon">
            <span class="platform-name">{{post.platform}}</span>
            <span class="post-time">{{post.time | date:'short'}}</span>
            <button mat-icon-button [matMenuTriggerFor]="postMenu" class="more-button">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #postMenu="matMenu">
              <button mat-menu-item (click)="sharePost(post)">
                <mat-icon>share</mat-icon>
                <span>Share</span>
              </button>
              <button mat-menu-item>
                <mat-icon>bookmark</mat-icon>
                <span>Save</span>
              </button>
            </mat-menu>
          </div>

          <div class="post-content">
            <p *ngIf="post.text" class="post-text">{{post.text}}</p>
            
            <div *ngIf="post.mediaType === 'image'" class="post-media">
              <img [src]="post.mediaUrl" [alt]="post.text" (load)="onImageLoad()">
            </div>
            
            <div *ngIf="post.mediaType === 'video'" class="post-media video-container">
              <video controls>
                <source [src]="post.mediaUrl" type="video/mp4">
              </video>
            </div>
          </div>

          <div class="post-actions">
            <button mat-icon-button (click)="likePost(post)" [class.liked]="post.isLiked">
              <mat-icon>{{post.isLiked ? 'favorite' : 'favorite_border'}}</mat-icon>
              <span>{{post.likes | shortNumber}}</span>
            </button>
            <button mat-icon-button (click)="openComments(post)">
              <mat-icon>comment</mat-icon>
              <span>{{post.commentsCount | shortNumber}}</span>
            </button>
            <button mat-icon-button (click)="sharePost(post)">
              <mat-icon>share</mat-icon>
            </button>
          </div>
        </mat-card>
      </div>

      <div *ngIf="isLoading && posts.length > 0" class="loading-more">
        <mat-spinner [color]="primaryColor" diameter="30"></mat-spinner>
      </div>
    </div>
  `,
  styles: [`
    $primary-color: #8f0045;

    .social-feed-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;

      .header {
        text-align: center;
        margin-bottom: 30px;

        h1 {
          color: $primary-color;
          font-weight: 700;
          margin-bottom: 8px;
        }

        p {
          color: rgba(0, 0, 0, 0.6);
          font-size: 16px;
        }
      }

      .mat-tab-group {
        margin-bottom: 20px;
      }

      .posts-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .post-card {
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transition: transform 0.2s, box-shadow 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
        }

        .post-header {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);

          .platform-icon {
            width: 24px;
            height: 24px;
            margin-right: 8px;
          }

          .platform-name {
            font-weight: 500;
            flex-grow: 1;
          }

          .post-time {
            color: rgba(0, 0, 0, 0.5);
            font-size: 12px;
            margin-right: 8px;
          }

          .more-button {
            color: rgba(0, 0, 0, 0.5);
          }
        }

        .post-content {
          padding: 16px;

          .post-text {
            margin-bottom: 16px;
            white-space: pre-line;
            line-height: 1.5;
          }

          .post-media {
            margin: 0 -16px;
            width: calc(100% + 32px);

            img, video {
              width: 100%;
              display: block;
              max-height: 600px;
              object-fit: contain;
              background: #f5f5f5;
            }

            &.video-container {
              position: relative;
              padding-bottom: 56.25%; // 16:9 aspect ratio
              height: 0;
              overflow: hidden;

              video {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
              }
            }
          }
        }

        .post-actions {
          display: flex;
          padding: 8px 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);

          button {
            margin-right: 16px;
            display: flex;
            align-items: center;

            mat-icon {
              margin-right: 4px;
            }

            span {
              font-size: 14px;
            }

            &.liked {
              color: $primary-color;
            }
          }
        }
      }

      .loading-spinner, .loading-more {
        display: flex;
        justify-content: center;
        padding: 40px 0;
        .loading-text {
            margin-left: 5px;
        }
      }
    }

    // Responsive styles
    @media (max-width: 600px) {
      .social-feed-container {
        padding: 10px;

        .header {
          h1 {
            font-size: 24px;
          }
        }

        .post-card {
          .post-content {
            padding: 12px;

            .post-media {
              margin: 0 -12px;
              width: calc(100% + 24px);
            }
          }
        }
      }
    }
  `]
})
export class SocialFeedComponent implements OnInit {
  posts: SocialPost[] = [];
  isLoading = false;
  currentFilter: 'all' | 'instagram' | 'twitter' | 'tiktok' = 'all';
  primaryColor = '#8f0045';

  constructor(
    private socialFeedService: SocialFeedService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  trackByPostId(index: number, post: SocialPost): string {
    return post.id;
  }

  loadPosts(): void {
    this.isLoading = true;
    this.cdr.markForCheck(); // Mark for check since isLoading changed
    
    this.socialFeedService.getPosts(this.currentFilter).subscribe(posts => {
      this.posts = [...posts]; // Create new array reference
      this.isLoading = false;
      this.cdr.markForCheck(); // Mark for check after data arrives
    });
  }

  filterPosts(tabIndex: number): void {
    const filters = ['all', 'instagram', 'twitter', 'tiktok'] as const;
    this.currentFilter = filters[tabIndex];
    this.loadPosts();
  }

  likePost(post: SocialPost): void {
    this.socialFeedService.likePost(post.id).subscribe(updatedPost => {
      // Update the specific post immutably
      this.posts = this.posts.map(p => 
        p.id === post.id ? { ...p, likes: updatedPost.likes, isLiked: updatedPost.isLiked } : p
      );
      this.cdr.markForCheck();
    });
  }

  openComments(post: SocialPost): void {
    const dialogRef = this.dialog.open(CommentDialogComponent, {
      width: '100%',
      maxWidth: '600px',
      data: { post }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle any updates if comments were added
        this.cdr.markForCheck();
      }
    });
  }

  sharePost(post: SocialPost): void {
    // Implement share functionality
    console.log('Sharing post:', post);
  }

  onScroll(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.cdr.markForCheck();
    
    this.socialFeedService.loadMorePosts(this.currentFilter).subscribe(newPosts => {
      this.posts = [...this.posts, ...newPosts]; // New array reference
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  onImageLoad(): void {
    // Handle image load event if needed
    console.log('Image loaded');
  }
}