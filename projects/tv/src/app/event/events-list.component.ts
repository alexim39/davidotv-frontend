import { Component } from '@angular/core';
import { EventCardComponent } from './event-card.component';
import { Event } from './event.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [EventCardComponent, CommonModule],
  template: `
    <div class="events-grid">
      <app-event-card 
        *ngFor="let event of events" 
        (click)="viewEvent(event.id)">
      </app-event-card>
     <!--  <app-event-card 
        *ngFor="let event of events" 
        [event]="event"
        (click)="viewEvent(event.id)">
      </app-event-card> -->
    </div>
  `,
  styles: [`
    .events-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      padding: 20px;
    }
  `]
})
export class EventsListComponent {
  events: Event[] = [
    {
      id: '1',
      title: 'Davido Live in Lagos',
      description: 'Annual homecoming concert with special guests',
      date: new Date('2023-12-15T20:00:00'),
      location: 'Eko Convention Center, Lagos',
      imageUrl: 'https://via.placeholder.com/400x225?text=Davido+Concert',
      attendees: 12500,
      attendeesList: [
        { name: 'Ade', avatar: 'https://via.placeholder.com/50?text=A' },
        { name: 'Bola', avatar: 'https://via.placeholder.com/50?text=B' }
      ],
      price: 50,
      category: 'concert',
      badge: {
        type: 'primary',
        text: 'Early Bird'
      }
    },
    {
      id: '2',
      title: 'Fan Meet & Greet',
      description: 'Intimate session with Davido',
      date: new Date('2023-11-20T15:00:00'),
      location: 'Davidotv HQ, Ikeja',
      imageUrl: 'https://via.placeholder.com/400x225?text=Meet+Greet',
      attendees: 150,
      attendeesList: [
        { name: 'Chioma', avatar: 'https://via.placeholder.com/50?text=C' },
        { name: 'Dayo', avatar: 'https://via.placeholder.com/50?text=D' }
      ],
      price: 100,
      category: 'meet-greet',
      badge: {
        type: 'accent',
        text: 'VIP Only'
      }
    },
    {
      id: '3',
      title: 'Album Listening Party',
      description: 'First listen of Davido\'s new album',
      date: new Date('2023-12-01T18:00:00'),
      location: 'Online Event',
      imageUrl: 'https://via.placeholder.com/400x225?text=Album+Party',
      attendees: 3200,
      attendeesList: [
        { name: 'Emeka', avatar: 'https://via.placeholder.com/50?text=E' },
        { name: 'Fola', avatar: 'https://via.placeholder.com/50?text=F' }
      ],
      price: 0,
      category: 'online',
      badge: {
        type: 'warn',
        text: 'Free'
      }
    }
  ];

  viewEvent(eventId: string) {
    console.log('Viewing event:', eventId);
    // In a real app, you would navigate to the detail view:
    // this.router.navigate(['/events', eventId]);
  }
}