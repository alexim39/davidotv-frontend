import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MembershipService } from './membership.service';

/**
 * Paystack return landing: ?reference= → verify + activate (idempotent).
 */
@Component({
  selector: 'async-membership-verify',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap obsidian-bg">
      <div class="glass-surface card">
        @if (state() === 'checking') {
          <p class="msg">Confirming your payment…</p>
        } @else if (state() === 'active') {
          <mat-icon class="ok">verified</mat-icon>
          <h2>Welcome to Premium ✨</h2>
          <p class="msg">Your {{tier()}} benefits are live. Enjoy early access and exclusive drops.</p>
          <a mat-flat-button class="rose-btn" routerLink="/">Start exploring</a>
        } @else {
          <mat-icon class="bad">error_outline</mat-icon>
          <h2>Payment not confirmed</h2>
          <p class="msg">{{error()}}</p>
          <a mat-flat-button class="rose-btn" routerLink="/membership">Try again</a>
        }
      </div>
    </div>
  `,
  styles: [`
    .wrap{ min-height:70vh; display:grid; place-items:center; padding:24px; background:#0B0B0C; }
    .card{ text-align:center; padding:32px; border-radius:var(--dt-radius-sheet); background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10); backdrop-filter:blur(var(--dt-radius-card)); max-width:420px; }
    .ok{ color:#4ADE80; font-size:40px; width:40px; height:40px; }
    .bad{ color:#FB7185; font-size:40px; width:40px; height:40px; }
    h2{ margin:12px 0 4px; color:#F8F7F8; font-size:20px; font-weight:800; }
    .msg{ color:#A1A1AA; font-size:13px; }
    .rose-btn{ background:linear-gradient(135deg,#BE123C,#FB7185); color:white; border-radius:var(--dt-radius-pill); }
  `]
})
export class MembershipVerifyComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly membership = inject(MembershipService);
  state = signal<'checking' | 'active' | 'failed'>('checking');
  tier = signal('');
  error = signal('Something went wrong.');

  ngOnInit(): void {
    const ref = this.route.snapshot.queryParamMap.get('reference') ?? '';
    if (!ref) { this.state.set('failed'); return; }
    this.membership.verify(ref).subscribe({
      next: (res: any) => {
        this.tier.set(res?.data?.tier ?? '');
        this.state.set('active');
      },
      error: (e) => { this.error.set(e?.message ?? 'Something went wrong.'); this.state.set('failed'); }
    });
  }
}
