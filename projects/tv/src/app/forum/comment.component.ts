import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Comment } from './forum.service';
import { timeAgo as timeAgoUtil, formatDuration as videoDuration } from '../common/utils/time.util';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
selector: 'app-comment',
imports: [MatIconModule, CommonModule, MatFormFieldModule, MatProgressBarModule, MatProgressSpinnerModule, ReactiveFormsModule],
template: `
<div class="comment">
  <div class="comment-main">
    <img class="comment-avatar" [src]="comment.author.avatar" [alt]="comment.author.name">
    
    <div class="comment-content">
      <div class="comment-header">
        <span class="comment-author"> {{timeAgo(comment.createdAt)}} </span>
        <span *ngIf="comment.author.isVerified" class="verified-badge" matTooltip="Verified User">
          <mat-icon>verified</mat-icon>
        </span>
        <span class="comment-time">{{comment.author.name}}</span>
      </div>
      
      <div class="comment-text">{{comment.content}}</div>
      
      <div class="comment-actions">
        <button mat-raised-button 
                (click)="toggleLike()" 
                [ngClass]="comment.isLiked ? 'mat-accent' : 'mat-primary'">
          <mat-icon>thumb_up</mat-icon>
          {{comment.likeCount}}
        </button>
        <button mat-button (click)="toggleReply()">
          <mat-icon>reply</mat-icon>
          Reply
        </button>
        <button *ngIf="comment.replies && comment.replies.length > 0" mat-button (click)="toggleReplies()">
          <mat-icon>{{showReplies ? 'expand_less' : 'expand_more'}}</mat-icon>
          {{comment.replies.length}} {{comment.replies.length === 1 ? 'reply' : 'replies'}}
        </button>
      </div>
      
      <div class="comment-reply-form" *ngIf="isReplying">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Your reply</mat-label>
          <textarea matInput [formControl]="replyControl" rows="2"></textarea>
        </mat-form-field>
        <div class="reply-buttons">
          <button mat-button (click)="toggleReply()">Cancel</button>
          <button mat-raised-button color="primary" 
                  (click)="addReply()"
                  [disabled]="replyControl.invalid || isSubmitting">
            <span *ngIf="!isSubmitting">Post Reply</span>
            <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <div class="comment-replies" *ngIf="showReplies && comment.replies.length > 0">
    <app-comment *ngFor="let reply of comment.replies" 
                [comment]="reply" 
                [threadId]="threadId"
                (likeComment)="likeComment.emit($event)">
    </app-comment>
  </div>
</div>
`,
styles: [`
    
.comment {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 8px;
  
  .comment-main {
    display: flex;
    gap: 15px;
  }
  
  .comment-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }
  
  .comment-content {
    flex: 1;
    
    .comment-header {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      font-size: 14px;
      
      .comment-author {
        font-weight: 500;
        margin-right: 4px;
        color: #666;
        font-size: 12px;
      }
      
      .verified-badge {
        color: #1DA1F2;
        font-size: 16px;
        margin-right: 8px;
      }
      
      .comment-time {
        margin-left: 0; // Ensure no left margin
        margin-right: auto; // Pushes it to the left
        order: -1; // Makes it appear first in the flex row
      }
    }
    
    .comment-text {
      margin-bottom: 10px;
      line-height: 1.5;
      white-space: pre-line;
    }
    
    .comment-actions {
      button {
        min-width: auto;
        padding: 0 8px;
        font-size: 12px;
        line-height: 24px;
        
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          margin-right: 4px;
        }
      }
    }
    
    .comment-reply-form {
      margin-top: 15px;
      
      .reply-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 10px;
      }
    }
  }
  
  .comment-replies {
    margin-top: 20px;
    margin-left: 30px;
    padding-left: 15px;
    border-left: 2px solid #eee;
    
    .comment {
      background-color: #fff;
      border: 1px solid #eee;
    }
  }
}

@media (max-width: 600px) {
  .comment {
    padding: 12px;
    
    .comment-main {
      gap: 10px;
    }
    
    .comment-avatar {
      width: 36px;
      height: 36px;
    }
    
    .comment-replies {
      margin-left: 20px;
    }
  }
}  

`]
})
export class CommentComponent implements OnInit {
  @Input() comment!: Comment;
  @Input() threadId!: string;
  @Input() isAuthor!: boolean;
  @Input() deleteComment!: string;
  @Output() likeComment = new EventEmitter<string>();
  
  replyControl = new FormControl('', Validators.required);
  isReplying = false;
  isSubmitting = false;
  showReplies = true;

  ngOnInit() {
    if (!this.comment.replies) {
      this.comment.replies = [];
    }
  }

  toggleReply() {
    this.isReplying = !this.isReplying;
    if (!this.isReplying) {
      this.replyControl.reset();
    }
  }

  addReply() {
    if (this.replyControl.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    
    // In a real app, this would call a service to add the reply
    const newReply: Comment = {
      id: 'reply' + (this.comment.replies.length + 1),
      content: this.replyControl.value ?? '',
      author: {
        id: 'user1',
        name: 'Current User',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        isVerified: true,
        username: ''
      },
      createdAt: new Date(),
      likeCount: 0,
      replies: [],
      isLiked: false
    };
    
    this.comment.replies.unshift(newReply);
    this.replyControl.reset();
    this.isReplying = false;
    this.isSubmitting = false;
    this.showReplies = true;
  }

  toggleLike() {
    this.likeComment.emit(this.comment.id);
  }

  toggleReplies() {
    this.showReplies = !this.showReplies;
  }

  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }
}