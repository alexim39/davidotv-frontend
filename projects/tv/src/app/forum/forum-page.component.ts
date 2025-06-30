import { Component, OnInit, OnDestroy } from '@angular/core';
import { ForumService, Thread } from './forum.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ThreadListComponent } from './thread-list.component';
import { ThreadDetailComponent } from './thread-detail.component';
import { CreateThreadComponent } from './create-thread.component';
import { MatButtonModule } from '@angular/material/button';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-forum-page',
  standalone: true,
  providers: [ForumService],
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    ThreadListComponent,
  ],
  template: `
    <div class="forum-container">
      <mat-toolbar color="primary" class="forum-header">
        <button mat-icon-button *ngIf="currentView === 'detail'" (click)="backToList()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="title">Community Forum</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openCreateThreadDialog()">
          <mat-icon>add</mat-icon>
          New Thread
        </button>
      </mat-toolbar>

      <div class="forum-content">
        <div *ngIf="currentView === 'list'">
          <div class="popular-tags">
            <h3>Popular Tags</h3>
            <div class="tags-container">
              <mat-chip *ngFor="let tag of popularTags" (click)="filterByTag(tag)">
                {{tag}}
              </mat-chip>
            </div>
          </div>

          <div *ngIf="isLoading" class="loading-spinner">
            <mat-spinner diameter="40"></mat-spinner>
            <span>Loading threads...</span>
          </div>

          <app-thread-list 
            *ngIf="!isLoading" 
            [threads]="threads"
            (threadClicked)="navigateToThread($event)">
          </app-thread-list>

          <div *ngIf="!isLoading && threads.length === 0" class="no-threads">
            <mat-icon>forum</mat-icon>
            <p>No discussions found</p>
            <button mat-raised-button color="primary" (click)="openCreateThreadDialog()">
              Start a discussion
            </button>
          </div>
        </div>

        <!-- <div *ngIf="currentView === 'detail'">
          <app-thread-detail 
            *ngIf="!isLoading && selectedThread" 
            >
          </app-thread-detail>

          <div *ngIf="!isLoading && !selectedThread" class="thread-not-found">
            <mat-icon>error_outline</mat-icon>
            <h3>Discussion not found</h3>
            <button mat-raised-button color="primary" (click)="backToList()">
              Back to discussions
            </button>
          </div>
        </div> -->
      </div>
    </div>
  `,
  styles: [`
    .forum-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding: 1rem;
    }

    .forum-header {
      position: sticky;
      top: 0;
      z-index: 2;
      
      .spacer {
        flex: 1 1 auto;
      }
      .title {
        font-size: 1.5rem;
        font-weight: 500;
        margin-left: 15%;
        @media (max-width: 900px) {
          margin-left: 2em;
          font-size: 1.2rem;
        }
        @media (max-width: 600px) {
          margin-left: 0;
          font-size: 1rem;
          text-align: left;
          width: 100%;
          display: block;
        }
      }
    }

    .forum-content {
      flex: 1;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }

    .popular-tags {
      margin-bottom: 1.5rem;
      
      h3 {
        margin-bottom: 0.5rem;
      }
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

   .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      gap: 1rem;

      mat-spinner {
        margin-bottom: 0.5rem;
      }

      span {
        font-size: 1rem;
        //color: #666;
        letter-spacing: 0.02em;
      }
    }

    .no-threads, .thread-not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      
      mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        margin-bottom: 1rem;
      }
      
      button {
        margin-top: 1rem;
      }
    }
  `]
})
export class ForumPageComponent implements OnInit, OnDestroy {
  threads: Thread[] = [];
  selectedThread: Thread | null = null;
  isLoading = false;
  currentView: 'list' | 'detail' = 'list';
  popularTags = ['music', 'tour', 'lyrics', 'news', 'discussion', 'videos'];
  private destroy$ = new Subject<void>();

  constructor(
    private forumService: ForumService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['threadId']) {
        this.loadThread(params['threadId']);
      } else {
        this.loadThreads();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadThreads(): void {
    this.currentView = 'list';
    this.isLoading = true;
    this.selectedThread = null;

    this.forumService.getThreads().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cd.detectChanges(); 
      })
    ).subscribe({
      next: (response) => {
        this.threads = response?.data || [];
        this.cd.detectChanges(); 
      },
      error: (err) => {
        console.error('Error loading threads:', err);
        this.threads = [];
        this.cd.detectChanges(); 
      }
    });
  }

  loadThread(threadId: string): void {
    this.currentView = 'detail';
    this.isLoading = true;

    this.forumService.getThreadById(threadId).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (thread) => {
        this.selectedThread = thread;
      },
      error: (err) => {
        console.error('Error loading thread:', err);
        this.selectedThread = null;
      }
    });
  }

  navigateToThread(threadId: any): void {
    if (!threadId) this.router.navigate(['/forum/thread', threadId]);  
  }

  backToList(): void {
    this.router.navigate(['/forum']);
  }

  openCreateThreadDialog(): void {
    const dialogRef = this.dialog.open(CreateThreadComponent, {
      width: '600px',
      maxWidth: '100vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadThreads();
      }
    });
  }

  filterByTag(tag: string): void {
    this.isLoading = true;
    this.forumService.getThreadsByTag(tag).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cd.detectChanges(); 
      })
    ).subscribe({
      next: (response) => {
        console.log('response by tag ',response)
        this.threads = response?.data || [];
        this.cd.detectChanges(); 
      },
      error: (err) => {
        console.error('Error filtering threads:', err);
        this.threads = [];
        this.cd.detectChanges(); 
      }
    });
  }
}