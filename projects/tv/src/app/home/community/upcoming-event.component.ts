

import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from '../../event/event.service';
import { UserInterface, UserService } from '../../common/services/user.service';
import { Event } from './../../event/event.model';
import { TruncatePipe } from "../../common/pipes/truncate.pipe";

@Component({
  selector: 'community-upcoming-event',
  standalone: true,
  providers: [EventService],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    TruncatePipe
],
  template: `
    <section class="events-section">
      <div class="section-header">
        <h2>Upcoming Events</h2>
        <div class="controls">
          <a mat-button 
                  color="primary" 
                  (click)="viewAllEvents()"
                  class="view-all-button">
            View All Events <mat-icon>arrow_forward</mat-icon>
          </a>
          <div class="slide-controls">
            <button mat-icon-button (click)="prevSlide()" [disabled]="currentSlide === 0">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <button mat-icon-button (click)="nextSlide()" [disabled]="currentSlide === maxSlide">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <div class="events-container">
        <div class="events-track" [style.transform]="'translateX(' + -currentSlide * 100 + '%)'">
          <div class="event-slide" *ngFor="let event of events; let i = index">
            <mat-card class="event-card">
              <div class="card-image-container">
                <img [src]="event.imageUrl" [alt]="event.title" class="event-image" />
                <div class="event-date">
                  <span class="date-day">{{ event.date | date:'d' }}</span>
                  <span class="date-month">{{ event.date | date:'MMM' }}</span>
                </div>
              </div>
              
              <div class="card-content">
                <div class="event-meta">
                  <span class="event-location">
                    <mat-icon>location_on</mat-icon>
                    {{ event.location }}
                  </span>
                  <span class="event-time">
                    <mat-icon>schedule</mat-icon>
                    {{ event.date | date:'shortTime' }}
                  </span>
                </div>
                
                <h3 class="event-title">{{ event.title }}</h3>
                <p class="event-description">{{ (event.description ?? '') | truncate:100 }}</p>
                
                <div class="card-actions">
                  <button mat-stroked-button 
                          color="primary" 
                          (click)="handleReminderClick(event)"
                          [disabled]="loading || isUserInterested(event)">
                    {{ isUserInterested(event) ? 'Reminder set for this event' : 'Set Reminder' }}
                  </button>
                  <button mat-flat-button 
                          color="primary" 
                          (click)="handleTicketClick(event.externalLink)">
                    Get Tickets
                  </button>
                </div>
              </div>
            </mat-card>
          </div>
        </div>
      </div>

      <div class="mobile-indicators" *ngIf="events.length > 1">
        <span *ngFor="let _ of [].constructor(events.length); let i = index" 
              [class.active]="i === currentSlide"
              (click)="goToSlide(i)"></span>
      </div>

      <div class="no-events" *ngIf="!loading && events.length === 0">
        <mat-icon>event_busy</mat-icon>
        <p>No upcoming events scheduled</p>
        <p class="subtext">Check back later for updates</p>
      </div>

      <mat-spinner *ngIf="loading" diameter="40"></mat-spinner>
    </section>
  `,
  styles: [`
    .events-section {
      padding: 1.5rem;
      margin-top: 1rem;
      position: relative;
    }

   .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      //color: #333;
    }

     .controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

     .slide-controls {
      display: flex;
      gap: 0.5rem;
    }

    .view-all-button {
      margin-right: 0.5rem;

      display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s ease;

        &:hover {
          color: #8f0045;
          transform: translateX(4px);
        }

        mat-icon {
          width: 18px;
          height: 18px;
          font-size: 18px;
        }
    }

    .controls button {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 50%;
    }

    .controls button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .events-container {
      width: 100%;
      overflow: hidden;
      position: relative;
    }

    .events-track {
      display: flex;
      transition: transform 0.5s ease;
      will-change: transform;
    }

    .event-slide {
      flex: 0 0 100%;
      padding: 0 0.5rem;
      box-sizing: border-box;
    }

    .event-card {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .event-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .card-image-container {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .event-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .event-card:hover .event-image {
      transform: scale(1.05);
    }

    .event-date {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.5rem;
      border-radius: 8px;
      text-align: center;
      min-width: 50px;
    }

    .date-day {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
      line-height: 1;
    }

    .date-month {
      display: block;
      font-size: 0.8rem;
      text-transform: uppercase;
    }

    .card-content {
      padding: 1.5rem;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .event-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.8rem;
      font-size: 0.85rem;
      //color: #666;
    }

    .event-meta mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      vertical-align: text-top;
    }

    .event-title {
      margin: 0 0 0.8rem;
      font-size: 1.25rem;
      font-weight: 600;
      //color: #222;
    }

    .event-description {
      margin: 0 0 1.5rem;
      //color: #555;
      font-size: 0.95rem;
      line-height: 1.5;
      flex-grow: 1;
    }

    .card-actions {
      display: flex;
      gap: 0.8rem;
      margin-top: auto;
    }

    .card-actions button {
      flex: 1;
    }

    .mobile-indicators {
      display: none;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .mobile-indicators span {
      display: block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ddd;
      cursor: pointer;
    }

    .mobile-indicators span.active {
      background: #8f0045;
    }

    .no-events {
      text-align: center;
      padding: 2rem;
      //color: #666;
    }

    .no-events mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
      //color: #bbb;
    }

    .no-events p {
      margin: 0.5rem 0;
      font-size: 1.1rem;
    }

    .no-events .subtext {
      font-size: 0.9rem;
      //color: #999;
    }

    mat-spinner {
      margin: 2rem auto;
    }

    /* Responsive styles */
    @media (min-width: 600px) {
      .event-slide {
        flex: 0 0 50%;
      }
    }

    @media (min-width: 960px) {
      .event-slide {
        flex: 0 0 33.333%;
      }
    }

    @media (max-width: 599px) {
        .section-header {
            flex-direction: column;
            align-items: flex-start;
        }
      .mobile-indicators {
        display: flex;
      }
      
     .controls {
        width: 100%;
        justify-content: space-between;
      }

      .view-all-button {
        order: 1;
        width: 100%;
        margin-bottom: 1rem;

        align-self: flex-end;
      }
    
      .slide-controls {
        order: 2;
      }
      
      .card-actions {
        flex-direction: column;
      }
    }
  `]
})
export class UpcomingEventComponent implements OnInit, OnDestroy {
  private eventService = inject(EventService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cd = inject(ChangeDetectorRef);
  private router = inject(Router);

  events: Event[] = [];
  currentSlide = 0;
  maxSlide = 0;
  loading = false;
  errorMessage: string | null = null;
  private subscriptions: Subscription[] = [];
  currentUser: UserInterface | null = null;

  ngOnInit(): void {
    this.loadEvents();
    this.getCurrentUser();
  }

  private getCurrentUser() {
    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.currentUser = user;
        }
      })
    );
  }

    private loadEvents() {
        this.loading = true;
        this.subscriptions.push(
            this.eventService.getFeaturedEvents().subscribe({
            next: (response) => {
                //console.log('Upcoming events:', response);
                
                // Filter out past events
                const now = new Date();
                this.events = response.data.filter((event: Event) => {
                const eventDate = new Date(event.date);
                return eventDate > now; // Only include events in the future
                });
                
                this.maxSlide = Math.max(0, this.events.length - 1);
                
                // Use setTimeout to defer the change to the next tick
                setTimeout(() => {
                this.loading = false;
                });
            },
            error: () => {
                this.errorMessage = 'Failed to load events. Please try again later.';
                setTimeout(() => {
                this.loading = false;
                });
            }
            })
        );
    }

  prevSlide() {
    this.currentSlide = Math.max(0, this.currentSlide - 1);
  }

  nextSlide() {
    this.currentSlide = Math.min(this.maxSlide, this.currentSlide + 1);
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  handleTicketClick(externalLink: string | undefined): void {
    if (externalLink) {
      window.open(externalLink, '_blank');
    }
  }

  handleReminderClick(event: Event): void {
  if (!this.currentUser) {
    this.snackBar.open('Please sign in to set reminders', 'Close', { duration: 3000 });
    return;
  }

  this.loading = true;
  this.subscriptions.push(
    this.eventService.markInterest({
      eventId: event._id,
      userId: this.currentUser._id
    }).subscribe({
      next: (response) => {
        this.snackBar.open(response.message, 'Close', { duration: 3000 });
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Failed to set reminder', 'Close', { duration: 3000 });
        this.loading = false;
        this.cd.detectChanges();
      }
    })
  );
}

  isUserInterested(event: Event): boolean {
    if (!event.interestedUsers || !this.currentUser) return false;
    return event.interestedUsers.some(
      (entry: any) => entry.user && entry.user._id === this.currentUser?._id
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

   viewAllEvents(): void {
    this.router.navigate(['/events']);
  }
}