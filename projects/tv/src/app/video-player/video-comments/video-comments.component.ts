import { Component, Input, Output, EventEmitter, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { timeAgo as timeAgoUtil } from '../../common/utils/time.util';
import { UserInterface, UserService } from '../../common/services/user.service';
import { Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../common/component/confirmationDialog.component';
import { VideoCommentService } from './video-comments.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'async-video-comments',
  standalone: true,
  providers: [VideoCommentService],
  imports: [
    CommonModule, 
     FormsModule,
     MatIconModule, 
     MatButtonModule, 
     MatInputModule,
     MatFormFieldModule,
     ReactiveFormsModule,
     MatMenuModule,
     MatProgressBarModule,
    ],
  template: `
<div class="comments-container">
  <!-- Comments Header -->
  <div class="comments-header">
    <h2 class="comments-title">{{ (comments ? comments.length : 0) }} Comment{{ (comments && comments.length !== 1) ? 's' : '' }}</h2>
    <div class="sort-dropdown">
      <button mat-button class="sort-button" [matMenuTriggerFor]="sortMenu">
        <mat-icon>sort</mat-icon>
        <span>Sort by</span>
      </button>
      <mat-menu #sortMenu="matMenu">
        <button mat-menu-item (click)="sortComments('newest')">
          <mat-icon>schedule</mat-icon>
          <span>Newest first</span>
        </button>
        <button mat-menu-item (click)="sortComments('popular')">
          <mat-icon>whatshot</mat-icon>
          <span>Most popular</span>
        </button>
      </mat-menu>
    </div>
  </div>

  

  <!-- Add Comment Section -->
  <div class="add-comment-section">
    <div class="user-avatar-container">
      <img [src]="currentUserAvatar || 'assets/images/default-avatar.png'" alt="Your profile" class="user-avatar">
    </div>
    <div class="comment-input-container">
      <form (submit)="addComment($event)" class="comment-form">
        <mat-form-field appearance="outline" class="full-width">
          <input
            matInput
            [(ngModel)]="newComment"
            name="comment"
            placeholder="Add a comment..."
            aria-label="Add a comment"
            required
            [disabled]="!isAuthenticated"
          >
        </mat-form-field>
        <div class="form-actions" *ngIf="newComment">
          <button mat-button type="button" (click)="cancelComment()" class="cancel-button">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="!newComment.trim() || isSubmitting" class="submit-button">
            {{ isSubmitting ? 'Posting...' : 'Comment' }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <mat-progress-bar *ngIf="isLoading" mode="indeterminate" style="margin-bottom: 10px;"/>

  <!-- Comments List -->
  <div class="comments-list">
    <div class="comment-item" *ngFor="let comment of comments">
      <div class="comment-avatar-container">
        <img [src]="comment.user?.avatar || 'img/avatar.png'" alt="{{ comment.user?.name }}" class="comment-avatar">
      </div>
      <div class="comment-content-container">
        <div class="comment-header">
          <span class="comment-author">{{ comment.user?.name | titlecase }}</span>
          <span class="comment-time">{{ timeAgo(comment.createdAt) }}</span>
        </div>
        <div class="comment-text">{{ comment.text }}</div>
        <div class="comment-actions">
          <button mat-icon-button (click)="likeComment(comment._id)" class="like-button" aria-label="Like comment">
            <mat-icon>{{ comment.likedBy?.includes(user?._id) ? 'thumb_up' : 'thumb_up_off_alt' }}</mat-icon>
            <span class="like-count">{{ comment.likes || 0 }}</span>
          </button>
          <button mat-button (click)="showReplyBox(comment._id)" *ngIf="!comment.showReplyBox" class="reply-button">Reply</button>
          <button 
            *ngIf="user && comment.user._id === user._id"
            mat-icon-button 
            (click)="onDeleteComment(comment._id, $event)" 
            class="delete-button" 
            aria-label="Delete comment"
          >
            <mat-icon>delete</mat-icon>
          </button>
        </div>

        <!-- Reply Box -->
        <div class="reply-box" *ngIf="comment.showReplyBox">
          <form (submit)="addReply(comment)" class="reply-form">
            <mat-form-field appearance="outline" class="full-width">
              <input
                matInput
                [(ngModel)]="comment.replyText"
                name="reply"
                placeholder="Write a reply..."
                aria-label="Add a reply"
                required
                [disabled]="!isAuthenticated"
              >
            </mat-form-field>
            <div class="form-actions">
              <button mat-button type="button" (click)="cancelReply(comment)" class="cancel-button">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!comment.replyText.trim() || isSubmitting" class="submit-button">
                {{ isSubmitting ? 'Posting...' : 'Reply' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Replies List -->
        <div class="replies-list" *ngIf="comment?.replies && comment.replies.length > 0">
          <div class="reply-item" *ngFor="let reply of comment.replies">
            <div class="reply-avatar-container">
              <img [src]="reply.user?.avatar || 'assets/images/default-avatar.png'" class="reply-avatar">
            </div>
            <div class="reply-content-container">
              <div class="reply-header">
                <span class="reply-author">{{ reply.user?.name | titlecase}}</span>
                <span class="reply-time">{{ timeAgo(reply.createdAt) }}</span>
              </div>
              <div class="reply-text">{{ reply.text }}</div>
              <div class="reply-actions">
                <button mat-icon-button (click)="likeComment(reply._id)" class="like-button" aria-label="Like reply">
                  <mat-icon>{{ reply.likedBy?.includes(user?._id) ? 'thumb_up' : 'thumb_up_off_alt' }}</mat-icon>
                  <span class="like-count">{{ reply.likes || 0 }}</span>
                </button>
                <button 
                  *ngIf="user && reply.user._id === user._id"
                  mat-icon-button 
                  (click)="onDeleteReply(comment._id, reply._id, $event)" 
                  class="delete-button" 
                  aria-label="Delete reply"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styleUrls: ['./video-comments.component.scss']
})
export class VideoCommentsComponent implements OnDestroy {
  @Input() comments: any[] = [];
  @Input() videoId: string | undefined;
  @Input() currentUserAvatar: string = '';
  @Output() commentAdded = new EventEmitter<{text: string}>();
  @Output() commentLiked = new EventEmitter<string>();
  @Output() replyAdded = new EventEmitter<{parentId: string, text: string}>();
  @Output() commentDeleted = new EventEmitter<string>();
  @Output() replyDeleted = new EventEmitter<{parentId: string, replyId: string}>();
  
  newComment = '';
  isSubmitting = false;
  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  subscriptions: Subscription[] = [];
  user: UserInterface | null = null;
  isAuthenticated = false;
  private dialog = inject(MatDialog);
  private videoCommentService = inject(VideoCommentService);

  isLoading = false;
  
  ngOnInit() {
    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
          this.isAuthenticated = user !== null;
        }
      })
    );
    //console.log('video comment.. ', this.comments)
  }

  addComment(event: Event) {
    event.preventDefault();
    if (this.newComment.trim()) {
      this.commentAdded.emit({ text: this.newComment });
      this.newComment = '';
      this.cdr.detectChanges();
    }
  }

  likeComment(commentId: string) {
    this.commentLiked.emit(commentId);
  }

  showReplyBox(commentId: string) {
    const comment = this.comments.find(c => c._id === commentId);
    if (comment) {
      comment.showReplyBox = true;
      comment.replyText = '';
    }
  }

  addReply(comment: any) {
    if (comment.replyText?.trim()) {
      this.replyAdded.emit({
        parentId: comment._id,
        text: comment.replyText
      });
      comment.showReplyBox = false;
      comment.replyText = '';
      this.cdr.detectChanges();
    }
  }

  // Handle comment deletion
  onDeleteComment(commentId: string, event: Event) {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Comment',
        message: 'Are you sure you want to delete this comment?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteComment(commentId);
      }
    });
  }
  
  // Delete comment implementation
  private deleteComment(commentId: string) {
    this.isLoading = true;

    if (!this.user) return;
    if (this.videoId)
    this.subscriptions.push(
      this.videoCommentService.deleteComment(commentId, this.user._id, this.videoId).subscribe({
      next: (response) => {
        this.snackBar.open(response.message, 'Close', { duration: 3000 });
        
        // Remove the deleted comment from the comments list
        this.comments = this.comments.filter(comment => comment._id !== commentId);

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        let errorMessage = 'Server error occurred, please try again.'; // default error message.
        if (error.error && error.error.message) {
          errorMessage = error.error.message; // Use backend's error message if available.
        }  
        this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    })
    );
  }



   // Handle repley deletion
  onDeleteReply(commentId: string, replyId: string, event: Event) {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Reply',
        message: 'Are you sure you want to delete this reply?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteReply(commentId, replyId);
      }
    });
  }

  // Delete reply implementation
  private deleteReply(parentCommentId: string, replyId: string) {
    this.isLoading = true;

    if (!this.user) return;
    if (this.videoId)
    this.subscriptions.push(
      this.videoCommentService.deleteReply(parentCommentId, replyId, this.user._id, this.videoId).subscribe({
      next: (response) => {
        this.snackBar.open(response.message, 'Close', { duration: 3000 });

       // Find the parent comment and remove the deleted reply
        const parentComment = this.comments.find(comment => comment._id === parentCommentId);
        if (parentComment && parentComment.replies) {
          parentComment.replies = parentComment.replies.filter((reply: any) => reply._id !== replyId);
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        let errorMessage = 'Server error occurred, please try again.'; // default error message.
        if (error.error && error.error.message) {
          errorMessage = error.error.message; // Use backend's error message if available.
        }  
        if (errorMessage === 'Reply not found.') window.location.reload();
        this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    })
    );
  }

  getReply(replyId: string) {
    return this.comments.find(c => c._id === replyId);
  }

  cancelComment() {
    this.newComment = '';
  }

  cancelReply(comment: any) {
    comment.replyText = '';
    comment.showReplyBox = false;
  }

  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  sortComments(sortType: 'newest' | 'popular') {
    if (!this.comments) return;

    const commentsCopy = [...this.comments];

    switch (sortType) {
      case 'newest':
        this.comments = commentsCopy.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;

      case 'popular':
        this.comments = commentsCopy.sort((a, b) => {
          if (b.likes !== a.likes) {
            return (b.likes || 0) - (a.likes || 0);
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;

      default:
        this.comments = commentsCopy.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }

    this.comments.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = [...comment.replies].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
    });

    this.cdr.detectChanges();
  }
}