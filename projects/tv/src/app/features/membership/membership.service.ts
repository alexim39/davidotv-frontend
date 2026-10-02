import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface MembershipPlan {
  id: string;
  name: string;
  priceNgn: number;
  days: number;
  tagline: string;
  entitlements: Record<string, boolean | number>;
}

export interface MembershipStatus {
  tier: string;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  entitlements: Record<string, boolean | number>;
}

/**
 * Membership billing (pay-as-you-go). Subscribe returns a Paystack
 * authorization URL — the browser leaves for Paystack, then returns to
 * /membership/verify?reference= for activation.
 */
@Injectable({ providedIn: 'root' })
export class MembershipService {
  private readonly api = inject(ApiService);
  private static readonly BASE = 'api/v1/membership';

  readonly plans = signal<MembershipPlan[]>([]);
  readonly status = signal<MembershipStatus | null>(null);
  readonly loading = signal(false);

  fetchPlans(): Observable<{ data: MembershipPlan[] }> {
    this.loading.set(true);
    return this.api.get<{ success: boolean; data: MembershipPlan[] }>(`${MembershipService.BASE}/plans`).pipe(
      tap(res => { this.plans.set(res.data); this.loading.set(false); })
    );
  }

  fetchStatus(): Observable<{ data: MembershipStatus }> {
    return this.api.get<{ success: boolean; data: MembershipStatus }>(`${MembershipService.BASE}/me`).pipe(
      tap(res => this.status.set(res.data))
    );
  }

  subscribe(tier: string): Observable<{ authorizationUrl: string; reference: string }> {
    return this.api.post<{ authorizationUrl: string; reference: string }>(
      `${MembershipService.BASE}/subscribe`, { tier }
    ) as any;
  }

  verify(reference: string): Observable<{ data: unknown }> {
    return this.api.get(`${MembershipService.BASE}/verify/${reference}`) as any;
  }

  cancel(): Observable<unknown> {
    return this.api.post(`${MembershipService.BASE}/cancel`, {});
  }
}
