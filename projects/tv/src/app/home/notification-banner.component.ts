import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * @title Application top notification banner
 * @description World-class notification banner with dismissible option, smooth animations, and responsive design
 */
@Component({
  selector: 'async-notification-banner',
  standalone: true,
  imports: [RouterModule, CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div *ngIf="!isDismissed" class="notification-banner" [ngClass]="{'banner-visible': isVisible}">
      <div class="banner-content">
        <div class="message-container">
          <mat-icon class="info-icon">info</mat-icon>
          <p class="banner-text">
            <span class="highlight-text">Limited Time Offer:</span> Get started with 
            <a mat-button routerLink="plans" routerLinkActive="active" 
               [routerLinkActiveOptions]="{ exact: true }" 
               (click)="scrollToTop()" class="cta-link">
              EliteSpace (₦50,000)
            </a> 
            and receive a free branded cap or 
            <a mat-button routerLink="plans" routerLinkActive="active" 
               [routerLinkActiveOptions]="{ exact: true }" 
               (click)="scrollToTop()" class="cta-link">
              EmpireSpace (₦100,000)
            </a> 
            and get a free branded clothing. Offer valid while supplies last.
          </p>
        </div>
        <button mat-icon-button class="close-button" (click)="dismissBanner()" aria-label="Close notification">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
// ...existing code...
  styles: [`
    .notification-banner {
      background: linear-gradient(135deg, #8f0045 0%, #282828 100%);
      color: #ffffff;
      padding: 12px 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-height: 0;
      opacity: 0;
      transition: max-height 0.4s cubic-bezier(.4,0,.2,1), opacity 0.3s ease;
      overflow: hidden;
      position: relative;
      z-index: 10;
      animation: pulse 2s infinite;
    }

    .banner-visible {
      max-height: 500px; /* Large enough for mobile wrapping */
      opacity: 1;
    }

    .notification-banner:hover {
      animation: none;
    }

    .banner-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      width: 100%;
    }

    .message-container {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .info-icon {
      color:rgb(232, 42, 13);
      flex-shrink: 0;
    }

    .banner-text {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.9);
    }

    .highlight-text {
      font-weight: 600;
      color: #ffffff;
      background: rgba(191, 64, 44, 0.2);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .cta-link {
      color: #e0aaff !important;
      font-weight: 600;
      text-decoration: none !important;
      transition: all 0.2s ease;
      padding: 0 4px;
      border-radius: 4px;
      margin: 0 2px;
    }

    .cta-link:hover {
      color: #ffffff !important;
      background: rgba(224, 170, 255, 0.1);
      text-decoration: underline !important;
    }

    .cta-link:focus {
      outline: 2px solid #e0aaff;
      outline-offset: 2px;
    }

    .close-button {
      color: rgba(255, 255, 255, 0.7) !important;
      transition: all 0.2s ease;
      margin-left: 16px;
    }

    .close-button:hover {
      color: #ffffff !important;
      background: rgba(255, 255, 255, 0.1);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .notification-banner {
        padding: 8px 0;
      }
      .banner-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 0 10px;
      }
      .message-container {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .banner-text {
        font-size: 13px;
      }
      .close-button {
        align-self: flex-end;
        margin-top: -8px;
        margin-right: -8px;
      }
    }

    /* Animation for attention */
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(123, 44, 191, 0.4); }
      70% { box-shadow: 0 0 0 6px rgba(123, 44, 191, 0); }
      100% { box-shadow: 0 0 0 0 rgba(123, 44, 191, 0); }
    }
  `]
// ...existing code...
})
export class NotificationBannerComponent {
  isDismissed = false;
  isVisible = false;

  ngOnInit() {
    // Check localStorage for dismissed state
    const dismissed = localStorage.getItem('notificationDismissed');
    this.isDismissed = dismissed === 'true';
    
    // Show with slight delay for better page load experience
    setTimeout(() => {
      this.isVisible = true;
    }, 300);
  }

  // scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // dismiss banner
  dismissBanner() {
    this.isVisible = false;
    setTimeout(() => {
      this.isDismissed = true;
      localStorage.setItem('notificationDismissed', 'true');
    }, 300); // Match the CSS transition duration
  }
}