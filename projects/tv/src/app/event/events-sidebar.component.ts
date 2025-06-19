import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-events-sidebar',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    MatListModule,
    MatIconModule,
  ],
  template: `
    <div class="events-sidebar">
      <!-- Your Events Section -->
      <mat-card class="sidebar-section">
        <mat-card-header>
          <mat-card-title>Your Events</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-nav-list class="event-card">
            <mat-list-item >
              <mat-icon mat-list-icon>event_available</mat-icon>
              <div mat-line>Attending</div>
              <div mat-line>{{userEvents.attending}} {{userEvents.attending === 1 ? 'event' : 'events'}}</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon mat-list-icon>star</mat-icon>
              <div mat-line>Interested</div>
              <div mat-line>{{userEvents.interested}} {{userEvents.interested === 1 ? 'event' : 'events'}}</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon mat-list-icon>history</mat-icon>
              <div mat-line>Past Events</div>
              <div mat-line>{{userEvents.past}} {{userEvents.past === 1 ? 'event' : 'events'}}</div>
            </mat-list-item>
          </mat-nav-list>
        </mat-card-content>
      </mat-card>

      <!-- Friends Going Section -->
      <mat-card class="sidebar-section">
        <mat-card-header>
          <mat-card-title>Friends Attending</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="friends-list">
            <div class="friend" *ngFor="let friend of friendsGoing">
              <img [src]="friend.avatar" [alt]="'Profile picture of ' + friend.name" width="40" height="40">
              <span>{{friend.name}}</span>
            </div>
          </div>
          <button mat-button color="primary" class="view-all">View All ({{friendsGoing.length}})</button>
        </mat-card-content>
      </mat-card>

      <!-- Trending Section -->
      <mat-card class="sidebar-section">
        <mat-card-header>
          <mat-card-title>Trending in Davidotv</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item *ngFor="let event of trendingEvents">
              <div mat-line>{{event.name}}</div>
              <div mat-line>{{event.attendees | number}} {{event.attendees === 1 ? 'fan' : 'fans'}} going</div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .events-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      
      .sidebar-section {
        mat-card-header {
          mat-card-title {
            font-size: 1.1rem;
            font-weight: 500;
            color: #8f0045; /* Primary color */
          }
        }
        
        mat-card-content {
          padding: 0 16px 16px;
          
          mat-nav-list {
            padding: 0;
            display: flex-wrap;
          }
           .event-card {
            //padding-left: 1em;
            display: flex;
            flex-direction: column;
            mat-list-item {
              width: 100%;
              mat-icon {
                font-size: 22px;
                text-align: center;
              }
            }
          }
        }
        
        .friends-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
          
          .friend {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 60px;
            
            img {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              object-fit: cover;
              margin-bottom: 0.25rem;
              border: 2px solid #f5f5f5;
            }
            
            span {
              font-size: 0.7rem;
              text-align: center;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
            }
          }
        }
        
        .view-all {
          width: 100%;
          margin-top: 0.5rem;
        }
        
        mat-list-item {
          height: auto;
          padding: 0;
          
          [mat-line] {
            font-size: 0.9rem;
            
            &:nth-child(2) {
              color: rgba(161, 161, 161, 0.6);
              font-size: 0.8rem;
            }
          }
        }
       
      }
    }
  `]
})
export class EventsSidebarComponent {
  userEvents = {
    attending: 3,
    interested: 5,
    past: 12
  };
  
  friendsGoing = [
    { name: 'Ade', avatar: '/img/avatar.png' },
    { name: 'Bola', avatar: '/img/avatar.png' },
    { name: 'Chioma', avatar: '/img/avatar.png' },
    { name: 'Dayo', avatar: '/img/avatar.png' },
    { name: 'Emeka', avatar: '/img/avatar.png' },
    { name: 'Funke', avatar: '/img/avatar.png' }
  ];
  
  trendingEvents = [
    { name: 'Davido Live in Lagos', attendees: 12500 },
    { name: 'Fan Meetup NYC', attendees: 850 },
    { name: 'Album Listening Party', attendees: 3200 },
    { name: 'Birthday Celebration', attendees: 5400 }
  ];
}