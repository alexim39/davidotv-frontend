import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Event } from './event.model'
interface DialogData {
  event: Event;
}


@Component({
  selector: 'app-event-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="event-detail-dialog">
      <div class="event-header">
        <img [src]="event.imageUrl" [alt]="event.title + ' event image'" width="800" height="300">
        <div class="event-actions">
          <button mat-icon-button aria-label="Add to favorites" (click)="toggleFavorite()">
            <mat-icon>{{isFavorite ? 'favorite' : 'favorite_border'}}</mat-icon>
          </button>
          <button mat-icon-button aria-label="Share event" (click)="shareEvent()">
            <mat-icon>share</mat-icon>
          </button>
          <button mat-icon-button mat-dialog-close aria-label="Close dialog">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
      
      <div class="event-content">
        <h1>{{event.title}}</h1>
        
        <div class="event-meta">
          <div class="meta-item">
            <mat-icon aria-hidden="true">event</mat-icon>
            <div>
              <div class="meta-label">Date</div>
              <div class="meta-value">{{getDateString(event.date)}}</div>
            </div>
          </div>
          
          <div class="meta-item">
            <mat-icon aria-hidden="true">schedule</mat-icon>
            <div>
              <div class="meta-label">Time</div>
              <div class="meta-value">{{getTimeString(event.date)}}</div>
            </div>
          </div>
          
          <div class="meta-item">
            <mat-icon aria-hidden="true">location_on</mat-icon>
            <div>
              <div class="meta-label">Location</div>
              <div class="meta-value">{{event.location}}</div>
            </div>
          </div>
          
          <!-- <div class="meta-item" *ngIf="event.price > 0">
            <mat-icon aria-hidden="true">local_offer</mat-icon>
            <div>
              <div class="meta-label">Price</div>
              <div class="meta-value">From $ {{event.price | number}}</div>
            </div>
          </div> -->
        </div>
        
        <div class="event-description">
          <h3>About this event</h3>
          <p>{{event.description}}</p>
        </div>
        
        <!-- <div class="event-attendees" *ngIf="event.attendeesList.length > 0">
          <h3>Who's going ({{event.attendees}})</h3>
          <div class="attendees-list">
            <div class="attendee" *ngFor="let attendee of event.attendeesList">
              <img [src]="attendee.avatar" 
                   [alt]="'Profile picture of ' + attendee.name" 
                   width="50" 
                   height="50">
              <span>{{attendee.name}}</span>
            </div>
            <div class="more-attendees" *ngIf="event.attendees > event.attendeesList.length">
              +{{event.attendees - event.attendeesList.length}} more
            </div>
          </div>
        </div> -->
      </div>
      
      <div class="event-footer">
        <button mat-flat-button 
                color="primary" 
                class="action-button"
                (click)="handleAction(event)">
          <!-- {{event.price > 0 ? 'Get Tickets' : 'RSVP'}} -->
           Get Tickets
        </button>
        <button mat-stroked-button 
                color="primary" 
                class="action-button"
                (click)="shareEvent()">
          Share with Friends
        </button>
      </div>
    </div>
  `,
  styles: [`
    .event-detail-dialog {
      max-width: 800px;
      font-family: 'Roboto', sans-serif;
      
      .event-header {
        position: relative;
        height: 300px;
        border-radius: 4px 4px 0 0;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .event-actions {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.5rem;
          
          button {
           // background-color: rgba(139, 139, 139, 0.5);
           // color: white;
            
            &:hover {
              background-color: rgba(177, 177, 177, 0.7);
            }
          }
        }
      }
      
      .event-content {
        padding: 2rem;
        
        h1 {
          margin: 0 0 1rem 0;
          font-size: 1.8rem;
          color: #8f0045;
        }
        
        .event-meta {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
          
          .meta-item {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            
            mat-icon {
              color: #8f0045;
              margin-top: 2px;
            }
            
            .meta-label {
              font-size: 0.8rem;
              //color: rgba(0, 0, 0, 0.6);
            }
            
            .meta-value {
              font-weight: 500;
            }
          }
        }
        
        .event-description {
          margin: 2rem 0;
          
          h3 {
            color: #8f0045;
            margin-bottom: 0.5rem;
          }
          
          p {
            line-height: 1.6;
            margin: 0;
          }
        }
        
        .event-attendees {
          margin: 2rem 0;
          
          h3 {
            color: #8f0045;
            margin-bottom: 1rem;
          }
          
          .attendees-list {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            
            .attendee {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 60px;
              
              img {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                object-fit: cover;
                margin-bottom: 0.25rem;
                border: 2px solid #f5f5f5;
              }
              
              span {
                font-size: 0.8rem;
                text-align: center;
              }
            }
            
            .more-attendees {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              //background-color: #f5f5f5;
              //color: rgba(0, 0, 0, 0.6);
              font-size: 0.8rem;
            }
          }
        }
      }
      
      .event-footer {
        display: flex;
        gap: 1rem;
        padding: 1rem 2rem;
        border-top: 1px solid rgba(79, 79, 79, 0.12);
        
        .action-button {
          flex: 1;
          height: 44px;
        }
      }
    }
  `]
})
export class EventDetailDialogComponent {
  event: Event;
  isFavorite = false;

  // Default mock data if none is provided
 /*  private defaultEvent: Event = {
    id: '1',
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
  }; */

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.event = data?.event || {};
  }

  getDateString(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  handleAction(event: Event): void {
    //console.log(this.event.price > 0 ? 'Redirecting to ticket purchase...' : 'Processing RSVP...');
    // In a real app, this would navigate to purchase/RSVP flow

    if (event.externalLink) {
      window.open(event.externalLink, '_blank');
    }
  }

  shareEvent(): void {
    //console.log('Sharing event:', this.event.title);
    // In a real app, this would open native share dialog

    if (navigator.share) {
      navigator.share({
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      //this.snackBar.open('Link copied to clipboard!', '', { duration: 2000 });
    }
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
  }


}