import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * FE-01: catch-all 404. Premium obsidian, no backend dependency.
 */
@Component({
  selector: 'async-not-found',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="nf-wrap obsidian-bg">
      <div class="glass-surface nf-card">
        <mat-icon class="nf-icon">search_off</mat-icon>
        <h1 class="nf-code">404</h1>
        <p class="nf-text">This stage is empty — the page you're looking for doesn't exist.</p>
        <a mat-flat-button class="rose-btn" routerLink="/">Back home</a>
      </div>
    </div>
  `,
  styles: [`
    .nf-wrap { min-height: 70vh; display: grid; place-items: center; padding: 24px; background: #0B0B0C; }
    .nf-card { text-align: center; padding: 40px 32px; border-radius: var(--dt-radius-sheet); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); backdrop-filter: blur(16px); max-width: 420px; }
    .nf-icon { font-size: 40px; width: 40px; height: 40px; color: #FB7185; }
    .nf-code { margin: 12px 0 4px; font-size: 40px; font-weight: 800; color: #F8F7F8; }
    .nf-text { color: #A1A1AA; font-size: 14px; margin: 0 0 20px; }
    .rose-btn { background: linear-gradient(135deg,#BE123C,#FB7185); color: white; border-radius: var(--dt-radius-pill); }
  `]
})
export class NotFoundComponent {}
