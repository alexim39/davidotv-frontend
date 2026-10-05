import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { Event } from './event.model';
import { EventService } from './event.service';
import { UserInterface, UserService } from '../common/services/user.service';
import { SkeletonLoaderComponent } from '../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../shared/components/error-state/error-state.component';

/**
 * Deep-linkable event detail (/events/:id). Shareable, SEO-titled, mobile-first.
 * No single-event endpoint exists, so it resolves the id from getAllEvents()
 * (list is small). Ticket CTA groundwork: externalLink -> Get Tickets anchor;
 * otherwise interest flow (mirrors events-list); past/cancelled -> disabled.
 * Times render in the viewer's locale (legacy dialog/list force UTC).
 */
@Component({
  selector: 'app-event-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    SkeletonLoaderComponent,
    ErrorStateComponent,
  ],
  template: `
    <div class="detail-page">
      <button mat-button class="back-link" routerLink="/events" aria-label="Back to all events">
        <mat-icon>arrow_back</mat-icon><span>All events</span>
      </button>

      <async-skeleton-loader *ngIf="loading" [count]="3" />

      <async-error-state
        *ngIf="!loading && loadError"
        [message]="loadError"
        (retry)="load()" />

      <async-error-state
        *ngIf="!loading && !loadError && !event"
        title="Event not found"
        message="This event may have ended or the link is stale."
        actionLabel="Browse events"
        (retry)="goBack()" />

      <article *ngIf="!loading && !loadError && event" class="detail-card">
        <div class="hero">
          <img [src]="event.imageUrl || '/img/event-banner.png'"
               [alt]="event.title + ' event banner'" fetchpriority="high" />
          <span *ngIf="event.badge" class="badge">{{ event.badge.text }}</span>
        </div>

        <div class="body">
          <h1>{{ event.title }}</h1>

          <dl class="meta">
            <div class="meta-item">
              <dt><mat-icon aria-hidden="true">event</mat-icon>Date</dt>
              <dd>{{ getDateString(event.date) }}</dd>
            </div>
            <div class="meta-item">
              <dt><mat-icon aria-hidden="true">schedule</mat-icon>Time</dt>
              <dd>{{ getTimeString(event.date) }} local</dd>
            </div>
            <div class="meta-item">
              <dt><mat-icon aria-hidden="true">location_on</mat-icon>Location</dt>
              <dd>{{ event.location }}</dd>
            </div>
            <div class="meta-item">
              <dt><mat-icon aria-hidden="true">people</mat-icon>Going</dt>
              <dd>{{ event.interestedUsers?.length || 0 }} fans interested</dd>
            </div>
          </dl>

          <p *ngIf="event.description" class="description">{{ event.description }}</p>

          <div class="cta-row">
            <a *ngIf="event.externalLink; else interestBlock"
               mat-flat-button class="rose-btn ticket-cta"
               [href]="event.externalLink" target="_blank" rel="noopener">
              <mat-icon>confirmation_number</mat-icon><span>Get Tickets</span>
            </a>
            <ng-template #interestBlock>
              <button mat-flat-button class="rose-btn ticket-cta"
                      *ngIf="!isPastEvent() && !event.isCancelled"
                      (click)="markInterest()" [disabled]="markingInterest">
                <mat-icon>how_to_reg</mat-icon>
                <span>{{ markingInterest ? 'Saving…' : (hasShownInterest() ? 'Interest shown ✓' : 'Show Interest') }}</span>
              </button>
              <button mat-flat-button class="ticket-cta" disabled
                      *ngIf="isPastEvent() || event.isCancelled">
                <span>{{ event.isCancelled ? 'Event cancelled' : 'Event ended' }}</span>
              </button>
            </ng-template>
            <button mat-stroked-button class="share-cta" (click)="shareEvent()" aria-label="Share event">
              <mat-icon>share</mat-icon><span>Share</span>
            </button>
            <button mat-stroked-button class="share-cta" (click)="addToCalendar()" aria-label="Add event to calendar">
              <mat-icon>event</mat-icon><span>Calendar</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  `,
  styles: [`
    .detail-page { max-width: 860px; margin: 0 auto; padding: var(--dt-gutter); display: grid; gap: var(--dt-space-4); }
    .back-link { justify-self: start; color: var(--dt-text-2); min-height: var(--dt-target); }
    .detail-card {
      background: var(--dt-card); border: 1px solid var(--dt-line);
      border-radius: var(--dt-radius-card); overflow: hidden; box-shadow: var(--dt-e2);
    }
    .hero { position: relative; aspect-ratio: 16 / 9; background: var(--dt-sunken); }
    .hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .badge {
      position: absolute; top: var(--dt-space-3); left: var(--dt-space-3);
      background: var(--dt-gradient); color: #fff;
      font: var(--dt-caption); letter-spacing: var(--dt-letter-caption);
      padding: 6px 12px; border-radius: var(--dt-radius-pill);
    }
    .body { padding: var(--dt-space-6); display: grid; gap: var(--dt-space-4); }
    .body h1 { margin: 0; font: var(--dt-headline); color: var(--dt-text-1); }
    .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: var(--dt-space-3); margin: 0; }
    .meta-item dt {
      display: flex; align-items: center; gap: 6px;
      font: var(--dt-caption); letter-spacing: var(--dt-letter-caption); color: var(--dt-text-3);
      margin-bottom: 2px;
    }
    .meta-item dt mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--dt-accent-3); }
    .meta-item dd { margin: 0; font: var(--dt-body); color: var(--dt-text-1); }
    .description { margin: 0; font: var(--dt-body-lg); color: var(--dt-text-2); line-height: 1.6; }
    .cta-row { display: flex; flex-wrap: wrap; gap: var(--dt-space-3); }
    .ticket-cta, .share-cta { min-height: var(--dt-target); border-radius: var(--dt-radius-pill); }
    .share-cta { color: var(--dt-text-1); border-color: var(--dt-line-strong); }
    @media (max-width: 600px) {
      .body { padding: var(--dt-space-4); }
      .ticket-cta { flex: 1; }
    }
  `]
})
export class EventDetailPageComponent implements OnInit, OnDestroy {
  event: Event | null = null;
  loading = true;
  loadError: string | null = null;
  markingInterest = false;
  currentUser: UserInterface | null = null;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly documentTitle = inject(Title);
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly subs: Subscription[] = [];

  ngOnInit(): void {
    this.subs.push(
      this.userService.getCurrentUser$.subscribe({ next: (u) => (this.currentUser = u) })
    );
    this.load();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loading = true;
    this.loadError = null;
    this.event = null;
    this.subs.push(
      this.eventService.getAllEvents().subscribe({
        next: (response) => {
          const list: Event[] = response?.data || response || [];
          this.event = list.find((e) => e?._id === id || (e as unknown as { id: string })?.id === id) || null;
          if (this.event?.title) this.documentTitle.setTitle(`${this.event.title} — DavidoTV`);
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.loadError =
            err?.error?.message || err?.message || 'We could not load this event. Check your connection and try again.';
        },
      })
    );
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  isPastEvent(): boolean {
    return !!this.event && new Date(this.event.date) < new Date();
  }

  hasShownInterest(): boolean {
    if (!this.event?.interestedUsers || !this.currentUser?._id) return false;
    return this.event.interestedUsers.some((i) => i?.user?._id === this.currentUser?._id);
  }

  markInterest(): void {
    if (!this.event) return;
    if (!this.currentUser) {
      this.snackBar.open('You need to sign in to mark reminder.', 'Close', { duration: 3000 });
      return;
    }
    this.markingInterest = true;
    this.subs.push(
      this.eventService.markInterest({ eventId: this.event._id, userId: this.currentUser._id }).subscribe({
        next: (response) => {
          this.markingInterest = false;
          this.snackBar.open(response?.message || 'Interest saved.', 'Close', { duration: 3000 });
          this.load();
        },
        error: (error) => {
          this.markingInterest = false;
          const msg = error?.error?.message || error?.message || 'Server error occurred, please try again.';
          this.snackBar.open(msg, 'Close', { duration: 3000 });
        },
      })
    );
  }

  shareEvent(): void {
    const url = window.location.href;
    const title = this.event?.title || 'DavidoTV event';
    if (navigator.share) {
      navigator.share({ title, text: title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      this.snackBar.open('Event link copied to clipboard.', 'Close', { duration: 2000 });
    }
  }

  /** Client-side .ics download (no backend): opens the native calendar import. */
  addToCalendar(): void {
    if (!this.event) return;
    const start = new Date(this.event.date);
    if (isNaN(start.getTime())) {
      this.snackBar.open('Event date is not set yet.', 'Close', { duration: 2000 });
      return;
    }
    const end = new Date(start.getTime() + 3 * 3600000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DavidoTV//Events//EN', 'BEGIN:VEVENT',
      `UID:${this.event._id}@davidotv`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
      `SUMMARY:${esc(this.event.title)}`,
      `LOCATION:${esc(this.event.location || '')}`,
      `DESCRIPTION:${esc(this.event.description || '')}`,
      `URL:${window.location.href}`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.event.title.replace(/[^\w\- ]+/g, '').trim() || 'davidotv-event'}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    this.snackBar.open('Calendar file downloaded.', 'Close', { duration: 2000 });
  }

  getDateString(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getTimeString(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
}
