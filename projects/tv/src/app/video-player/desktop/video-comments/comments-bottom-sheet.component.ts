// comments-bottom-sheet.component.ts
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { VideoCommentsComponent } from './video-comments.component';
import { MatIconModule } from '@angular/material/icon';
import { UserInterface } from '../../../common/services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { VideoCommentService, Comment } from './video-comments.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'async-comments-bottom-sheet',
  providers: [VideoCommentService],
  imports: [VideoCommentsComponent, MatIconModule, MatButtonModule, MatProgressBarModule],
  template: `
    <div class="comments-bottom-sheet">
        <mat-progress-bar *ngIf="isLoading" mode="indeterminate"/>

      <div class="sheet-header">
        <h3>Comments ({{data.comments.length}})</h3>
        <button mat-icon-button (click)="dismiss()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

        <async-video-comments 
            [comments]="data.comments"
            [videoId]="data.videoId"
            (commentAdded)="onCommentAdded($event)"
            (commentLiked)="onCommentLiked($event)"
            (replyAdded)="onReplyAdded($event)"
        />
    </div>
  `,
  styles: [`
    .comments-bottom-sheet {
      padding: 16px;
      max-height: 80vh;
      overflow-y: auto;
    }
    .sheet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .sheet-header h3 {
      margin: 0;
      font-size: 1.2rem;
    }
  `]
})
export class CommentsBottomSheetComponent implements OnInit, OnDestroy {

    isLoading = false;
    subscriptions: Subscription[] = [];
    comments: Comment[] = [];

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
      comments: Comment[],
      videoId: string,
      user: UserInterface | null
    },
    private bottomSheetRef: MatBottomSheetRef<CommentsBottomSheetComponent>,
    private videoCommentService: VideoCommentService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
      console.log('mobile user', this.data.user)
      console.log('mobile comments', this.data.comments)
      console.log('mobile videoId', this.data.videoId)
  }

  dismiss() {
    this.bottomSheetRef.dismiss();
  }

 onCommentAdded(commentData: {text: string}) {
    if (!this.data.user) return;
    this.isLoading = true;
    this.cdr.markForCheck();

    const tempComment: Comment = {
      _id: 'temp_' + Date.now(),
      videoId: this.data.videoId,
      userId: this.data.user._id,
      avatar: this.data.user.avatar || 'img/avatar.png',
      name: `${this.data.user.name}`,
      text: commentData.text,
      likes: 0,
      createdAt: new Date()
    };

    this.subscriptions.push(
      this.videoCommentService.addComment(
        this.data.videoId,
        this.data.user._id,
        commentData.text
      ).subscribe({
        next: (response) => {
          this.comments = [tempComment, ...this.comments];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.comments = this.comments.filter(c => c._id !== tempComment._id);

          let errorMessage = 'Server error occurred, please try again.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
            this.isLoading = false;
          this.cdr.detectChanges();
        }
      })
    )
  }


   onCommentLiked(commentId: string) {
    if (!this.data.user) {
      this.snackBar.open('Please login to like comments', 'Close', { duration: 2000 });
      return;
    }
    this.isLoading = true;
    this.cdr.markForCheck();

    this.subscriptions.push(
      this.videoCommentService.likeComment(
        this.data.videoId,
        commentId,
        this.data.user._id
      ).subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Ok',{duration: 3000});
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          let errorMessage = 'Server error occurred, please try again.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      })
    )
  }


    onReplyAdded(replyData: {parentId: string, text: string}) {
        console.error('Parent comment:', replyData);
        if (!this.data.user) {
            this.snackBar.open('Please log in to post a reply.', 'Close', { duration: 3000 });
            return;
        }
        this.isLoading = true;
        this.cdr.markForCheck();

        const parentComment = this.data.comments.find(c => c._id === replyData.parentId);
        if (!parentComment) {
            console.error('Parent comment not found for reply:', replyData.parentId);
            this.snackBar.open('Could not find the comment to reply to.', 'Close', { duration: 3000 });
            return;
        }

        if (!parentComment.replies) {
            parentComment.replies = [];
        }

        const tempReplyId = 'temp_reply_' + Date.now();
        const tempReply: Comment = {
        _id: tempReplyId,
        videoId: this.data.videoId,
        userId: this.data.user._id,
        avatar: this.data.user.avatar || 'img/avatar.png',
        name: this.data.user.name,
        text: replyData.text,
        likes: 0,
        parentComment: replyData.parentId,
        createdAt: new Date(),
        user: {
            _id: this.data.user._id,
            username: this.data.user.username || '',
            name: this.data.user.name,
            lastname: this.data.user.lastname || '',
            avatar: this.data.user.avatar || 'img/avatar.png'
        }
        };

        parentComment.replies.unshift(tempReply);
        this.cdr.detectChanges();

        this.subscriptions.push(
            this.videoCommentService.addReply(
                this.data.videoId,
                replyData.parentId,
                this.data.user._id,
                replyData.text
            ).subscribe({
                next: (actualReplyFromServer) => {
                const index = parentComment?.replies?.findIndex(r => r._id === tempReplyId);
                if (index !== -1) {
                    // No need to replace, as you're optimistically adding. The server response might contain the full data,
                    // but if your goal is just to show it immediately, the temp object is fine.
                    // If you need the server-generated _id or other server-generated fields, you'd replace it here.
                }
                this.isLoading = false;
                this.cdr.markForCheck();
                },
                error: (error: HttpErrorResponse) => {
                console.error('Failed to post reply:', error);
                this.snackBar.open('Failed to post reply. Please try again.', 'Close', { duration: 3000 });
                this.isLoading = false;
                this.cdr.markForCheck();
                }
            })
        )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  } 

}