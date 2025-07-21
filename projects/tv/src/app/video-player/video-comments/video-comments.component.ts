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

@Component({
  selector: 'async-video-comments',
  standalone: true,
  imports: [
    CommonModule, 
     FormsModule,
     MatIconModule, 
     MatButtonModule, 
     MatInputModule,
     MatFormFieldModule,
     ReactiveFormsModule
    ],
  template: `
    <div class="comments-section">
      <div class="comments-header">
      <h3>{{ (comments ? comments.length : 0) }} Comment{{ (comments && comments.length !== 1) ? 's' : '' }}</h3>
      
      <div class="sort-comments">
        <mat-icon>sort</mat-icon>
        <span>Sort by</span>
      </div>
    </div>

      <div class="add-comment">
        <div class="profile">
          <img [src]="currentUserAvatar" alt="Your profile" class="user-avatar">
          <h6 class="name">{{user?.name | titlecase}} <!-- - {{user?.username }} --> </h6>
        </div>
        <div class="comment-form">
          <form (submit)="addComment($event)">
            <input 
              type="text" 
              [(ngModel)]="newComment" 
              name="comment" 
              placeholder="Add a public comment..."
              aria-label="Add a comment"
              required
              [disabled]="!isAuthenticated" 
            >
            <div class="comment-actions" *ngIf="newComment">
              <button mat-button type="button" (click)="cancelComment()">CANCEL</button>
              <button mat-button color="primary" type="submit" [disabled]="!newComment.trim() || isSubmitting">
                {{ isSubmitting ? 'POSTING...' : 'POST COMMENT' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="comments-list">
        <div class="comment" *ngFor="let comment of comments">
          <div class="profile">
            <img [src]="currentUserAvatar" alt="{{ comment.name }}" class="comment-avatar">
            <h6 class="name">{{ user?.name | titlecase}}</h6>
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-time" style="text-align: right;">{{ timeAgo(comment.createdAt) }}</span>
            </div>
            <p class="comment-text">{{ comment.text }}</p>
            <div class="comment-actions">
              <button mat-icon-button (click)="likeComment(comment._id)">
                <mat-icon>{{ comment.likedBy?.includes(user?._id) ? 'thumb_up' : 'thumb_up_off_alt' }}</mat-icon>
              </button>
              <span class="likes-count">{{ comment.likes }}</span>
              <button mat-button (click)="showReplyBox(comment._id)" *ngIf="!comment.showReplyBox">REPLY</button>
              
              <!-- <div class="reply-box" *ngIf="comment.showReplyBox">
                <input 
                  type="text" 
                  [(ngModel)]="comment.replyText" 
                  placeholder="Write a reply..."
                >
                <button mat-button (click)="addReply(comment)">Post</button>
              </div> -->

              <div class="reply-box" *ngIf="comment.showReplyBox">
                <form (submit)="addReply(comment)">
                  <input 
                    type="text" 
                    [(ngModel)]="comment.replyText" 
                    name="comment" 
                    placeholder="Write a reply..."
                    aria-label="Add a reply"
                    required
                    [disabled]="!isAuthenticated" 
                  >
                  <div class="reply-actions" *ngIf="newComment">
                     <button mat-button type="button" (click)="cancelReply()">CANCEL</button>
                    <button mat-button color="primary" type="submit" [disabled]="!comment.replyText.trim() || isSubmitting">
                      {{ isSubmitting ? 'POSTING...' : 'POST REPLY' }}
                    </button>
                  </div>
                 
                </form>
               </div> 

            </div>
            
            <!-- Replies section -->
            <div class="replies" *ngIf="comment.replies?.length > 0">
              <div class="reply" *ngFor="let replyId of comment.replies">
                <div *ngIf="getReply(replyId) as reply">
                  <img [src]="reply.userAvatar" class="reply-avatar">
                  <div class="reply-content">
                    <h5>{{ reply.username }}</h5>
                    <p>{{ reply.text }}</p>
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
  @Input() currentUserAvatar: string = '';
 // @Input() currentUser: string = '';
  @Output() commentAdded = new EventEmitter<{text: string}>();
  @Output() commentLiked = new EventEmitter<string>();
  @Output() replyAdded = new EventEmitter<{parentId: string, text: string}>();
  
  newComment = '';
  isSubmitting = false;
  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  subscriptions: Subscription[] = [];
  user: UserInterface | null = null;
  isAuthenticated = false;
  
  ngOnInit() {
    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
          //console.log('current user ', this.user);
          // This sets isAuthenticated based on whether user exists
          this.isAuthenticated = user !== null;
        }
      })
    );
    console.log('video comment ', this.comments)
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
    }
  }

  getReply(replyId: string) {
    return this.comments.find(c => c._id === replyId);
  }

  cancelComment() {
    this.newComment = '';
  }

  cancelReply() {
    this.newComment = '';
  }

  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }

   ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  } 
}