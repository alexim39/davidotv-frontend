import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Dumb glassmorphism wrapper - premium card shell.
 * Accepts projected content, enforces luxury tokens.
 */
@Component({
  selector: 'async-glass-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card" [class.hoverable]="hoverable" [style.padding]="padding">
      <ng-content />
    </div>
  `,
  styles: [`
    .glass-card {
      background: rgba(255,255,255,0.06);
      backdrop-filter: blur(16px) saturate(1.2);
      -webkit-backdrop-filter: blur(16px) saturate(1.2);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.55);
      overflow: hidden;
      transition: transform 180ms cubic-bezier(0.4,0,0.2,1), box-shadow 180ms;
    }
    .hoverable:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.65);
      border-color: rgba(255,255,255,0.14);
    }
  `]
})
export class GlassCardComponent {
  @Input() hoverable = true;
  @Input() padding = '0';
}
