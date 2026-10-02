import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { AuthStateService } from './auth-state.service';

/**
 * WEF-01 FE wiring: fire-and-forget fan-action tracking.
 * Posts to canonical `api/v1/analytics/events`. Skips anonymous sessions
 * (backend requires auth) and swallows failures — analytics must never break
 * UX or spam error toasts.
 */
export type AnalyticsEventType =
  | 'video_watch' | 'audio_listen' | 'livestream_attend' | 'event_view' | 'talent_view'
  | 'like' | 'comment' | 'reply' | 'share' | 'save' | 'follow'
  | 'post' | 'upload' | 'vote' | 'attend' | 'purchase' | 'benefit_use';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthStateService);

  track(type: AnalyticsEventType, refId?: string, meta?: Record<string, unknown>): void {
    if (!this.auth.isAuthenticated()) return;
    this.api.post('api/v1/analytics/events', { type, refId, meta }).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  /** Observable variant for callers that need completion (rare). */
  track$(type: AnalyticsEventType, refId?: string, meta?: Record<string, unknown>): Observable<unknown> {
    if (!this.auth.isAuthenticated()) return of(null);
    return this.api.post('api/v1/analytics/events', { type, refId, meta }).pipe(
      catchError(() => of(null))
    );
  }
}
