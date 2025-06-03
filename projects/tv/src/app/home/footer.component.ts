import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
selector: 'async-footer',
imports: [CommonModule, MatDividerModule, MatToolbarModule, MatButtonModule, MatIconModule],
template: `
   
   
   <mat-divider></mat-divider> <mat-toolbar class="footer-toolbar">
  <div class="footer-content">
    <span class="copyright-text">
      &copy; {{ currentYear }} DavidoTV | Made by Fans for Fans 
    </span>

    <span class="spacer"></span> <div class="social-icons">
      <button mat-icon-button
              *ngFor="let link of socialLinks"
              (click)="openSocialLink(link.url)">
        <mat-icon *ngIf="!link.icon.startsWith('assets/')">{{ link.icon }}</mat-icon>
        <img *ngIf="link.icon.startsWith('assets/')" [src]="link.icon" [alt]="link.name" class="custom-social-icon">
      </button>
    </div>
  </div>
</mat-toolbar>

`,
styles: [`
    
    
    .footer-toolbar {
  height: auto; // Allow toolbar to adjust height based on content
  padding: 16px 20px; // Padding for top/bottom and left/right
  background-color: #f5f5f5; // Light gray background for the footer
  color: #555; // Default text color
  display: flex;
  align-items: center; // Vertically center content
  justify-content: center; // Horizontally center the content container

  .footer-content {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 1200px; // Constrain width for better layout on large screens
    margin: 0 auto; // Center the content within the toolbar
    flex-wrap: wrap; // Allow content to wrap on smaller screens
    justify-content: space-between; // Space out copyright and social icons
  }

  .copyright-text {
    font-size: 0.95em; // Slightly smaller font size
    white-space: nowrap; // Prevent text from wrapping prematurely
    margin-right: 20px; // Space between text and social icons when wrapped
  }

  .spacer {
    flex: 1 1 auto; // Pushes social icons to the right
  }

  .social-icons {
    display: flex;
    gap: 8px; // Space between social icons

    .mat-mdc-icon-button {
      // Ensure specific icon size if needed for better visual consistency
      width: 40px;
      height: 40px;
      line-height: 40px;
      font-size: 24px; // Size for Material Icons

      mat-icon {
        color: #757575; // Icon color
        transition: color 0.2s ease-in-out; // Smooth color transition on hover
      }

      &:hover mat-icon {
        color: #3f51b5; // Change color on hover (e.g., Material primary color)
      }
    }

    .custom-social-icon {
      width: 24px; // Standard size for custom SVG icons
      height: 24px;
      filter: grayscale(100%); // Make them black & white by default like in screenshot
      transition: filter 0.2s ease-in-out;

      &:hover {
        filter: grayscale(0%); // Colorize on hover
      }
    }
  }
}

// Responsive adjustments for smaller screens
@media (max-width: 768px) {
  .footer-toolbar .footer-content {
    flex-direction: column; // Stack copyright and social icons vertically
    align-items: center; // Center content when stacked
    text-align: center;
  }

  .copyright-text {
    margin-bottom: 15px; // Add space between stacked elements
    margin-right: 0; // Remove right margin when stacked
  }

  .social-icons {
    justify-content: center; // Center social icons when stacked
  }
}

`]
})
export class FooterComponent {
    currentYear: number = new Date().getFullYear();

  socialLinks = [
    { name: 'Instagram', icon: 'camera_alt', url: 'https://www.instagram.com/davidoofficial' },
    { name: 'Twitter', icon: 'close', url: 'https://twitter.com/davido' }, // Using a custom icon name for clarity, you'd map this to actual icon/svg
    { name: 'YouTube', icon: 'ondemand_video', url: 'https://www.youtube.com/user/davido' },
    { name: 'TikTok', icon: 'music_note', url: 'https://www.tiktok.com/@davido' }, // Using a generic icon
    { name: 'More Links', icon: 'menu', url: '#' } // Generic menu icon as seen in screenshot
  ];

  // Placeholder for social media icon handling - you'd likely use a custom SVG for exact brand logos
  // For basic Material Icons, they can be directly used.
  getSocialIcon(iconName: string): string {
    switch (iconName) {
      case 'logo_twitter': return '.img/twitter_icon.svg'; // Path to your Twitter SVG
      case 'ondemand_video': return 'play_arrow'; // Material Icon for YouTube-like symbol
      // ... handle other custom icons if needed, otherwise use Material Icons
      default: return iconName; // Directly use material icon name
    }
  }

  // Method to handle clicking on social links
  openSocialLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}