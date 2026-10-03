import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface CallUpTakeoverData {
  artistName: string;
  title: string;
  genre?: string;
  plays: number;
  likeCount: number;
}

/**
 * Call-Up moment: full-screen takeover celebrating a talent collaboration.
 * Opened by the admin curated feed on successful POST /:id/call-up.
 * Skippable (backdrop/Esc/Continue), reduced-motion safe, 44px actions.
 * Share card: native share + copyable announcement (track permalinks pending).
 */
@Component({
  selector: 'async-call-up-takeover',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="takeover" role="alertdialog" aria-labelledby="callup-title" aria-describedby="callup-sub">
      <div class="glow" aria-hidden="true"></div>
      <div class="card">
        <div class="rosette" aria-hidden="true"><mat-icon>emoji_events</mat-icon></div>
        <p class="eyebrow">Called Up · Next Global Star</p>
        <h2 id="callup-title" class="artist">{{ data.artistName }}</h2>
        <p id="callup-sub" class="track">“{{ data.title }}”<span *ngIf="data.genre"> · {{ data.genre }}</span></p>
        <p class="stats">{{ data.plays }} plays · {{ data.likeCount }} likes earned this moment</p>
        <div class="actions">
          <button mat-flat-button class="rose-btn" (click)="share()">
            <mat-icon>share</mat-icon><span>Share the moment</span>
          </button>
          <button mat-stroked-button class="ghost-btn" (click)="copyAnnouncement()">
            <mat-icon>content_copy</mat-icon><span>Copy announcement</span>
          </button>
          <button mat-button class="continue-btn" (click)="close()">Continue curating</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .takeover {
      position: relative; overflow: hidden; text-align: center;
      padding: var(--dt-space-12) var(--dt-space-6);
      background: radial-gradient(120% 90% at 50% 0%, rgba(225, 29, 72, 0.22) 0%, #131316 60%);
      border-radius: var(--dt-radius-sheet);
      animation: rise var(--dt-t-hero) var(--dt-ease-spring, cubic-bezier(0.34, 1.4, 0.64, 1));
    }
    .glow {
      position: absolute; inset: -40%; pointer-events: none;
      background: conic-gradient(from 0deg, transparent 0deg, rgba(251, 113, 133, 0.14) 40deg, transparent 80deg,
        transparent 180deg, rgba(190, 18, 60, 0.14) 220deg, transparent 260deg);
      animation: spin 9s linear infinite;
    }
    .card { position: relative; display: grid; gap: var(--dt-space-3); justify-items: center; }
    .rosette {
      width: 88px; height: 88px; border-radius: 50%; display: grid; place-items: center;
      background: var(--dt-gradient); box-shadow: var(--dt-glow);
      border: 2px solid rgba(255, 255, 255, 0.25);
      animation: pop var(--dt-t-hero) var(--dt-ease-spring, cubic-bezier(0.34, 1.4, 0.64, 1));
    }
    .rosette mat-icon { font-size: 44px; width: 44px; height: 44px; color: #fff; }
    .eyebrow {
      margin: 0; font: var(--dt-caption); letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--dt-accent-3); font-weight: 700;
    }
    .artist { margin: 0; font: var(--dt-display); letter-spacing: var(--dt-letter-display); color: var(--dt-text-1); }
    .track { margin: 0; font: var(--dt-title-sm); color: var(--dt-text-2); }
    .stats { margin: 0; font: var(--dt-caption); letter-spacing: var(--dt-letter-caption); color: var(--dt-text-3); }
    .actions { display: grid; gap: var(--dt-space-2); width: 100%; max-width: 340px; margin-top: var(--dt-space-2); }
    .rose-btn, .ghost-btn { min-height: var(--dt-target); border-radius: var(--dt-radius-pill); }
    .ghost-btn { color: var(--dt-text-1); border-color: var(--dt-line-strong); }
    .continue-btn { color: var(--dt-text-2); min-height: var(--dt-target); }
    @keyframes rise { from { opacity: 0; transform: translateY(26px) scale(0.97); } to { opacity: 1; transform: none; } }
    @keyframes pop { 0% { opacity: 0; transform: scale(0.6); } 60% { transform: scale(1.06); } 100% { opacity: 1; transform: scale(1); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) {
      .takeover, .rosette, .glow { animation: none !important; }
    }
  `]
})
export class CallUpTakeoverComponent {
  private readonly dialogRef = inject(MatDialogRef<CallUpTakeoverComponent>);
  private readonly snackBar = inject(MatSnackBar);

  constructor(@Inject(MAT_DIALOG_DATA) public data: CallUpTakeoverData) {}

  close(): void {
    this.dialogRef.close();
  }

  share(): void {
    const title = `${this.data.artistName} just got Called Up on DavidoTV`;
    const text = `“${this.data.title}” by ${this.data.artistName} — Next Global Star.`;
    const url = window.location.origin + '/talent';
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${title} — ${text} ${url}`);
      this.snackBar.open('Announcement copied to clipboard.', 'Close', { duration: 2000 });
    }
  }

  copyAnnouncement(): void {
    const msg =
      `${this.data.artistName} just got Called Up on DavidoTV for “${this.data.title}” ` +
      `(${this.data.plays} plays, ${this.data.likeCount} likes). ${window.location.origin}/talent`;
    navigator.clipboard.writeText(msg);
    this.snackBar.open('Announcement copied to clipboard.', 'Close', { duration: 2000 });
  }
}
