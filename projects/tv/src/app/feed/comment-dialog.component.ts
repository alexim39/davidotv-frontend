import { 
  Component, 
  Inject, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef 
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SocialFeedService, SocialPost } from './feed.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ShortNumberPipe } from "./short-number.pipe";

@Component({
  selector: 'app-comment-dialog',
  standalone: true,
  providers: [SocialFeedService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ShortNumberPipe
],
  template: `
    <div class="comment-dialog">
      <div class="dialog-header">
        <h2>Comments ({{data.post.commentsCount | shortNumber}})</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="comments-list">
        <div 
          *ngFor="let comment of data.post.commentsList; trackBy: trackByCommentId" 
          class="comment"
        >
          <img [src]="comment.user.avatar" [alt]="comment.user.name" class="user-avatar">
          <div class="comment-content">
            <div class="comment-header">
              <span class="user-name">{{comment.user.name}}</span>
              <span class="comment-time">{{comment.time | date:'shortTime'}}</span>
            </div>
            <p class="comment-text">{{comment.text}}</p>
          </div>
        </div>
      </div>

      <div class="comment-input">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Add a comment</mat-label>
          <input 
            matInput 
            [(ngModel)]="newComment" 
            (keyup.enter)="postComment()"
            [disabled]="isPosting"
          >
        </mat-form-field>
        <button 
          mat-flat-button 
          color="primary" 
          (click)="postComment()" 
          [disabled]="!newComment.trim() || isPosting"
        >
          <span *ngIf="!isPosting">Post</span>
          <mat-spinner *ngIf="isPosting" diameter="20"></mat-spinner>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .comment-dialog {
      padding: 20px;
      max-width: 600px;
      width: 100%;
    }
    
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .comments-list {
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: 20px;
    }
    
    .comment {
      display: flex;
      margin-bottom: 15px;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 10px;
    }
    
    .comment-content {
      flex: 1;
    }
    
    .comment-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    
    .user-name {
      font-weight: bold;
    }
    
    .comment-time {
      color: #888;
      font-size: 0.8em;
    }
    
    .comment-text {
      margin: 0;
    }
    
    .comment-input {
      display: flex;
      gap: 10px;
    }
    
    .full-width {
      flex: 1;
    }
  `]
})
export class CommentDialogComponent {
  newComment = '';
  isPosting = false;

  constructor(
    public dialogRef: MatDialogRef<CommentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { post: SocialPost },
    private socialFeedService: SocialFeedService,
    private cdr: ChangeDetectorRef
  ) {}

  trackByCommentId(index: number, comment: any): string {
    return comment.id;
  }

  postComment(): void {
    if (this.newComment.trim() && !this.isPosting) {
      this.isPosting = true;
      this.cdr.markForCheck(); // Mark for check since isPosting changed
      
      this.socialFeedService.addComment(this.data.post.id, this.newComment).subscribe({
        next: (updatedPost) => {
          // Create new references to trigger change detection
          this.data.post = {
            ...this.data.post,
            commentsList: [...updatedPost.commentsList],
            commentsCount: updatedPost.commentsCount
          };
          this.newComment = '';
          this.isPosting = false;
          this.cdr.markForCheck(); // Mark for check after update
        },
        error: () => {
          this.isPosting = false;
          this.cdr.markForCheck(); // Mark for check on error
        }
      });
    }
  }

  close(): void {
    this.dialogRef.close(this.data.post); // Return updated post when closing
  }
}