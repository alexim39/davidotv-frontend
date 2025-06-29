import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TruncatePipe } from '../common/pipes/truncate.pipe';
import { timeAgo as timeAgoUtil, formatDuration as videoDuration } from '../common/utils/time.util';
import { CommonModule } from '@angular/common';
import { Thread } from './forum.service';
import { MatButtonModule } from '@angular/material/button';
@Component({
selector: 'app-thread-list',
imports: [MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, TruncatePipe, CommonModule ],
template: `
<div class="thread-list">
  <div *ngFor="let thread of threads" class="thread-item">
    <mat-card (click)="openThread(thread._id)" class="thread-card">
      <mat-card-header>
        <img mat-card-avatar [src]="thread.author.avatar" [alt]="thread.author.name">
        <mat-card-title>{{thread.title}}</mat-card-title>
        <mat-card-subtitle>
          <span>{{thread.author.name | titlecase}} - {{thread.author.username}}</span>
         <!--  <span *ngIf="thread.commentCount == 0" matTooltip="Verified User" class="verified-badge">
            <mat-icon>verified</mat-icon>
          </span> -->
          <span class="spacer"></span>
          <span>{{timeAgo(thread.createdAt) }}</span>
        </mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <p class="thread-content">{{thread.content | truncate:150}}</p>
        
        <div class="thread-tags">
          <mat-chip-listbox>
            <mat-chip *ngFor="let tag of thread.tags" color="primary" selected>
              {{tag}}
            </mat-chip>
          </mat-chip-listbox>
        </div>
      </mat-card-content>
      
      <mat-card-actions>
        <button mat-button color="primary">
          <mat-icon>thumb_up</mat-icon>
          {{thread.likeCount}}
        </button>
        <button mat-button color="primary">
          <mat-icon>comment</mat-icon>
          {{thread.commentCount}}
        </button>
        <button mat-button color="primary">
          <mat-icon>visibility</mat-icon>
          {{thread.viewCount}}
        </button>
      </mat-card-actions>
    </mat-card>
  </div>
  
  <div *ngIf="threads.length === 0" class="no-threads">
    <mat-icon>forum</mat-icon>
    <h3>No threads yet</h3>
    <p>Be the first to start a discussion!</p>
  </div>
</div>
`,
styles: [`
.thread-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.thread-item {
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-3px);
  }
}

.thread-card {
   mat-card-header {
    align-items: center;

    mat-card-subtitle {
      display: flex;
      align-items: center;

      .spacer {
        flex: 1 1 auto;
      }

      // Ensure the time-ago span is pushed to the right
      span:last-child {
        margin-left: auto;
        color: #888;
        font-size: 13px;
        white-space: nowrap;
      }
    }
  }
  
  mat-card-content {
    .thread-content {
      margin-bottom: 16px;
      line-height: 1.5;
      //color: #333;
    }
    
    .thread-tags {
      margin-top: 10px;
      
      mat-chip {
        margin-right: 8px;
        margin-bottom: 8px;
      }
    }
  }
  
  mat-card-actions {
    display: flex;
    justify-content: space-around;
    padding: 8px 0;
    
    button {
      display: flex;
      align-items: center;
      
      mat-icon {
        margin-right: 4px;
        font-size: 18px;
      }
    }
  }
}

.no-threads {
  text-align: center;
  padding: 40px 20px;
  //color: #666;
  
  mat-icon {
    font-size: 60px;
    width: 60px;
    height: 60px;
    margin-bottom: 20px;
    //color: #ccc;
  }
  
  h3 {
    margin-bottom: 8px;
    font-weight: 500;
  }
}

@media (max-width: 600px) {
  .thread-card {
    mat-card-title {
      font-size: 16px !important;
    }
    
    mat-card-subtitle {
      font-size: 12px;
    }
    
    mat-card-content {
      .thread-content {
        font-size: 14px;
      }
    }
  }
}
`]
})
export class ThreadListComponent implements OnInit {
  @Input() threads: Thread[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    console.log('ThreadListComponent initialized with threads:', this.threads);
  }
  openThread(threadId: string) {
    if (!threadId) {
      console.error('Cannot navigate: threadId is undefined!', threadId);
      return;
    }
    this.router.navigate(['/forum/thread', threadId]);
  }

  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }
}