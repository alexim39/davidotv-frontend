import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  mutedTypes: string[];
}

export const NOTIFICATION_TYPES = ['CALL_UP', 'LIKE', 'COMMENT', 'FOLLOW', 'SYSTEM'] as const;

/**
 * NOT-01 FE: channel/type preferences. In-app bell has no toggle by design
 * (backend always delivers it).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);
  private static readonly BASE = 'api/v1/notifications';

  readonly preferences = signal<NotificationPreferences | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);

  fetchPreferences(): Observable<{ data: NotificationPreferences }> {
    this.loading.set(true);
    return this.api.get<{ success: boolean; data: NotificationPreferences }>(
      `${NotificationService.BASE}/preferences`
    ).pipe(
      tap({
        next: (res) => { this.preferences.set(res.data); this.loading.set(false); },
        error: () => this.loading.set(false),
      })
    );
  }

  savePreferences(patch: Partial<NotificationPreferences>): Observable<{ data: NotificationPreferences }> {
    this.saving.set(true);
    return this.api.put<{ success: boolean; data: NotificationPreferences }>(
      `${NotificationService.BASE}/preferences`, patch
    ).pipe(
      tap({
        next: (res) => { this.preferences.set(res.data); this.saving.set(false); },
        error: () => this.saving.set(false),
      })
    );
  }
}
