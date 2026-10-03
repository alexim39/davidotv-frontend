import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Mandatory empty state (icon + line + CTA) for every list.
 * Spec: docs/design/06-components-and-tokens.md + 08-implementation-and-acceptance.md.
 * Usage: <async-empty-state icon="..." title="..." message="..." actionLabel="..."
 *          (actionClicked)="..." /> — render only when loaded && items.length === 0.
 */
@Component({
  selector: 'async-empty-state',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="empty-state" role="status">
      <div class="empty-icon" aria-hidden="true"><mat-icon>{{ icon }}</mat-icon></div>
      <h2 class="empty-title">{{ title }}</h2>
      <p class="empty-message">{{ message }}</p>
      <button *ngIf="actionLabel" mat-flat-button class="rose-btn empty-cta"
              (click)="actionClicked.emit()">{{ actionLabel }}</button>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex; flex-direction: column; align-items: center; text-align: center;
      padding: var(--dt-space-12) var(--dt-space-6); gap: var(--dt-space-2);
    }
    .empty-icon {
      width: 64px; height: 64px; border-radius: 50%;
      display: grid; place-items: center;
      background: var(--dt-gradient-soft);
      border: 1px solid var(--dt-line);
      margin-bottom: var(--dt-space-2);
    }
    .empty-icon mat-icon { color: var(--dt-accent-3); font-size: 28px; width: 28px; height: 28px; }
    .empty-title { margin: 0; font: var(--dt-title-sm); color: var(--dt-text-1); }
    .empty-message { margin: 0 0 var(--dt-space-2); font: var(--dt-body); color: var(--dt-text-2); max-width: 38ch; }
    .empty-cta { min-height: var(--dt-target); border-radius: var(--dt-radius-pill); }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() message = 'Check back soon for fresh drops.';
  @Input() actionLabel = '';
  @Output() actionClicked = new EventEmitter<void>();
}
