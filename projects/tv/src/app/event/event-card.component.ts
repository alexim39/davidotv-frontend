import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  imageUrl: string;
  attendees: number;
  attendeesList?: { name: string; avatar: string }[];
  price: number;
  category: string;
  badge?: {
    type: 'primary' | 'accent' | 'warn';
    text: string;
  };
}

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatButtonModule
  ],
  template: `
    <mat-card class="event-card" (click)="handleCardClick()">
      <div class="event-image-container">
        <img mat-card-image 
             [src]="event.imageUrl" 
             [alt]="event.title + ' event banner'" 
             width="400" 
             height="180">
        <div class="event-badge" *ngIf="event.badge">
          <span [class]="'badge-' + event.badge.type">{{event.badge.text}}</span>
        </div>
        <div class="event-actions">
          <button mat-icon-button 
                  color="primary" 
                  aria-label="Add to favorites"
                  (click)="toggleFavorite($event)">
            <mat-icon>{{isFavorite ? 'favorite' : 'favorite_border'}}</mat-icon>
          </button>
          <button mat-icon-button 
                  color="primary" 
                  aria-label="Share event"
                  (click)="shareEvent($event)">
            <mat-icon>share</mat-icon>
          </button>
        </div>
      </div>
      
      <mat-card-content>
        <h3 class="event-title">{{event.title}}</h3>
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
          <span>{{event.attendees | number}} {{event.attendees === 1 ? 'fan' : 'fans'}} going</span>
        </div>
      </mat-card-content>
      
      <mat-card-actions>
        <button mat-flat-button 
                color="primary" 
                class="rsvp-button"
                (click)="handleRsvp($event)">
          {{event.price > 0 ? ('From $' + (event.price | number)) : 'FREE'}}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .event-card {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      }
      
      .event-image-container {
        position: relative;
        
        img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          display: block;
        }
        
        .event-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          
          span {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            color: white;
            
            &.badge-primary {
              background-color: #8f0045; /* Primary color */
            }
            
            &.badge-accent {
              background-color: #ff4081; /* Accent color */
            }
            
            &.badge-warn {
              background-color: #f44336; /* Warn color */
            }
          }
        }
        
        .event-actions {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          
          button {
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            
            &:hover {
              background-color: rgba(0, 0, 0, 0.7);
            }
          }
        }
      }
      
      mat-card-content {
        flex: 1;
        padding: 1rem;
        
        .event-title {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          font-weight: 500;
          line-height: 1.3;
        }
        
        .event-date,
        .event-location,
        .event-attendees {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: rgba(220, 220, 220, 0.6);
          
          mat-icon {
            font-size: 1rem;
            width: 1rem;
            height: 1rem;
            margin-right: 0.5rem;
            color: #3f51b5;
          }
        }
      }
      
      mat-card-actions {
        padding: 0 1rem 1rem;
        margin-top: auto;
        
        .rsvp-button {
          width: 100%;
          font-weight: 500;
        }
      }
    }
  `]
})
export class EventCardComponent {
  @Input() event: Event = this.getDefaultEvent();
  isFavorite = false;

  private getDefaultEvent(): Event {
    return {
      id: '1',
      title: 'Davido Live in Concert',
      description: 'Annual homecoming concert with special guests',
      date: new Date('2023-12-15T20:00:00'),
      location: 'Eko Convention Center, Lagos',
      imageUrl: '/img/event-banner.png',
      attendees: 12500,
      price: 50,
      category: 'concert',
      badge: {
        type: 'primary',
        text: 'Early Bird'
      }
    };
  }

  getDateString(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTimeString(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  handleCardClick(): void {
    console.log('Event clicked:', this.event.id);
    // In a real app: this.router.navigate(['/events', this.event.id]);
  }

  toggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    this.isFavorite = !this.isFavorite;
    console.log(this.isFavorite ? 'Added to favorites' : 'Removed from favorites');
  }

  shareEvent(event: MouseEvent): void {
    event.stopPropagation();
    console.log('Sharing event:', this.event.title);
    // In a real app: implement share functionality
  }

  handleRsvp(event: MouseEvent): void {
    event.stopPropagation();
    console.log(this.event.price > 0 ? 'Starting ticket purchase...' : 'Processing RSVP...');
    // In a real app: navigate to purchase/RSVP flow
  }
}