import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface ChallengeEntry {
  upload: string;
  entrant: string;
  enteredAt?: string;
}

export interface Challenge {
  _id: string;
  title: string;
  description?: string;
  hashtag?: string;
  status: 'draft' | 'active' | 'judging' | 'closed';
  startsAt: string;
  endsAt: string;
  entries: ChallengeEntry[];
  winnerUpload?: string;
}

/**
 * Fan contests. Ranking reuses talent engagement — entering links an
 * existing upload, voting happens via likes on the talent feed.
 */
@Injectable({ providedIn: 'root' })
export class ChallengeService {
  private readonly api = inject(ApiService);
  private static readonly BASE = 'api/v1/challenges';

  readonly challenges = signal<Challenge[]>([]);
  readonly loading = signal(false);

  list(status?: string): Observable<{ data: Challenge[]; total: number }> {
    this.loading.set(true);
    const q = status ? `?status=${status}` : '';
    return this.api.get<{ success: boolean; data: Challenge[]; total: number }>(
      `${ChallengeService.BASE}${q}`
    ).pipe(
      tap({
        next: (res) => { this.challenges.set(res.data); this.loading.set(false); },
        error: () => this.loading.set(false),
      })
    ) as any;
  }

  enter(challengeId: string, uploadId: string): Observable<unknown> {
    return this.api.post(`${ChallengeService.BASE}/${challengeId}/entries`, { uploadId });
  }
}
