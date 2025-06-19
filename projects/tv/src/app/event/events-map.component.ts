import { Component } from '@angular/core';
import { Event } from './event.model';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-events-map',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    MatListModule,
    MatIconModule
  ],
  template: `
    <div class="events-map">
      <div class="map-container">
        <!-- Map placeholder with improved accessibility -->
        <div class="map-placeholder" aria-label="Event locations map">
          <mat-icon>map</mat-icon>
          <p>Interactive map would display here</p>
          <div class="mock-markers">
            <div *ngFor="let event of events" 
                 class="mock-marker"
                 [style.left]="event.mockCoords?.x + '%'"
                 [style.top]="event.mockCoords?.y + '%'"
                 [style.background]="event.color || '#3f51b5'">
            </div>
          </div>
        </div>
      </div>
      
      <div class="map-legend">
        <div class="legend-item" *ngFor="let event of events">
          <div class="marker" [style.background]="event.color || '#3f51b5'"></div>
          <span>{{event.title}}</span>
          <span class="event-date">{{event.date | date:'shortDate'}}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`

    .events-map {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 16px;
      box-sizing: border-box;
      
      .map-container {
        flex: 1;
        //background-color: mat-color($background, app-bar);
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        min-height: 400px;
        
        .map-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          //color: mat-color($foreground, secondary-text);
          position: relative;
          
          mat-icon {
            font-size: 3rem;
            width: 3rem;
            height: 3rem;
            margin-bottom: 1rem;
          }

          .mock-markers {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          .mock-marker {
            position: absolute;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
        }
      }
      
      .map-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 1rem;
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 8px 12px;
          //background: mat-color($background, card);
          border-radius: 4px;
          
          .marker {
            width: 12px;
            height: 12px;
            border-radius: 50%;
          }

          .event-date {
            margin-left: auto;
            font-size: 0.8em;
            //color: mat-color($foreground, secondary-text);
          }
        }
      }
    }
  `]
})
export class EventsMapComponent {
  events: Event[] = [
    {
      id: '1',
      title: 'Lagos Concert',
      date: new Date('2023-12-15'),
      location: 'Eko Convention Center',
      color: '#3f51b5',
      mockCoords: { x: 30, y: 60 }
    },
    {
      id: '2',
      title: 'Abuja Meet & Greet',
      date: new Date('2023-11-20'),
      location: 'International Conference Center',
      color: '#ff4081',
      mockCoords: { x: 55, y: 40 }
    },
    {
      id: '3',
      title: 'Online Listening Party',
      date: new Date('2023-12-01'),
      location: 'Virtual Event',
      color: '#4caf50',
      mockCoords: { x: 70, y: 30 }
    }
  ];
}