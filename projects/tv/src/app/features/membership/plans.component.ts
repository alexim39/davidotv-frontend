import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MembershipService, MembershipPlan } from './membership.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../common/component/confirmationDialog.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

/**
 * Public plan catalog. Paid tiers redirect to Paystack; free tier needs no
 * action. Prices are student-friendly by design (see plans.js).
 */
@Component({
  selector: 'async-membership-plans',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, SkeletonLoaderComponent, EmptyStateComponent, ErrorStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="plans obsidian-bg">
      <div class="head">
        <h2 class="title">Go Premium — from ₦300</h2>
        <p class="sub">Pay-as-you-go. No commitment, no stored cards. Cancel anytime, benefits run to period end.</p>
      </div>
      @if (loading()) { <async-skeleton-loader [count]="3"/> }
      @else if (loadError()) {
        <async-error-state [message]="loadError()!" (retry)="reload()" />
      }
      @else if (plans().length === 0) {
        <async-empty-state
          icon="diamond"
          title="Plans unavailable"
          message="Membership plans are being updated. Check back soon."
          actionLabel="Back home"
          (actionClicked)="goHome()" />
      }
      @else {
        @if (activeTier(); as t) {
          <div class="current-plan" role="status">
            <mat-icon>verified</mat-icon>
            <div>
              <strong>You're on {{ t }}</strong>
              @if (periodEnd(); as end) {
                <span> — benefits run to {{ end | date:'mediumDate' }}</span>
              }
            </div>
            <button mat-stroked-button class="cancel-btn" (click)="cancel()"
                    [disabled]="cancelling()">
              {{ cancelling() ? 'Cancelling…' : 'Cancel plan' }}
            </button>
          </div>
        }
        <div class="grid">
          @for (p of plans(); track p.id) {
            <div class="plan-card glass-surface" [class.free]="p.id==='free'">
              <h3 class="p-name">{{p.name}}</h3>
              <p class="p-price">{{ p.priceNgn === 0 ? 'Free' : '₦' + p.priceNgn }}</p>
              <p class="p-tag">{{p.tagline}}</p>
              @if (p.days > 0) {
                <p class="p-days"><mat-icon>schedule</mat-icon> {{ p.days }} days access</p>
              }
              <ul class="benefits">
                @for (b of benefits(p); track b) {
                  <li><mat-icon>check_circle</mat-icon><span>{{ b }}</span></li>
                }
              </ul>
              <button mat-flat-button class="rose-btn" [disabled]="p.id==='free' || busy()" (click)="subscribe(p)">
                {{ p.id==='free' ? 'Current plan' : (busy() ? 'Starting…' : 'Choose ' + p.name) }}
              </button>
            </div>
          }
        </div>
        @if (error()) { <p class="err" role="alert">{{error()}}</p> }
      }
    </section>
  `,
  styles: [`
    .plans{ padding:24px; background:#0B0B0C; min-height:70vh; }
    .head{ margin-bottom:18px; }
    .title{ margin:0; color:#F8F7F8; font-size:22px; font-weight:800; }
    .sub{ margin:6px 0 0; color:#A1A1AA; font-size:13px; }
    .grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:16px; }
    .plan-card{ padding:20px; border-radius:var(--dt-radius-sheet); background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); backdrop-filter:blur(14px); display:grid; gap:8px; align-content:start; }
    .p-name{ margin:0; color:#F8F7F8; font-size:16px; font-weight:700; }
    .p-price{ margin:0; font-size:24px; font-weight:800; background:linear-gradient(135deg,#BE123C,#FB7185); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
    .p-tag{ margin:0; color:#A1A1AA; font-size:12px; min-height:32px; }
    .p-days{ margin:0; color:#A1A1AA; font-size:12px; display:flex; gap:6px; align-items:center; }
    .p-days mat-icon{ font-size:16px; width:16px; height:16px; color:#FB7185; }
    .benefits{ list-style:none; margin:4px 0 8px; padding:12px 0 0; border-top:1px solid rgba(255,255,255,0.08); display:grid; gap:8px; }
    .benefits li{ display:flex; gap:8px; align-items:flex-start; color:#F8F7F8; font-size:13px; }
    .benefits mat-icon{ font-size:16px; width:16px; height:16px; color:#4ADE80; flex-shrink:0; margin-top:1px; }
    .rose-btn{ background:linear-gradient(135deg,#BE123C,#E11D48 50%,#FB7185); color:white; border-radius:var(--dt-radius-pill); }
    .current-plan{
      display:flex; gap:12px; align-items:center; flex-wrap:wrap;
      padding:16px 18px; margin-bottom:16px;
      border-radius:var(--dt-radius-card); background:rgba(74,222,128,0.08);
      border:1px solid rgba(74,222,128,0.28); color:var(--dt-text-1); font-size:14px;
    }
    .current-plan > mat-icon{ color:var(--dt-success); }
    .current-plan span{ color:var(--dt-text-2); }
    .cancel-btn{ margin-left:auto; min-height:var(--dt-target); border-radius:var(--dt-radius-pill); color:var(--dt-danger); border-color:rgba(248,113,113,0.4); }
    .err{ color:#FB7185; font-size:12px; margin:0; }
  `]
})
export class MembershipPlansComponent implements OnInit {
  private readonly membership = inject(MembershipService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  plans = this.membership.plans;
  loading = this.membership.loading;
  busy = signal(false);
  cancelling = signal(false);
  error = signal<string | null>(null);
  loadError = signal<string | null>(null);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loadError.set(null);
    this.membership.fetchPlans().subscribe({
      error: (e) => {
        this.loading.set(false);
        this.loadError.set(e?.message ?? 'We could not load plans. Check your connection and try again.');
      }
    });
    this.membership.fetchStatus().subscribe({ error: () => {} });
  }

  /** Paid tier name, or null for free/unknown (no cancel offered then). */
  activeTier(): string | null {
    const s = this.membership.status();
    return s && s.tier && s.tier !== 'free' && s.status === 'active' ? s.tier : null;
  }

  periodEnd(): string | undefined {
    return this.membership.status()?.currentPeriodEnd;
  }

  cancel(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel plan',
        message: 'Benefits run to the end of your period. You can rejoin anytime.',
        confirmText: 'Cancel plan',
        cancelText: 'Keep benefits'
      }
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.cancelling.set(true);
      this.error.set(null);
      this.membership.cancel().subscribe({
        next: () => {
          this.cancelling.set(false);
          this.reload();
        },
        error: (e) => {
          this.cancelling.set(false);
          this.error.set(e?.message ?? 'Could not cancel. Please try again.');
        }
      });
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  /** Humanized entitlement checklist (true -> included, number -> allowance, false -> hidden). */
  benefits(p: MembershipPlan): string[] {
    return Object.entries(p.entitlements ?? {})
      .filter(([, v]) => v !== false && v !== 0 && v != null)
      .map(([k, v]) => {
        const label = k.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return v === true ? label : `${label}: ${v}`;
      });
  }

  subscribe(p: MembershipPlan): void {
    this.busy.set(true);
    this.error.set(null);
    this.membership.subscribe(p.id).subscribe({
      next: (res: any) => {
        // Leave for Paystack checkout; return lands on /membership/verify.
        window.location.href = res.authorizationUrl;
      },
      error: (e) => { this.busy.set(false); this.error.set(e?.message ?? 'Could not start checkout'); }
    });
  }
}
