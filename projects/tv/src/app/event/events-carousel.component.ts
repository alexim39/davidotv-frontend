import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Event } from './event.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventService } from './event.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserInterface, UserService } from '../common/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EventDetailDialogComponent } from './event-detail-dialog.component';

@Component({
  selector: 'app-events-carousel',
  standalone: true,
  providers: [EventService],
  imports: [
    CommonModule, 
    MatCardModule, 
    MatProgressBarModule, 
    MatIconModule, 
    MatButtonModule, 
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  template: `
   <section class="carousel-wrapper">
  <div class="carousel-header">
    <h2><!-- Featured Events --></h2>
    <div class="controls">
      <button mat-icon-button (click)="manualPrevious()" aria-label="Previous">
        <mat-icon>chevron_left</mat-icon>
      </button>
      <button mat-icon-button (click)="manualNext()" aria-label="Next">
        <mat-icon>chevron_right</mat-icon>
      </button>
    </div>
  </div>

  <mat-progress-bar *ngIf="loading" mode="indeterminate"/>

  <!-- Show error message if present -->
  <div *ngIf="errorMessage" class="error-message">
    <mat-icon color="warn">error_outline</mat-icon>
    {{ errorMessage }}
  </div>


  <div class="carousel-container" *ngIf="!errorMessage && duplicatedEvents.length > 0" #carouselContainer
       (mouseenter)="pauseAutoScroll()" (mouseleave)="resumeAutoScroll()">
    <div class="carousel-track" [style.transform]="'translateX(' + offset + 'px)'">
      <mat-card
        class="event-card"
        *ngFor="let event of duplicatedEvents"
        (mouseenter)="hoveredCard = event._id" 
        (mouseleave)="hoveredCard = null"
        [class.paused]="hoveredCard === event._id"
        (click)="handleEventClick(event)"
      >
        <img mat-card-image [src]="event.imageUrl" [alt]="event.title" />
        <div class="card-content">
          <h3>{{ event.title }}</h3>
          <p class="description">{{ event.description }}</p>
          <p class="meta">
            <mat-icon>event</mat-icon> {{ event.date | date: 'mediumDate' }}
            <span class="location">
              <mat-icon>location_on</mat-icon> {{ event.location }}
            </span>
          </p>
          <div class="buttons">
            <button mat-flat-button color="primary" (click)="handleTicketClick(event.externalLink); $event.stopPropagation()">
              Get Tickets
            </button>
            <button mat-stroked-button color="primary" (click)="handleReminderClick(event); $event.stopPropagation()" [disabled]="loading || isUserInterested(event)">
              Remind Me
            </button>
          </div>
        </div>
      </mat-card>
    </div>

     
    
  </div>

  <!-- Show no events message if not loading, no error, and no events -->
  <div *ngIf="!errorMessage && duplicatedEvents.length === 0 && !loading" class="no-events-message">
    <mat-icon color="warn">info</mat-icon>
    No featured events found.
  </div>
</section>
  `,
  styles: [`
    .carousel-wrapper {
      width: 100%;
      padding: 1rem;
      position: relative;
      overflow: hidden;
      margin-top: -3rem;
    }

    .carousel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .carousel-header h2 {
      font-size: 1rem;
      margin: 0;
    }

    .carousel-container {
      width: 100%;
      overflow: hidden;
      position: relative;
    }

    .carousel-track {
      display: flex;
      gap: 1rem;
      will-change: transform;
      width: max-content;
    }

    .event-card {
      width: 300px;
      flex-shrink: 0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .event-card:hover {
      transform: scale(1.02);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .event-card.paused {
      animation: pulse 1.5s infinite;
      box-shadow: 0 0 0 3px #8f0045;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }

    img[mat-card-image] {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }

    .card-content {
      padding: 1rem;
    }

    .card-content h3 {
      margin: 0 0 0.5rem;
      font-size: 1.2rem;
    }

    .description {
      font-size: 0.7rem;
      margin-bottom: 0.5rem;
      max-height: 3.6rem; /* 2 lines */ 
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2; /* Limit to 2 lines */
      -webkit-box-orient: vertical; 
      line-height: 1.2rem;
      color: #666;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .meta mat-icon {
      vertical-align: middle;
      font-size: 18px;
    }

    .location {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .buttons {
      display: flex;
      gap: 0.5rem;
    }

    .buttons button {
      flex: 1;
    }

    .no-events-message, .error-message {
      text-align: center;
      color: #8f0045;
      margin: 2rem 0;
      font-size: 1.1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class EventsCarouselComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() events: Event[] = [];
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;

  offset = 0;
  hoveredCard: string | null = null;
  duplicatedEvents: Event[] = [];
  scrollSpeed = 50; // pixels per second
  animationFrameId: number | null = null;
  lastTimestamp = 0;
  isAutoScrollPaused = false;
  cardWidth = 316; // 300px width + 16px gap

  errorMessage: string | null = null;
  private dialog = inject(MatDialog);

  constructor(
    private cd: ChangeDetectorRef,
    private eventService: EventService,
  ) {}

  private router = inject(Router);
  subscriptions: Subscription[] = [];
  private userService = inject(UserService);
  loading = false;
  currentUser: UserInterface | null = null;
  private snackBar = inject(MatSnackBar);
  
  ngOnInit(): void {
    this.loadEvents();
    this.getCurrentUser();
  }

  private getCurrentUser() {
     this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.currentUser = user;
          //console.log('current user ',this.currentUser)
        }
      })
    )
  }


  private loadEvents() {
    try {
      // Defensive: handle undefined/null events input
      if (!this.events || !Array.isArray(this.events) || this.events.length === 0) {
        this.duplicatedEvents = [];
        this.errorMessage = 'No featured events available.';
        return;
      }
      // Duplicate events to create seamless loop
      this.duplicatedEvents = [...this.events, ...this.events];
      this.errorMessage = null;
    } catch (err) {
      this.duplicatedEvents = [];
      this.errorMessage = 'Failed to load events. Please try again later.';
      console.error('Error loading events:', err);
    }
  }

  ngAfterViewInit() {
    this.startAutoScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();

     this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  startAutoScroll() {
    this.lastTimestamp = performance.now();
    this.animate();
  }

  stopAutoScroll() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  animate(timestamp?: number) {
    if (!timestamp) timestamp = performance.now();
    
    if (!this.isAutoScrollPaused && this.hoveredCard === null) {
      const deltaTime = timestamp - this.lastTimestamp;
      this.offset -= (this.scrollSpeed * deltaTime) / 1000;
      
      // Reset offset when we've scrolled through one set of events
      if (Math.abs(this.offset) >= this.cardWidth * this.events.length) {
        this.offset = 0;
      }
      this.cd.detectChanges(); // <-- Add this line
    }
    
    this.lastTimestamp = timestamp;
    this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
  }

  pauseAutoScroll() {
    this.isAutoScrollPaused = true;
  }

  resumeAutoScroll() {
    this.isAutoScrollPaused = false;
    this.lastTimestamp = performance.now();
  }

  manualPrevious() {
    this.offset += this.cardWidth;
    if (this.offset > 0) {
      this.offset = -this.cardWidth * (this.duplicatedEvents.length - 1);
    }
  }

  manualNext() {
    this.offset -= this.cardWidth;
    if (Math.abs(this.offset) >= this.cardWidth * this.events.length) {
      this.offset = 0;
    }
  }

   handleEventClick(event: Event): void {
    this.dialog.open(EventDetailDialogComponent, {
      data: { event },
      width: '600px',
      maxWidth: '95vw',
      autoFocus: false
    });
  }

  handleTicketClick(externalLink: string | undefined): void {
    if (externalLink) {
      window.open(externalLink, '_blank');
    }
  }


  handleReminderClick(event: any): void {
    if (!this.currentUser) {
      this.snackBar.open('You need to sign in to mark reminder.', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.cd.detectChanges();

    this.subscriptions.push(
      this.eventService.markInterest({eventId: event.id, userId: this.currentUser?._id}).subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Close', { duration: 3000 });
          this.loading = false;
          this.cd.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          let errorMessage = 'Server error occurred, please try again.'; // default error message.
          if (error.error && error.error.message) {
            errorMessage = error.error.message; // Use backend's error message if available.
          }
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
          this.loading = false;
          this.errorMessage = errorMessage;
          this.cd.detectChanges();
        }
      })
    );
  }

 isUserInterested(event: any): boolean {
  if (!event.interestedUsers || !this.currentUser) return false;
  return event.interestedUsers.some(
    (entry: any) => entry.user && entry.user._id === this.currentUser?._id
  );
}


}