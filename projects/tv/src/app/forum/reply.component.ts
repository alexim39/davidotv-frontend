// reply.component.ts
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { timeAgo as timeAgoUtil, } from '../common/utils/time.util';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { UserInterface, UserService } from '../common/services/user.service';
import { ForumService } from './forum.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../common/component/confirmationDialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reply',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="reply">
      <div class="reply-main">
        <img class="reply-avatar" [src]="reply.author.avatar" [alt]="reply.author.name">
        
        <div class="reply-content">
          <div class="reply-header">
            <span class="reply-author">{{reply.author.name | titlecase}}</span>
            <span *ngIf="reply.author.isVerified" class="verified-badge">
              <mat-icon>verified</mat-icon>
            </span>
            <span class="reply-time">{{timeAgo(reply.createdAt)}}</span>

             <!-- Delete button - only shown if user is the owner -->
            <button *ngIf="isReplyOwner()" 
                    mat-icon-button 
                    color="warn" 
                    (click)="onDeleteReply($event)"
                    class="delete-button"
                    matTooltip="Delete reply">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
          
          <div class="reply-text">{{reply.content}}</div>
          
          <div class="reply-actions">
            <button mat-button (click)="toggleLike()">
              <mat-icon [class.accent]="reply.isLiked">thumb_up</mat-icon>
              {{reply.likeCount}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reply {
      margin: 12px 0;
      padding: 12px;
      //background: rgba(0,0,0,0.02);
      border-radius: 8px;
      border-left: 3px solid #ddd;
      
      .reply-main {
        display: flex;
        gap: 12px;
      }
      
      .reply-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .reply-content {
        flex: 1;
        
        .reply-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          font-size: 13px;
          
          .reply-author {
            font-weight: 500;
          }
          
          .verified-badge {
            display: flex;
            align-items: center;
            
            mat-icon {
              font-size: 14px;
              width: 14px;
              height: 14px;
            }
          }
          
          .reply-time {
            color: #666;
            font-size: 11px;
          }

          .delete-button {
            margin-left: 8px;
            width: 24px;
            height: 24px;
            line-height: 24px;
            color: #f44336;
            
            mat-icon {
              font-size: 16px;
              width: 16px;
              height: 16px;
            }
          }
        }
        
        .reply-text {
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 6px;
        }
        
        .reply-actions {
          button {
            min-width: auto;
            padding: 0 6px;
            line-height: 20px;
            
            mat-icon {
              font-size: 14px;
              width: 14px;
              height: 14px;
              margin-right: 2px;
              
              &.accent {
                //color: #3f51b5;
              }
            }
          }
        }
      }
    }
  `]
})
export class ReplyComponent implements OnInit, OnDestroy {
  @Input() reply: any;
  @Output() replyDeleted = new EventEmitter<string>(); 

  subscriptions: Subscription[] = [];
  private userService = inject(UserService);
  currentUser: UserInterface | null = null;

  // Cleanup
  private destroy$ = new Subject<void>();

  private forumService = inject(ForumService);
  private cd = inject(ChangeDetectorRef);

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit() {
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(sub => sub.unsubscribe());
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

  // Check if current user is the owner of the reply
  isReplyOwner(): boolean {
    return this.currentUser?._id === this.reply.author._id;
  }

   // Handle reply deletion
  onDeleteReply(event: Event) {
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
        this.deleteReply();
      }
    });
  }

  // Delete reply implementation
  private deleteReply() {
    if (!this.currentUser) return;

    this.forumService.deleteReply(this.reply._id, this.currentUser._id).subscribe({
      next: () => {
        // Emit to parent component that reply was deleted
        this.replyDeleted.emit(this.reply._id);
      },
      error: (error) => {
        console.error('Error deleting reply:', error);
        this.snackBar.open('Failed to delete reply. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
  
 toggleLike() {
    if (!this.currentUser) return;

    // Optimistic UI update
    const wasLiked = this.reply.isLiked;
    this.reply.isLiked = !wasLiked;
    this.reply.likeCount += this.reply.isLiked ? 1 : -1;
    // Optionally, trigger backend update here or emit an event to parent

    this.forumService.toggleLikeReply(this.reply._id, this.currentUser._id).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (response) => {
            if (response) {
              //this.updateCommentInList(updatedComment);
              this.cd.markForCheck();
            }
          },
          error: (err) => {
            //this.showError('Failed to update like');
          }
        });

  }
  
  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }
}