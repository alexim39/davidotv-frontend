import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AdminService } from './admin.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

/**
 * Admin console seed: membership counts + video paywall toggle.
 * Deliberately narrow — user/order/event admin arrives with those epics.
 */
@Component({
  selector: 'async-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatIconModule, MatSlideToggleModule, SkeletonLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="admin obsidian-bg">
      <div class="head glass-surface">
        <h2 class="title">Admin console</h2>
        <p class="sub">Membership health + members-only video flags.</p>
      </div>

      @if (loading() && !overview()) { <async-skeleton-loader [count]="2"/> }
      @else {
        @if (overview(); as o) {
          <div class="stats">
            <div class="stat glass-surface">
              <mat-icon>verified</mat-icon>
              <span class="num">{{o.active}}</span>
              <span class="lbl">Active memberships</span>
            </div>
            <div class="stat glass-surface">
              <mat-icon>hourglass_top</mat-icon>
              <span class="num">{{o.pending}}</span>
              <span class="lbl">Pending checkouts</span>
            </div>
          </div>
        }
      }

      <div class="card glass-surface">
        <h3 class="sec">Video paywall</h3>
        <p class="hint">Paste a YouTube video ID (or Mongo _id) to flip its members-only flag. Takes effect immediately.</p>
        <form [formGroup]="form" (ngSubmit)="apply()" class="form">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Video ID</mat-label>
            <input matInput formControlName="videoId" placeholder="dQw4w9WgXcQ"/>
          </mat-form-field>
          <mat-slide-toggle formControlName="exclusive">Members-only</mat-slide-toggle>
          <button mat-flat-button class="rose-btn" type="submit" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Saving…' : 'Apply' }}
          </button>
        </form>
        @if (message()) { <p class="ok">{{message()}}</p> }
        @if (error()) { <p class="err">{{error()}}</p> }
      </div>
    </section>
  `,
  styles: [`
    .admin{ padding:24px; background:#0B0B0C; min-height:70vh; display:grid; gap:16px; align-content:start; }
    .head{ padding:18px; border-radius:20px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10); backdrop-filter:blur(16px); }
    .title{ margin:0; color:#F8F7F8; font-size:20px; font-weight:800; }
    .sub{ margin:6px 0 0; color:#A1A1AA; font-size:12px; }
    .stats{ display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px; }
    .stat{ padding:18px; border-radius:20px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); display:grid; gap:4px; color:#F8F7F8; }
    .stat mat-icon{ color:#FB7185; }
    .num{ font-size:28px; font-weight:800; }
    .lbl{ color:#A1A1AA; font-size:12px; }
    .card{ padding:20px; border-radius:20px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); max-width:560px; display:grid; gap:12px; color:#F8F7F8; }
    .sec{ margin:0; font-size:14px; font-weight:700; }
    .hint{ margin:0; color:#A1A1AA; font-size:12px; }
    .form{ display:grid; gap:12px; }
    .full{ width:100%; }
    .rose-btn{ background:linear-gradient(135deg,#BE123C,#FB7185); color:white; border-radius:999px; }
    .ok{ color:#4ADE80; font-size:13px; margin:0; }
    .err{ color:#FB7185; font-size:13px; margin:0; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly fb = inject(FormBuilder);
  overview = this.admin.overview;
  loading = this.admin.loading;
  saving = signal(false);
  message = signal<string | null>(null);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    videoId: ['', Validators.required],
    exclusive: [false],
  });

  ngOnInit(): void {
    this.admin.fetchOverview().subscribe();
  }

  apply(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.message.set(null);
    this.error.set(null);
    const { videoId, exclusive } = this.form.getRawValue();
    this.admin.setExclusive(videoId.trim(), exclusive).subscribe({
      next: (res: any) => {
        this.saving.set(false);
        this.message.set(`Video ${res.youtubeVideoId ?? videoId} is now ${res.isExclusive ? 'members-only' : 'public'}.`);
      },
      error: (e) => { this.saving.set(false); this.error.set(e?.message ?? 'Update failed'); },
    });
  }
}
