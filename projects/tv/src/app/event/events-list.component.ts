import { ChangeDetectorRef, Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { Event } from './event.model';
import { finalize, Subscription } from 'rxjs';
import { EventService } from './event.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserInterface, UserService } from '../common/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div *ngIf="loading" class="loader-container">
      <mat-spinner diameter="30"/>
      <span>Loading events...</span>
    </div>

    <div *ngIf="!loading && filteredEvents.length === 0" class="no-events-message">
      <mat-icon color="warn">info</mat-icon>
      No events found for this category.
    </div>

    <div class="events-grid" *ngIf="!loading">
      <mat-card class="event-card" *ngFor="let event of filteredEvents" (click)="handleCardClick($event, event)">
        <div class="event-image-container">
          <img mat-card-image 
               [src]="event.imageUrl" 
               [alt]="event.title + ' event banner'" 
               width="400" 
               height="180">
          <div class="event-badge" *ngIf="event.badge">
            <span [class]="'badge-' + event.badge.type">{{event.badge.text}}</span>
          </div>
          @if (!isPastEvent(event)) {
            <div class="event-actions">
             <!--  <button mat-icon-button 
                      color="primary" 
                      aria-label="Add to favorites"
                      (click)="toggleFavorite($event, event); $event.stopPropagation()">
                <mat-icon>{{isFavorite(event) ? 'favorite' : 'favorite_border'}}</mat-icon>
              </button> -->
              <button mat-icon-button 
                      color="primary" 
                      aria-label="Share event"
                      (click)="shareEvent($event, event); $event.stopPropagation()">
                <mat-icon>share</mat-icon>
              </button>
            </div>
          }
          
        </div>
        
        <mat-card-content>
          <h3 class="event-title">{{event.title}}</h3>
          <p class="event-dscription"> {{event.description}}</p>
          <div class="event-date">
            <mat-icon aria-hidden="true">event</mat-icon>
            <span>{{getDateString(event.date)}} • {{getTimeString(event.date)}}</span>
          </div>
          <div class="event-location">
            <mat-icon aria-hidden="true">location_on</mat-icon>
            <span>{{event.location}}</span>
          </div>
          <div class="event-attendees">
            <mat-icon aria-hidden="true">people</mat-icon>
            @if (isPastEvent(event)) {
              <span>
                {{ event.interestedUsers?.length || 0 | number }}
                {{ (event.interestedUsers?.length || 0) === 1 ? 'fan indicated interest' : 'fans+' }} attended
              </span>
            } @else {
              <span>
              {{ event.interestedUsers?.length || 0 | number }}
              {{ (event.interestedUsers?.length || 0) === 1 ? 'fan indicated interest' : 'fans+' }} attending
            </span>
            }
                      
          </div>
        </mat-card-content>
        
        <mat-card-actions>
           @if (isPastEvent(event)) {
            <button mat-flat-button color="primary" class="rsvp-button" [disabled]="isPastEvent(event)">
              Passed Event
            </button>

           }  @else {
            <button mat-flat-button color="primary" class="rsvp-button" (click)="handleRsvp($event, event)"  [disabled]="isPastEvent(event)">
             Show Attendance Interest
            </button>
           }
          
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .events-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      width: 100%;
    }
    .event-card {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .event-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    .event-image-container {
      position: relative;
    }
    .event-image-container img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      display: block;
    }
    .event-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
    }
    .event-badge span {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      color: white;
    }
    .event-badge .badge-primary { background-color: #8f0045; }
    .event-badge .badge-accent { background-color: #ff4081; }
    .event-badge .badge-warn { background-color: #f44336; }
    .event-actions {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .event-actions button {
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
    }
    .event-actions button:hover {
      background-color: rgba(0, 0, 0, 0.7);
    }
    mat-card-content {
      flex: 1;
      padding: 1rem;
    }
    .event-title {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 500;
      line-height: 1.3;
    }
    .event-dscription {
      color: gray;
      font-size: 0.8rem;  
      margin-bottom: 1rem;
      line-height: 1.4; 
      overflow: hidden;
      text-overflow: ellipsis;  
    }
    .event-date,
    .event-location,
    .event-attendees {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: #666;
    }
    .event-date mat-icon,
    .event-location mat-icon,
    .event-attendees mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      margin-right: 0.5rem;
      color: #8f0045;
    }
    mat-card-actions {
      padding: 0 1rem 1rem;
      margin-top: auto;
    }
    .rsvp-button {
      width: 100%;
      font-weight: 500;
    }

    .loader-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
      width: 100%;
      span {
        display: inline-block;
        margin-left: 10px;
      }
    }

    .no-events-message {
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
export class EventsListComponent implements OnInit, OnDestroy, OnChanges {
  events: Event[] = [
   /*  {
      _id: '1',
      title: 'Davido Live in Concert',
      description: 'Experience an unforgettable night with Davido performing his greatest hits along with special guests. This event will feature fireworks, special effects, and a full band.',
      date: new Date('2023-12-15T20:00:00'),
      location: 'Eko Convention Center, Lagos',
      imageUrl: 'https://via.placeholder.com/800x300?text=Davido+Concert',
      attendees: 12500,
      attendeesList: [
        { name: 'Ade', avatar: 'https://i.pravatar.cc/150?img=1' },
        { name: 'Bola', avatar: 'https://i.pravatar.cc/150?img=2' },
        { name: 'Chioma', avatar: 'https://i.pravatar.cc/150?img=3' },
        { name: 'Dayo', avatar: 'https://i.pravatar.cc/150?img=4' },
        { name: 'Emeka', avatar: 'https://i.pravatar.cc/150?img=5' }
      ],
      price: 50,
      category: 'concert',
      color: '#3f51b5'
    },, */
  ];

  private favoriteIds = new Set<string>();

  @Input() category: string = '';
  filteredEvents: Event[] = [];



  loading = true;
  subscriptions: Subscription[] = [];

  private cd = inject(ChangeDetectorRef);
  private eventService = inject(EventService)
  currentUser: UserInterface | null = null;
  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);

  ngOnInit(): void {
    this.getEvents();
    this.getCurrentUser();
  }

   ngOnChanges(changes: SimpleChanges) {
    if (changes['category']) {
      this.applyCategoryFilter();
    }
  }

   private applyCategoryFilter() {
      if (!this.category || this.category === 'All') {
        this.filteredEvents = this.events;
      } else {
        this.filteredEvents = this.events.filter(
          e => (e.category || '').toLowerCase() === this.category.toLowerCase()
        );
      }
      this.cd.detectChanges();
    }

   ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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


  private getEvents(): void {
    this.loading = true;
    this.cd.detectChanges();

    this.subscriptions.push(
      this.eventService.getAllEvents().subscribe({
        next: (response) => {
          //console.log('returned events ',response.data)
          // Map to expected structure
          this.events = (response.data || []).map((e: Event) => ({
            id: e._id || e._id,
            _id: e._id || e._id,
            title: e.title,
            imageUrl: e.imageUrl || '/img/event-banner.png',
            date: e.date,
            location: e.location,
            externalLink: e.externalLink || '',
            description: e.description || '',
            interestedUsers: e.interestedUsers,
            category: e.category // Make sure category is included!
          }));
          // Set filteredEvents here!
          this.applyCategoryFilter();
          this.loading = false;
          this.cd.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.events = [];
          this.filteredEvents = [];
          this.loading = false;
          this.cd.detectChanges();
        }
      })
    );
  }

  getDateString(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTimeString(date: Date): string {
    // Force UTC to avoid timezone offset issues
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  }

  handleCardClick(e: MouseEvent, event: Event): void {
    e.stopPropagation();
    console.log('Event clicked:', event._id);
    // In a real app: this.router.navigate(['/events', event._id]);
  }

  isFavorite(event: Event): boolean {
    return this.favoriteIds.has(event._id);
  }

  toggleFavorite(e: MouseEvent, event: Event): void {
    e.stopPropagation();
    if (this.favoriteIds.has(event._id)) {
      this.favoriteIds.delete(event._id);
    } else {
      this.favoriteIds.add(event._id);
    }
    //console.log(this.isFavorite(event) ? 'Added to favorites' : 'Removed from favorites');
  }

 /*  toggleFavorite(e: MouseEvent, event: Event): void {
    e.stopPropagation();
    if (this.favoriteIds.has(event._id)) {
      this.favoriteIds.delete(event._id);
    } else {
      this.favoriteIds.add(event._id);
    }
    console.log(this.isFavorite(event) ? 'Added to favorites' : 'Removed from favorites');
  }
 */

  
  shareEvent(e: MouseEvent, event: Event): void {
    e.stopPropagation();
    //console.log('Sharing event:', event.title);
    // In a real app: implement share functionality

    if (navigator.share) {
      navigator.share({
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      //this.snackBar.open('Link copied to clipboard!', '', { duration: 2000 });
    }
  }

  handleRsvp(e: MouseEvent, event: Event): void {
    e.stopPropagation();
    //console.log(event.price > 0 ? 'Starting ticket purchase...' : 'Processing RSVP...');
    // In a real app: navigate to purchase/RSVP flow

    this.handleReminderClick(event);
  }

   handleReminderClick(event: any): void {
    if (!this.currentUser) {
      this.snackBar.open('You need to sign in to mark reminder.', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.cd.detectChanges();

    this.subscriptions.push(
      this.eventService.markInterest({eventId: event.id, userId: this.currentUser?._id})
        .pipe(finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        }))
        .subscribe({
          next: (response) => {
            this.snackBar.open(response.message, 'Close', { duration: 3000 });
          },
          error: (error: HttpErrorResponse) => {
            let errorMessage = 'Server error occurred, please try again.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
            this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
          }
        })
    );
  }

  isPastEvent(event: Event): boolean {
    return new Date(event.date) < new Date();
  }
}