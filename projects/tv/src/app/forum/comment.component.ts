import { Component, Input, Output, EventEmitter, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Comment, ForumService, Reply } from './forum.service';
import { timeAgo as timeAgoUtil, } from '../common/utils/time.util';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { UserInterface, UserService } from '../common/services/user.service';
import { Subscription, takeUntil } from 'rxjs';
import { ReplyComponent } from './reply.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../common/component/confirmationDialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
selector: 'app-comment',
providers: [ForumService],
imports: [
  MatIconModule, 
  CommonModule, 
  MatInputModule, 
  MatButtonModule, 
  MatFormFieldModule, 
  MatProgressBarModule, 
  MatProgressSpinnerModule, 
  ReactiveFormsModule,
  ReplyComponent
],
template: `
<div class="comment">
  <div class="comment-main">
    <img class="comment-avatar" [src]="comment.author.avatar" [alt]="comment.author.name">
    
    <div class="comment-content">
      <div class="comment-header">
        <span class="comment-author"> {{timeAgo(comment.createdAt)}} </span>
       <!--  <span *ngIf="comment.author.isVerified" class="verified-badge" matTooltip="Verified User">
          <mat-icon>verified</mat-icon>
        </span> -->
        <span class="comment-time">{{comment.author.name | titlecase}}</span>

         <!-- Delete button - only shown if user is the owner -->
            <button *ngIf="isCommentOwner()" 
                    mat-icon-button 
                    color="warn" 
                    (click)="onDeleteComment($event)"
                    class="delete-button"
                    matTooltip="Delete comment">
              <mat-icon>delete</mat-icon>
            </button>
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
                  [disabled]="replyControl.invalid || isSubmitting || !currentUser">
            <span *ngIf="!isSubmitting">Post Reply</span>
            <mat-spinner *ngIf="isSubmitting" diameter="20"/>
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- In comment.component.html -->
  <div class="comment-replies" *ngIf="showReplies">
    <app-reply 
      *ngFor="let reply of replies"
      [reply]="reply"
      (replyDeleted)="onReplyDeleted($event)"
    />
  </div>

`,
styles: [`
    
.comment {
  margin-bottom: 20px;
  padding: 15px;
  //border-radius: 8px;
  
  .comment-main {
    display: flex;
    gap: 15px;
  }
  
  .comment-avatar {
    width: 40px;
    height: 40px;
    //border-radius: 50%;
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

       .delete-button {
          margin-left: 8px;
          width: 24px;
          height: 24px;
          line-height: 24px;
          color: #f44336; // Red color for delete button
          font-weight: bold;
          
          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
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

      .full-width {
        width: 100%;
      }
      
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
    //border-left: 2px solid #eee;
    
    .comment {
      //border: 1px solid #eee;
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


.comment-replies {
  margin-top: 16px;
  margin-left: 44px; // Align with avatar
  padding-left: 8px;
  //border-left: 2px solid #eee;
  
  .reply {
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}


.loading-replies {
  padding: 12px;
  display: flex;
  justify-content: center;
}

.no-replies {
  padding: 12px;
  color: #666;
  font-size: 14px;
  text-align: center;
}

`]
})
export class CommentComponent implements OnInit, OnDestroy {
  @Input() comment!: Comment;
  @Input() threadId!: string;
  @Input() isAuthor!: boolean;
  //@Input() deleteComment!: string;
  @Output() likeComment = new EventEmitter<string>();
  @Output() commentDeleted = new EventEmitter<string>(); // New output for deletion

  private userService = inject(UserService);
  currentUser: UserInterface | null = null;
  private forumService = inject(ForumService);
  private cd = inject(ChangeDetectorRef);
  subscriptions: Subscription[] = [];
  private snackBar = inject(MatSnackBar);
  
  replyControl = new FormControl('', Validators.required);
  isReplying = false;
  isSubmitting = false;
  showReplies = false;
  destroy$: any;

  replies: Reply[] = [];
  isLoadingReplies = false;

  private dialog = inject(MatDialog);

  ngOnInit() {
    //console.log('sent comments ',this.comment)
    if (!this.comment.replies) {
      this.comment.replies = [];
    }
    this.replies = this.comment.replies; // Initialize replies from comment

    this.loadCurrentUser();
  }

   ngOnDestroy(): void {
     this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


    private loadCurrentUser(): void {
        this.subscriptions.push(
        this.userService.getCurrentUser$.subscribe({
          next: (user) => {
            this.currentUser = user;
            //console.log('current user ',this.user)
          }
        })
      )
    }

    // Check if current user is the owner of the comment
    isCommentOwner(): boolean {
      return this.currentUser?._id === this.comment.author._id;
    }

    // Handle comment deletion
    onDeleteComment(event: Event) {
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
          this.deleteComment();
        }
      });
    }

    // Delete comment implementation
  private deleteComment() {
    if (!this.currentUser) return;

    this.subscriptions.push(
      this.forumService.deleteComment(this.comment._id, this.currentUser._id).subscribe({
        next: () => {
          // Emit to parent component that comment was deleted
          this.commentDeleted.emit(this.comment._id);
          // The parent component should handle removing the comment from the list
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
          this.snackBar.open('Failed to delete comment. Please try again.', 'Close', { duration: 3000 });
        }
      })
    )    ;
  }


  toggleReply() {
    this.isReplying = !this.isReplying;
    if (!this.isReplying) {
      this.replyControl.reset();
    }
  }


  // comment.component.ts
 addReply() {
  if (this.replyControl.invalid || this.isSubmitting || !this.currentUser) return;

  this.isSubmitting = true;
  this.cd.detectChanges();

  this.forumService.addCommentReply(
    this.replyControl.value ?? '',
    this.currentUser._id,
    this.comment._id
  ).subscribe({
    next: (response) => {
      //console.log('New reply added:', response.data);
      const sentReply: Reply = {
        _id: response.data._id,
        content: response.data.content,
        createdAt: response.data.createdAt,
        author: {
          avatar: response.data.author.avatar,
          _id: response.data.author._id,
          name: response.data.author.name,
          username: response.data.author.username,
        },
        isDeleted: response.data.isDeleted,
        isLiked: response.data.isLiked,
        likeCount: response.data.likeCount,
        parentComment: response.data.parentComment,
        thread: response.data.thread,
        updatedAt: response.data.updatedAt
      };
      this.replies.unshift(sentReply);
      this.comment.replyCount = (this.comment.replyCount || 0) + 1;
      this.replyControl.reset();
      this.isReplying = false;
      this.isSubmitting = false;
      this.showReplies = true;
      this.cd.detectChanges();
    },
    error: (error) => {
      console.error('Error adding reply:', error);
      this.isSubmitting = false;
      this.cd.detectChanges();
    }
  });
}

  toggleLike() {
    if (!this.currentUser) return;

    //this.likeComment.emit(this.comment._id);

    // Optimistic UI update
    const wasLiked = this.comment.isLiked;
    this.comment.isLiked = !wasLiked;
    this.comment.likeCount += this.comment.isLiked ? 1 : -1;
    this.cd.markForCheck();

    // Emit to parent to handle backend update and revert if needed
    this.likeComment.emit(this.comment._id);

    // if (!this.thread || !this.currentUser) return;

    // this.forumService.toggleLikeComment(commentId, this.currentUser._id).pipe(
    //   takeUntil(this.destroy$)
    // ).subscribe({
    //   next: (updatedComment) => {
    //     if (updatedComment) {
    //       this.updateCommentInList(updatedComment);
    //       this.cd.markForCheck();
    //     }
    //   },
    //   error: (err) => {
    //     this.showError('Failed to update like');
    //   }
    // });
  }

  toggleReplies() {
    this.showReplies = !this.showReplies;
  }

  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }

  onReplyDeleted(replyId: any) {
    this.replies = this.replies.filter(r => r._id !== replyId);
    //this.comment.replyCount = (this.comment.replyCount || 0) - 1;
    this.snackBar.open('Reply deleted successfully', 'Close', { duration: 3000 });
    //this.cd.detectChanges();
  }
}