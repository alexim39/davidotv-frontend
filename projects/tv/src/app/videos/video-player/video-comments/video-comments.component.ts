import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserInterface, UserService } from '../../../common/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'async-video-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  template: `
  
  <div class="comments-section">
  <div class="comments-header">
    <h3>{{ comments.length }} Comments</h3>
    <div class="sort-comments">
      <mat-icon>sort</mat-icon>
      <span>Sort by</span>
    </div>
  </div>

  <div class="add-comment">
    <img [src]="currentUserAvatar" alt="Your profile" class="user-avatar">
    <div class="comment-form">
      <form (submit)="addComment($event)">
        <input 
          type="text" 
          [(ngModel)]="newComment" 
          name="comment" 
          placeholder="Add a public comment..."
          aria-label="Add a comment"
          required
        >
        <div class="comment-actions" *ngIf="newComment">
          <button mat-button type="button" (click)="cancelComment()">CANCEL</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="!newComment.trim()">COMMENT</button>
        </div>
      </form>
    </div>
  </div>

  <div class="comments-list">
    <div class="comment" *ngFor="let comment of comments">
      <img [src]="comment.avatar" alt="{{ comment.user }}" class="comment-avatar">
      <div class="comment-content">
        <div class="comment-header">
          <h4>{{ comment.user }}</h4>
          <span class="comment-time">{{ comment.time }}</span>
        </div>
        <p class="comment-text">{{ comment.text }}</p>
        <div class="comment-actions">
          <button mat-icon-button>
            <mat-icon>thumb_up_off_alt</mat-icon>
          </button>
          <span class="likes-count">{{ comment.likes }}</span>
          <button mat-icon-button>
            <mat-icon>thumb_down_off_alt</mat-icon>
          </button>
          <button mat-button>REPLY</button>
        </div>
      </div>
    </div>
  </div>
</div>

  `,
  styleUrls: ['./video-comments.component.scss']
})
export class VideoCommentsComponent {
  @Input() comments: any[] = [];
  @Input() currentUserAvatar: string = '';
  @Output() commentAdded = new EventEmitter<string>();
  
  newComment = '';

  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);
  user: UserInterface | null = null;
  subscriptions: Subscription[] = [];

   ngOnInit() {
    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
          console.log('comment current user ',this.user)
        }
      })
    )
  }

  addComment(event: Event) {
    event.preventDefault();
    if (this.newComment.trim()) {
      this.commentAdded.emit(this.newComment);
      this.newComment = '';
    }
  }

  cancelComment() {
    this.newComment = '';
  }
}