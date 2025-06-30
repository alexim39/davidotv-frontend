import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TruncatePipe } from '../common/pipes/truncate.pipe';
import { timeAgo as timeAgoUtil } from '../common/utils/time.util';
import { CommonModule } from '@angular/common';
import { ForumService, Thread } from './forum.service';
import { MatButtonModule } from '@angular/material/button';
import { UserInterface, UserService } from '../common/services/user.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../common/component/confirmationDialog.component';
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

        <!-- Delete button - only shown if user is the owner -->
            <button *ngIf="isThreadOwner(thread)" 
                    mat-button 
                    color="warn" 
                    (click)="onDeleteComment(thread._id, $event)"
                    class="delete-button">
              <mat-icon>delete</mat-icon>
              Delete
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

    .delete-button {
      margin-left: auto; // Push delete button to the right
      color: #f44336; // Red color for delete button
      font-weight: bold;
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
export class ThreadListComponent {
  @Input() threads: Thread[] = [];

  private userService = inject(UserService);
  currentUser: UserInterface | null = null;
  subscriptions: Subscription[] = [];
  private forumService = inject(ForumService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  // Cleanup
  private destroy$ = new Subject<void>();
  private dialog = inject(MatDialog);

  ngOnInit() {
    this.loadCurrentUser();
  }

   ngOnDestroy(): void {
     this.subscriptions.forEach(subscription => subscription.unsubscribe());

    this.destroy$.next();
    this.destroy$.complete();
  }


  private loadCurrentUser(): void {
      this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.currentUser = user;
          //console.log('current user ',this.currentUser)
        }
      })
    )
  }

  // Check if current user is the owner of the thread
  isThreadOwner(thread: Thread): boolean {
    if (!this.currentUser?._id) return false;
    return thread.author._id === this.currentUser?._id;
  }

   // Handle comment deletion
    onDeleteComment(threadId: string, event: Event) {
      event.stopPropagation();
      
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Thread',
          message: 'Are you sure you want to delete this thread?',
          confirmText: 'Delete',
          cancelText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.deleteThread(threadId);
        }
      });
    }

   // Delete thread handler
  private deleteThread(threadId: string) {
    if (!this.currentUser) return;
    
    
    // Here you would typically:
    // 1. Show a confirmation dialog
    // 2. Call your thread service to delete the thread
    // 3. Emit an event to parent component or update local threads array

      this.forumService.deleteThread(threadId, this.currentUser._id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          // Remove the thread from the local array
          this.threads = this.threads.filter(t => t._id !== threadId);
          this.cd.detectChanges();
          this.snackBar.open(response.message, 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open('Failed to delete thread. Please try again.', 'Close', { duration: 3000 });
        }
      });

  }

  openThread(threadId: string) {
    if (!threadId) return;
    this.router.navigate(['/forum/thread', threadId]);
  }


  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }



}