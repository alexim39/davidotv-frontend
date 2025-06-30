import { 
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, 
  ChangeDetectorRef, inject, 
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormControl, ReactiveFormsModule, Validators, 
  FormsModule, FormGroup 
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, switchMap, tap, Subscription } from 'rxjs';

import { ForumService, Thread, Comment, User } from './forum.service';
import { CommentComponent } from './comment.component';
import { timeAgo as timeAgoUtil } from '../common/utils/time.util';
import { SanitizeHtmlPipe } from '../common/pipes/sanitize-html.pipe';
import { UserInterface, UserService } from '../common/services/user.service';

@Component({
  selector: 'app-thread-detail',
  standalone: true,
  providers: [ForumService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CommentComponent,
    SanitizeHtmlPipe
  ],
  template: `
  <div class="thread-detail-container">
  <!-- Back Navigation -->
  <button mat-button class="back-button" (click)="handleBack()">
    <mat-icon>arrow_back</mat-icon>
    Back to Forum
  </button>

  <!-- Loading State -->
  <div *ngIf="loadingStates" class="loading-state">
    <mat-spinner diameter="50"></mat-spinner>
    <p>Loading thread...</p>
  </div>

  <!-- Error State -->
  <div *ngIf="error && !loadingStates" class="error-state">
    <mat-icon color="warn">error_outline</mat-icon>
    <p>{{ error }}</p>
    <button mat-raised-button color="primary" (click)="loadThreadData()">
      Retry
    </button>
  </div>

  <!-- Thread Content -->
  <ng-container *ngIf="thread && !loadingStates">
    <mat-card class="thread-card">
      <mat-card-header>
        <img mat-card-avatar 
             [src]="thread.author.avatar" 
             [alt]="thread.author.name">
        <mat-card-title>{{ thread.title }}</mat-card-title>
        <mat-card-subtitle>
          <span class="author-info">
            <span>{{thread.author.name | titlecase}} - {{thread.author.username}}</span>
            <!-- <mat-icon *ngIf="thread.author.isVerified" class="verified-icon" matTooltip="Verified User">verified</mat-icon> -->
          </span>
          <span class="spacer"></span>
          <span class="time">{{ timeAgo(thread.createdAt) }}</span>
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="thread-content" [innerHTML]="thread.content | sanitizeHtml"></div>
        
        <mat-chip-listbox class="thread-tags">
          <mat-chip *ngFor="let tag of thread.tags" 
                   color="primary">
            {{ tag }}
          </mat-chip>
        </mat-chip-listbox>
      </mat-card-content>

      <mat-card-actions class="thread-actions">
        <button mat-button 
                [color]="thread.isLiked ? 'accent' : 'primary'"
                (click)="toggleLikeThread()"
                aria-label="Like thread"
                [attr.aria-pressed]="thread.isLiked">
          <mat-icon>thumb_up</mat-icon>
          {{ thread.likeCount }}
        </button>
        <button mat-button color="primary" disabled>
          <mat-icon>comment</mat-icon>
          {{ thread.commentCount }}
        </button>
        <button mat-button color="primary" disabled>
          <mat-icon>visibility</mat-icon>
          {{ thread.viewCount }}
        </button>
      </mat-card-actions>
    </mat-card>

    <!-- Comment Section -->
    <section class="comment-section" aria-labelledby="comments-heading">
      <h3 id="comments-heading">Comments ({{ thread.commentCount }})</h3>

      <!-- Comment Form -->
      <form [formGroup]="commentForm" class="comment-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Add your comment</mat-label>
          <textarea matInput 
                  formControlName="content"
                  rows="4"
                  aria-label="Comment text area"
                  [attr.maxlength]="2000"></textarea>
          <mat-hint align="end">{{ remainingChars }} characters remaining</mat-hint>
        </mat-form-field>
        <button mat-raised-button 
                color="primary"
                (click)="addComment()"
                [disabled]="commentForm.invalid || isSubmitting || !currentUser"
                aria-label="Post comment">
          <span *ngIf="!isSubmitting">Post Comment</span>
          <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
        </button>
      </form>

      <!-- Comments Loading -->
      <div *ngIf="loadingStates" class="loading-comments">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Comments List -->
      <div class="comments-list">
        <app-comment *ngFor="let comment of comments; trackBy: trackByCommentId"
          [comment]="comment"
          [threadId]="thread._id"
          [isAuthor]="isCommentAuthor(comment)"
          (likeComment)="toggleLikeComment($event)"
          (commentDeleted)="onCommentDeleted($event)">
        </app-comment>

        <!-- Empty State -->
        <div *ngIf="comments.length === 0" class="no-comments">
          <mat-icon>forum</mat-icon>
          <p>No comments yet. Be the first to comment!</p>
        </div>
      </div>
    </section>
  </ng-container>
</div>
  `,
  styles: [`


.thread-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;

  .back-button {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
  }

  .loading-state, .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    gap: 16px;
    text-align: center;
  }

  .error-state {
    color: red; //mat-color($warn);
  }

  .thread-card {
    margin-bottom: 32px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);

    mat-card-header {
      padding: 16px 16px 0;

      mat-card-title {
        font-size: 1.5rem;
        font-weight: 500;
        margin-bottom: 4px;
      }

      mat-card-subtitle {
        display: flex;
        align-items: center;
        font-size: 0.875rem;

        .author-info {
          display: flex;
          align-items: center;
          gap: 4px;

          .verified-icon {
            color: blue;// $verified-blue;
            font-size: 1rem;
            height: 1rem;
            width: 1rem;
          }         

        }

         .time {
            margin-left: auto;
            color: #888;
            font-size: 13px;
            white-space: nowrap;
          }

        .spacer {
          flex: 1;
        }
      }
    }

    mat-card-content {
      padding: 0 16px;

      .thread-content {
        line-height: 1.6;
        margin-bottom: 16px;
        white-space: pre-line;
        word-break: break-word;
      }

      .thread-tags {
        margin-top: 12px;
      }
    }

    mat-card-actions {
      padding: 8px 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      display: flex;
      gap: 8px;

      button {
        min-width: auto;
      }
    }
  }

  .comment-section {
    h3 {
      font-size: 1.25rem;
      font-weight: 500;
      margin-bottom: 16px;
      //color: rgba(0, 0, 0, 0.87);
    }

   /*  .comment-form {
      margin-bottom: 24px;

      button {
        margin-top: 8px;
        float: right;
      }
    } */

    .comment-form {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;

      mat-form-field.full-width {
        width: 100%;
      }

      button[mat-raised-button] {
        align-self: flex-end;
        margin-top: 8px;
      }
    }

    .loading-comments {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .no-comments {
      text-align: center;
      padding: 40px 20px;
      //color: rgba(0, 0, 0, 0.54);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        //color: rgba(0, 0, 0, 0.12);
      }

      p {
        font-size: 1rem;
      }
    }
  }

  /* styles.scss or component styles */
.snackbar-center-bottom {
  left: 50% !important;
  transform: translateX(-50%) !important;
  justify-content: center !important;
}


}


@media (max-width: 600px) {
  .thread-detail-container {
    padding: 8px;

    .thread-card {
      mat-card-header {
        mat-card-title {
          font-size: 1.25rem;
        }
      }

      mat-card-content {
        .thread-content {
          font-size: 0.9375rem;
        }
      }
    }

    .comment-section {
      h3 {
        font-size: 1.125rem;
      }
    }
  }
}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThreadDetailComponent implements OnInit, OnDestroy {
  private forumService = inject(ForumService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cd = inject(ChangeDetectorRef);
  private userService = inject(UserService);

  // Component State
  thread: Thread | null = null;
  comments: Comment[] = [];
  currentUser: UserInterface | null = null;
  loadingStates = false;
  isSubmitting = false;
  error: string | null = null;

  // Form Controls
  commentForm = new FormGroup({
    content: new FormControl('', [
      Validators.required,
      Validators.maxLength(2000)
    ])
  });

  // Cleanup
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadThreadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.userService.getCurrentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
      this.cd.markForCheck();
    });
  }

  public loadThreadData(): void {
    this.route.params.pipe(
      tap(() => {
        this.loadingStates = true;
        this.error = null;
        this.cd.markForCheck();
      }),
      switchMap(params => this.forumService.getThreadById(params['threadId'])),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        //console.log('returned thread ',response.data)
        this.thread = response.data || null;
        this.loadingStates = false;
        if (response.data) {
          //this.loadComments();
          this.comments = response.data.comments || [];
          //this.incrementViewCount();
          this.cd.markForCheck();
        }
        
      },
      error: (err) => {
        this.error = 'Failed to load thread';
        this.loadingStates = false;
        this.cd.markForCheck();
      }
    });
  }

  toggleLikeThread(): void {
    if (!this.thread || !this.currentUser) return;

    // Optimistic UI update
    const wasLiked = this.thread.isLiked;
    this.thread.isLiked = !wasLiked;
    this.thread.likeCount += this.thread.isLiked ? 1 : -1;
    this.cd.markForCheck();

    this.forumService.toggleLikeThread(this.thread._id, this.currentUser._id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.thread = response.data;
          // this.snackBar.open(response.message, 'Ok', {
          //   duration: 3000,
          //   horizontalPosition: 'center',
          //   verticalPosition: 'bottom',
          //   panelClass: 'snackbar-center-bottom'
          // });
          this.cd.markForCheck();
        }
      },
      error: (err) => {
        // Revert UI on error
        this.thread!.isLiked = wasLiked;
        this.thread!.likeCount += wasLiked ? 1 : -1;
        this.cd.markForCheck();
        this.showError('Failed to update like');
      }
    });
  }

  addComment(): void {
    if (this.commentForm.invalid || !this.thread || !this.currentUser) return;

    this.isSubmitting = true;
    const content = this.commentForm.value.content || '';

    this.forumService.addComment(this.thread._id, content, this.currentUser._id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.comments = [response.data, ...this.comments];
          if (this.thread) {
            this.thread.commentCount++;
          }
          this.commentForm.reset();
        }
        this.isSubmitting = false;
        this.cd.markForCheck();
      },
      error: (err) => {
        this.showError('Failed to post comment', () => this.addComment());
        this.isSubmitting = false;
        this.cd.markForCheck();
      }
    });
  }

  toggleLikeComment(commentId: string): void {
    if (!this.thread || !this.currentUser) return;

    this.forumService.toggleLikeComment(commentId, this.currentUser._id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updatedComment) => {
        if (updatedComment) {
          this.updateCommentInList(updatedComment);
          this.cd.markForCheck();
        }
      },
      error: (err) => {
        this.showError('Failed to update like');
      }
    });
  }

  onCommentDeleted(commentId: any) {
    this.comments = this.comments.filter(c => c._id !== commentId);
    this.snackBar.open('Comment has been deleted', 'Close', { duration: 3000 });
    if (this.thread) {
      this.thread.commentCount = Math.max(0, this.thread.commentCount - 1);
    }
        //this.cd.markForCheck();
  }

 /*  handleDeleteComment(commentId: any): void {
    if (!this.thread || !this.currentUser) return;

    this.forumService.deleteComment(commentId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c._id !== commentId);
        if (this.thread) {
          this.thread.commentCount = Math.max(0, this.thread.commentCount - 1);
        }
        this.cd.markForCheck();
      },
      error: (err) => {
        this.showError('Failed to delete comment');
      }
    });
  } */

  private updateCommentInList(updatedComment: Comment): void {
    const index = this.comments.findIndex(c => c._id === updatedComment._id);
    if (index !== -1) {
      this.comments[index] = updatedComment;
    }
  }

  private showError(message: string, retryAction?: () => void): void {
    const snackBarRef = this.snackBar.open(message, retryAction ? 'Retry' : 'Close', {
      duration: 3000,
      panelClass: 'error-snackbar'
    });

    if (retryAction) {
      snackBarRef.onAction().subscribe(() => retryAction());
    }
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment._id;
  }

  isCommentAuthor(comment: Comment): boolean {
    return this.currentUser?._id === comment.author._id;
  }

  handleBack(): void {
    this.router.navigate(['/forum']);
  }

  get remainingChars(): number {
    return 2000 - (this.commentForm.value.content?.length || 0);
  }

   timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }
}