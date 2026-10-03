import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * 403 state: shown when the backend refuses an action (role/owner checks).
 * Reached via the error interceptor carrying the backend message + requestId.
 */
@Component({
  selector: 'async-forbidden',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="wrap obsidian-bg">
      <div class="glass-surface card">
        <mat-icon class="icon">lock</mat-icon>
        <h1>Not allowed</h1>
        <p>You don't have permission for that. If you think this is a mistake, contact support with the request ID from the error toast.</p>
        <a mat-flat-button class="rose-btn" routerLink="/">Back home</a>
      </div>
    </div>
  `,
  styles: [`
    .wrap { min-height: 70vh; display: grid; place-items: center; padding: 24px; background: #0B0B0C; }
    .card { text-align: center; padding: 40px 32px; border-radius: var(--dt-radius-sheet); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); backdrop-filter: blur(var(--dt-radius-card)); max-width: 420px; }
    .icon { font-size: 40px; width: 40px; height: 40px; color: #FB7185; }
    h1 { margin: 12px 0 4px; font-size: 24px; font-weight: 800; color: #F8F7F8; }
    p { color: #A1A1AA; font-size: 14px; margin: 0 0 20px; }
    .rose-btn { background: linear-gradient(135deg,#BE123C,#FB7185); color: white; border-radius: var(--dt-radius-pill); }
  `]
})
export class ForbiddenComponent {}
