import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MembershipService, MembershipPlan } from './membership.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

/**
 * Public plan catalog. Paid tiers redirect to Paystack; free tier needs no
 * action. Prices are student-friendly by design (see plans.js).
 */
@Component({
  selector: 'async-membership-plans',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, SkeletonLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="plans obsidian-bg">
      <div class="head">
        <h2 class="title">Go Premium — from ₦300</h2>
        <p class="sub">Pay-as-you-go. No commitment, no stored cards. Cancel anytime, benefits run to period end.</p>
      </div>
      @if (loading()) { <async-skeleton-loader [count]="3"/> }
      @else {
        <div class="grid">
          @for (p of plans(); track p.id) {
            <div class="plan-card glass-surface" [class.free]="p.id==='free'">
              <h3 class="p-name">{{p.name}}</h3>
              <p class="p-price">{{ p.priceNgn === 0 ? 'Free' : '₦' + p.priceNgn }}</p>
              <p class="p-tag">{{p.tagline}}</p>
              <button mat-flat-button class="rose-btn" [disabled]="p.id==='free' || busy()" (click)="subscribe(p)">
                {{ p.id==='free' ? 'Current plan' : (busy() ? 'Starting…' : 'Choose ' + p.name) }}
              </button>
              @if (error()) { <p class="err">{{error()}}</p> }
            </div>
          }
        </div>
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
    .rose-btn{ background:linear-gradient(135deg,#BE123C,#E11D48 50%,#FB7185); color:white; border-radius:var(--dt-radius-pill); }
    .err{ color:#FB7185; font-size:12px; margin:0; }
  `]
})
export class MembershipPlansComponent implements OnInit {
  private readonly membership = inject(MembershipService);
  plans = this.membership.plans;
  loading = this.membership.loading;
  busy = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.membership.fetchPlans().subscribe({ error: () => this.loading.set(false) });
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
