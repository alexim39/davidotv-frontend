import {
  Component,
  Input,
  OnInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Event as AppEvent } from './event.model'; // rename to avoid conflict with DOM Event

@Component({
  selector: 'app-events-carousel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <section class="carousel-wrapper">
      <div class="carousel-header">
        <h2><!-- Featured Events --></h2>
        <div class="controls">
          <button mat-icon-button (click)="previous()" [disabled]="current === 0" aria-label="Previous">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button mat-icon-button (click)="next()" [disabled]="current >= maxSlide" aria-label="Next">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </div>

      <div class="carousel-content">
        <div class="carousel-track" [style.transform]="transformStyle">
          <mat-card
            class="event-card"
            *ngFor="let event of events"
            (click)="handleEventClick(event.id)"
          >
            <img mat-card-image [src]="event.imageUrl" [alt]="event.title" />
            <div class="card-content">
              <h3>{{ event.title }}</h3>
              <p class="meta">
                <mat-icon>event</mat-icon> {{ event.date | date: 'mediumDate' }}
                <span class="location">
                  <mat-icon>location_on</mat-icon> {{ event.location }}
                </span>
              </p>
              <div class="buttons">
                <button mat-flat-button color="primary" (click)="handleTicketClick($event, event.id)">Get Tickets</button>
                <button mat-stroked-button color="primary" (click)="handleReminderClick($event, event.id)">Remind Me</button>
              </div>
            </div>
          </mat-card>
        </div>
      </div>

      <div class="carousel-indicators">
        <button
          *ngFor="let dot of indicators; let i = index"
          mat-icon-button
          [class.active]="i === current"
          (click)="goTo(i)"
        >
          <mat-icon>{{ i === current ? 'radio_button_checked' : 'radio_button_unchecked' }}</mat-icon>
        </button>
      </div>
    </section>
  `,
  styles: [`
    .carousel-wrapper {
      width: 100%;
      padding: 2rem 1rem;
      //background: #f9f9f9;
    }

    .carousel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .carousel-header h2 {
      font-size: 1.8rem;
      color: #444;
      margin: 0;
    }

    .controls button {
      color: #333;
    }

    .carousel-content {
      overflow: hidden;
      position: relative;
    }

    .carousel-track {
      display: flex;
      gap: 1rem;
      transition: transform 0.5s ease-in-out;
    }

    .event-card {
      min-width: 100%;
      flex-shrink: 0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .event-card:hover {
      transform: scale(1.02);
    }

    img[mat-card-image] {
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      max-width: 30em;
    }

    .card-content {
      padding: 1rem;
    }

    .card-content h3 {
      margin: 0 0 0.5rem;
      font-size: 1.2rem;
      //color: #222;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: #666;
      font-size: 0.9rem;
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
      margin-top: 1rem;
      display: flex;
      gap: 0.5rem;
    }

    .carousel-indicators {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .carousel-indicators button.active mat-icon {
      color: #8f0045;
    }

    /* Responsive breakpoints */
    @media (min-width: 600px) {
      .event-card { min-width: 48%; }
    }

    @media (min-width: 960px) {
      .event-card { min-width: 31%; }
    }

    @media (min-width: 1280px) {
      .event-card { min-width: 23%; }
    }
  `]
})
export class EventsCarouselComponent implements OnInit {
  @Input() events: AppEvent[] = [];

  current = 0;
  slidesPerView = 1;

  ngOnInit() {
    this.updateSlidesPerView();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateSlidesPerView();
  }

  updateSlidesPerView(): void {
    const width = window.innerWidth;
    if (width >= 1280) this.slidesPerView = 4;
    else if (width >= 960) this.slidesPerView = 3;
    else if (width >= 600) this.slidesPerView = 2;
    else this.slidesPerView = 1;
  }

  get maxSlide(): number {
    return Math.max(0, this.events.length - this.slidesPerView);
  }

  get indicators(): number[] {
    return Array.from({ length: this.events.length - this.slidesPerView + 1 }, (_, i) => i);
  }

  get transformStyle(): string {
    return `translateX(-${this.current * (100 / this.slidesPerView)}%)`;
  }

  previous(): void {
    if (this.current > 0) this.current--;
  }

  next(): void {
    if (this.current < this.maxSlide) this.current++;
  }

  goTo(index: number): void {
    this.current = index;
  }

  handleEventClick(eventId: string): void {
    console.log('Event clicked:', eventId);
  }

  handleTicketClick(e: MouseEvent, eventId: string): void {
    e.stopPropagation();
    console.log('Ticket click for:', eventId);
  }

  handleReminderClick(e: MouseEvent, eventId: string): void {
    e.stopPropagation();
    console.log('Reminder set for:', eventId);
  }
}
