import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

/**
 * Admin console data: membership overview + video paywall flag.
 * All endpoints are admin-gated server-side; the FE route adds adminGuard.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  readonly overview = signal<{ active: number; pending: number } | null>(null);
  readonly loading = signal(false);

  fetchOverview(): Observable<{ data: { active: number; pending: number } }> {
    this.loading.set(true);
    return this.api.get<{ success: boolean; data: { active: number; pending: number } }>(
      'api/v1/membership/overview'
    ).pipe(
      tap({
        next: (res) => { this.overview.set(res.data); this.loading.set(false); },
        error: () => this.loading.set(false),
      })
    );
  }

  setExclusive(videoId: string, isExclusive: boolean): Observable<{ youtubeVideoId: string; isExclusive: boolean }> {
    return this.api.patch(
      `api/v1/youtube/videos/${videoId}/exclusive`, { isExclusive }
    ) as any;
  }
}
