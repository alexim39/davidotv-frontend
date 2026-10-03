import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Mandatory error state (icon + message + requestId + retry) for every list.
 * Spec: docs/design/06-components-and-tokens.md + 08-implementation-and-acceptance.md.
 * Usage: <async-error-state [message]="..." [requestId]="..." actionLabel="Try again"
 *          (retry)="load()" /> — render only when loaded && failed.
 */
@Component({
  selector: 'async-error-state',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="error-state" role="alert">
      <div class="error-icon" aria-hidden="true"><mat-icon>cloud_off</mat-icon></div>
      <h2 class="error-title">{{ title }}</h2>
      <p class="error-message">{{ message }}</p>
      <p *ngIf="requestId" class="error-id">Reference: {{ requestId }}</p>
      <button mat-stroked-button class="error-cta" (click)="retry.emit()">{{ actionLabel }}</button>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .error-state {
      display: flex; flex-direction: column; align-items: center; text-align: center;
      padding: var(--dt-space-12) var(--dt-space-6); gap: var(--dt-space-2);
    }
    .error-icon {
      width: 64px; height: 64px; border-radius: 50%;
      display: grid; place-items: center;
      background: rgba(248, 113, 113, 0.12);
      border: 1px solid var(--dt-line);
      margin-bottom: var(--dt-space-2);
    }
    .error-icon mat-icon { color: var(--dt-danger); font-size: 28px; width: 28px; height: 28px; }
    .error-title { margin: 0; font: var(--dt-title-sm); color: var(--dt-text-1); }
    .error-message { margin: 0; font: var(--dt-body); color: var(--dt-text-2); max-width: 42ch; }
    .error-id { margin: 0; font: var(--dt-caption); letter-spacing: var(--dt-letter-caption); color: var(--dt-text-3); }
    .error-cta { min-height: var(--dt-target); border-radius: var(--dt-radius-pill); color: var(--dt-text-1); border-color: var(--dt-line-strong); }
  `]
})
export class ErrorStateComponent {
  @Input() title = 'Something went wrong';
  @Input() message = 'We could not load this right now. Check your connection and try again.';
  @Input() requestId = '';
  @Input() actionLabel = 'Try again';
  @Output() retry = new EventEmitter<void>();
}
