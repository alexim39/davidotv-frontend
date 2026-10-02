import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Offline indicator: slim obsidian banner under the navbar whenever the
 * browser reports offline. Purely additive — no routing or data changes.
 * Zoneless: signal + native listeners, cleaned up on destroy.
 */
@Component({
  selector: 'async-offline-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    @if (!online()) {
      <div class="offline-bar" role="alert">
        <mat-icon>wifi_off</mat-icon>
        <span>You're offline — new posts, likes and uploads will fail until you reconnect.</span>
      </div>
    }
  `,
  styles: [`
    .offline-bar {
      display: flex; gap: 8px; align-items: center; justify-content: center;
      padding: 8px 16px; font-size: 13px; font-weight: 600;
      background: linear-gradient(90deg, #7C2D12, #BE123C);
      color: #FFF7ED; text-align: center;
    }
    .offline-bar mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `]
})
export class OfflineBannerComponent implements OnInit, OnDestroy {
  readonly online = signal<boolean>(typeof navigator === 'undefined' ? true : navigator.onLine);

  private readonly onOnline = () => this.online.set(true);
  private readonly onOffline = () => this.online.set(false);

  ngOnInit(): void {
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }
}
