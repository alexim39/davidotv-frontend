import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService, NOTIFICATION_TYPES } from './notification.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

/**
 * NOT-01 UI: channel switches + per-type mutes. Saves on every change
 * (debounce unnecessary — toggles are deliberate). Bell has no toggle.
 */
@Component({
  selector: 'async-notification-preferences',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule, MatChipsModule, MatIconModule, MatButtonModule, SkeletonLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="prefs obsidian-bg">
      <div class="head glass-surface">
        <div>
          <h2 class="title">Notification preferences</h2>
          <p class="sub">Choose how DavidoTV reaches you. The in-app bell always stays on.</p>
        </div>
      </div>

      @if (loading() && !prefs()) { <async-skeleton-loader [count]="2"/> }
      @else {
        @if (prefs(); as p) {
          <div class="card glass-surface">
            <mat-slide-toggle [checked]="p.push" (change)="save({ push: $event.checked })">
              Push notifications
            </mat-slide-toggle>
            <mat-slide-toggle [checked]="p.email" (change)="save({ email: $event.checked })">
              Email notifications
            </mat-slide-toggle>

            <h3 class="sec">Mute by type</h3>
            <mat-chip-set>
              @for (t of types; track t) {
                <mat-chip
                  [highlighted]="!p.mutedTypes.includes(t)"
                  (click)="toggleType(t, p)">
                  <mat-icon matChipAvatar>{{ p.mutedTypes.includes(t) ? 'notifications_off' : 'notifications' }}</mat-icon>
                  {{ label(t) }}
                </mat-chip>
              }
            </mat-chip-set>

            @if (saving()) { <p class="hint">Saving…</p> }
            @if (savedFlash()) { <p class="ok">Saved ✓</p> }
          </div>
        }
      }
    </section>
  `,
  styles: [`
    .prefs{ padding:24px; background:#0B0B0C; min-height:70vh; display:grid; gap:16px; align-content:start; }
    .head{ padding:18px; border-radius:20px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10); backdrop-filter:blur(16px); }
    .title{ margin:0; color:#F8F7F8; font-size:20px; font-weight:800; }
    .sub{ margin:6px 0 0; color:#A1A1AA; font-size:12px; }
    .card{ padding:20px; border-radius:20px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); backdrop-filter:blur(14px); display:grid; gap:14px; max-width:560px; color:#F8F7F8; }
    .sec{ margin:4px 0 0; font-size:13px; font-weight:700; color:#A1A1AA; text-transform:uppercase; letter-spacing:0.06em; }
    .hint{ color:#71717A; font-size:12px; margin:0; }
    .ok{ color:#4ADE80; font-size:12px; margin:0; }
  `]
})
export class NotificationPreferencesComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  prefs = this.notifications.preferences;
  loading = this.notifications.loading;
  saving = this.notifications.saving;
  savedFlash = signal(false);

  readonly types = [...NOTIFICATION_TYPES];
  private flashTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.notifications.fetchPreferences().subscribe();
  }

  label(t: string): string {
    return { CALL_UP: 'Call-Ups', LIKE: 'Likes', COMMENT: 'Comments', FOLLOW: 'Follows', SYSTEM: 'System' }[t] ?? t;
  }

  save(patch: Partial<{ push: boolean; email: boolean }>): void {
    this.savedFlash.set(false);
    this.notifications.savePreferences(patch).subscribe({
      next: () => this.flash(),
      error: () => undefined,
    });
  }

  toggleType(t: string, p: { mutedTypes: string[] }): void {
    const muted = p.mutedTypes.includes(t)
      ? p.mutedTypes.filter((x) => x !== t)
      : [...p.mutedTypes, t];
    this.savedFlash.set(false);
    this.notifications.savePreferences({ mutedTypes: muted }).subscribe({
      next: () => this.flash(),
      error: () => undefined,
    });
  }

  private flash(): void {
    this.savedFlash.set(true);
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => this.savedFlash.set(false), 2000);
  }
}
