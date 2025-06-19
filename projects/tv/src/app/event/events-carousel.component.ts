import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Event } from './event.model';

@Component({
  selector: 'app-events-carousel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="carousel-container">
      <div class="carousel-header">
        <h2 class="carousel-title">Featured Events</h2>
        <div class="carousel-controls">
          <button mat-icon-button 
                  (click)="previousSlide()" 
                  [disabled]="currentSlide === 0"
                  aria-label="Previous slide">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button mat-icon-button 
                  (click)="nextSlide()" 
                  [disabled]="currentSlide === maxSlide"
                  aria-label="Next slide">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </div>

      <div class="carousel-track" [style.transform]="'translateX(' + (-currentSlide * 100 / slidesPerView) + '%)'">
        <div class="carousel-slide" 
             *ngFor="let event of displayedEvents"
             [style.flex-basis]="100 / slidesPerView + '%'">
          <mat-card class="featured-event-card" (click)="handleEventClick(event.id)">
            <img mat-card-image 
                 [src]="event.imageUrl" 
                 [alt]="event.title + ' event banner'"
                 width="400"
                 height="400">
            <div class="event-overlay">
              <div class="event-info">
                <h3>{{event.title}}</h3>
                <div class="event-meta">
                  <div class="date">
                    <mat-icon aria-hidden="true">event</mat-icon>
                    <span>{{event.date | date:'MMM d, y'}}</span>
                  </div>
                  <div class="location">
                    <mat-icon aria-hidden="true">location_on</mat-icon>
                    <span>{{event.location}}</span>
                  </div>
                </div>
                <div class="event-actions">
                  <button mat-flat-button 
                          color="primary"
                          (click)="handleTicketClick($event, event.id)">
                    Get Tickets
                  </button>
                  <button mat-stroked-button 
                          color="primary"
                          (click)="handleReminderClick($event, event.id)">
                    Remind Me
                  </button>
                </div>
              </div>
            </div>
          </mat-card>
        </div>
      </div>

      <div class="carousel-indicators">
        <button *ngFor="let indicator of indicators" 
                mat-icon-button
                (click)="goToSlide(indicator)"
                [class.active]="currentSlide === indicator"
                [attr.aria-label]="'Go to slide ' + (indicator + 1)">
          <mat-icon>{{currentSlide === indicator ? 'radio_button_checked' : 'radio_button_unchecked'}}</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .carousel-container {
      position: relative;
      overflow: hidden;
      padding: 1rem;
    }

    .carousel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      .carousel-title {
        color: #3f51b5;
        margin: 0;
        font-size: 1.5rem;
      }
    }

    .carousel-track {
      display: flex;
      transition: transform 0.5s ease;
      width: 100%;
    }

    .carousel-slide {
      flex: 0 0 100%;
      padding: 0 0.5rem;
      box-sizing: border-box;
      min-width: 0;
    }

    .featured-event-card {
      position: relative;
      height: 400px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      
      .event-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
        padding: 2rem;
        color: white;
        
        .event-info {
          h3 {
            margin: 0 0 1rem;
            font-size: 1.5rem;
            line-height: 1.2;
          }
          
          .event-meta {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
            
            .date,
            .location {
              display: flex;
              align-items: center;
              font-size: 0.9rem;
              
              mat-icon {
                margin-right: 0.5rem;
                font-size: 1.2rem;
              }
            }
          }
          
          .event-actions {
            display: flex;
            gap: 1rem;
            
            button {
              flex: 1;
              font-weight: 500;
            }
          }
        }
      }
    }

    .carousel-indicators {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
      gap: 0.5rem;
      
      button {
        color: rgba(0, 0, 0, 0.38);
        
        &.active {
          color: #3f51b5;
        }
      }
    }

    .carousel-controls {
      display: flex;
      gap: 0.5rem;
    }

    @media (min-width: 600px) {
      .carousel-slide {
        flex: 0 0 50%;
      }
    }

    @media (min-width: 960px) {
      .carousel-slide {
        flex: 0 0 33.33%;
      }
    }

    @media (min-width: 1280px) {
      .carousel-slide {
        flex: 0 0 25%;
      }
    }
  `]
})
export class EventsCarouselComponent implements OnInit, OnDestroy {
  @Input() events: Event[] = this.getDefaultEvents();
  currentSlide = 0;
  slidesPerView = 1;
  private resizeObserver: ResizeObserver | undefined;

  get maxSlide(): number {
    return Math.max(0, Math.ceil(this.events.length / this.slidesPerView) - 1);
  }

  get indicators(): number[] {
    return Array.from({ length: this.maxSlide + 1 }, (_, i) => i);
  }

  get displayedEvents(): Event[] {
    // For infinite carousel effect, duplicate events
    return [...this.events, ...this.events, ...this.events];
  }

  ngOnInit(): void {
    this.updateSlidesPerView();
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private getDefaultEvents(): Event[] {
    return [
      {
        id: '1',
        title: 'Davido Live in Lagos',
        description: 'Annual homecoming concert',
        date: new Date('2023-12-15'),
        location: 'Eko Convention Center',
        imageUrl: 'img/event-banner.png',
        attendees: 12500,
        price: 50
      },
      {
        id: '2',
        title: 'Meet & Greet',
        description: 'Intimate session with Davido',
        date: new Date('2023-11-20'),
        location: 'Davidotv HQ, Ikeja',
        imageUrl: 'img/event-banner.png',
        attendees: 150,
        price: 100
      },
      {
        id: '3',
        title: 'Album Listening Party',
        description: 'First listen of new album',
        date: new Date('2023-12-01'),
        location: 'Online Event',
        imageUrl: 'img/event-banner.png',
        attendees: 3200,
        price: 0
      },
      {
        id: '4',
        title: 'Charity Concert',
        description: 'Fundraiser for education',
        date: new Date('2024-01-10'),
        location: 'Tafawa Balewa Square',
        imageUrl: 'img/event-banner.png',
        attendees: 8000,
        price: 30
      }
    ];
  }

  private updateSlidesPerView(): void {
    const width = window.innerWidth;
    if (width >= 1280) this.slidesPerView = 4;
    else if (width >= 960) this.slidesPerView = 3;
    else if (width >= 600) this.slidesPerView = 2;
    else this.slidesPerView = 1;
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateSlidesPerView();
    });
    this.resizeObserver.observe(document.body);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % (this.maxSlide + 1);
  }

  previousSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.maxSlide + 1) % (this.maxSlide + 1);
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  handleEventClick(eventId: string): void {
    console.log('Event clicked:', eventId);
    // this.router.navigate(['/events', eventId]);
  }

  handleTicketClick(event: MouseEvent, eventId: string): void {
    event.stopPropagation();
    console.log('Get tickets for:', eventId);
  }

  handleReminderClick(event: MouseEvent, eventId: string): void {
    event.stopPropagation();
    console.log('Set reminder for:', eventId);
  }
}