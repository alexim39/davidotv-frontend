import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, filter } from 'rxjs';

/**
 * Mobile bottom bar: the 5 primary destinations (03-ia-and-navigation.md).
 * Home / Watch / Talent-FAB / Community / Store. Talent is a raised center
 * action because discovery is the brand. Hidden on desktop (>=768px, the top
 * navbar owns navigation there) and on immersive routes (player, checkout).
 * Mounted in app.ts so it persists across ALL routes (top navbar only covers
 * the HomeRoutes subtree via home-container).
 */
const IMMERSIVE_PREFIXES = ['/media/watch', '/store/checkout'];

@Component({
  selector: 'async-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <nav *ngIf="visible" class="bottom-nav" aria-label="Primary">
      <a class="tab" routerLink="/" [routerLinkActiveOptions]="{ exact: true }"
         routerLinkActive="active" ariaCurrentWhenActive="page" aria-label="Home">
        <mat-icon aria-hidden="true">home</mat-icon><span>Home</span>
      </a>
      <a class="tab" routerLink="/media/trending" routerLinkActive="active" ariaCurrentWhenActive="page" aria-label="Watch">
        <mat-icon aria-hidden="true">play_circle</mat-icon><span>Watch</span>
      </a>
      <a class="fab" routerLink="/talent" routerLinkActive="active" ariaCurrentWhenActive="page"
         aria-label="Talent Hub — get discovered">
        <span class="fab-btn" aria-hidden="true"><mat-icon>auto_awesome</mat-icon></span>
        <span class="fab-label">Talent</span>
      </a>
      <a class="tab" routerLink="/forum" routerLinkActive="active" ariaCurrentWhenActive="page" aria-label="Community">
        <mat-icon aria-hidden="true">forum</mat-icon><span>Community</span>
      </a>
      <a class="tab" routerLink="/store" routerLinkActive="active" ariaCurrentWhenActive="page" aria-label="Store">
        <mat-icon aria-hidden="true">shopping_bag</mat-icon><span>Store</span>
      </a>
    </nav>
  `,
  styles: [`
    :host { display: block; }
    .bottom-nav {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: var(--dt-z-nav);
      display: flex; align-items: stretch; justify-content: space-around;
      min-height: calc(64px + env(safe-area-inset-bottom, 0px));
      padding-bottom: env(safe-area-inset-bottom, 0px);
      background: var(--dt-raised-glass, rgba(19, 19, 22, 0.72));
      backdrop-filter: blur(16px) saturate(1.2);
      -webkit-backdrop-filter: blur(16px) saturate(1.2);
      border-top: 1px solid var(--dt-line);
    }
    .tab {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 2px; min-height: 64px; text-decoration: none;
      color: var(--dt-text-3); font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
      position: relative;
    }
    .tab mat-icon { font-size: 24px; width: 24px; height: 24px; }
    .tab.active { color: var(--dt-accent-3); }
    .tab.active::before {
      content: ''; position: absolute; top: 0; width: 24px; height: 3px;
      border-radius: 0 0 var(--dt-radius-sm) var(--dt-radius-sm); background: var(--dt-gradient);
    }
    .fab {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
      text-decoration: none; color: var(--dt-text-3);
      font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
      padding-top: 6px; gap: 0;
    }
    .fab-btn {
      width: 56px; height: 56px; margin-top: -22px; border-radius: 50%;
      display: grid; place-items: center; color: #fff;
      background: var(--dt-gradient);
      box-shadow: var(--dt-glow);
      border: 2px solid rgba(255, 255, 255, 0.18);
    }
    .fab-btn mat-icon { font-size: 26px; width: 26px; height: 26px; }
    .fab.active { color: var(--dt-accent-3); }
    .fab-label { margin-top: 2px; }
    @media (min-width: 768px) { :host { display: none; } }
    @media (prefers-reduced-motion: reduce) {
      .bottom-nav, .tab, .fab-btn { transition: none !important; }
    }
  `]
})
export class BottomNavComponent implements OnInit, OnDestroy {
  visible = true;
  private readonly router = inject(Router);
  private sub: Subscription | null = null;

  ngOnInit(): void {
    this.updateVisibility(this.router.url);
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.updateVisibility(e.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private updateVisibility(url: string): void {
    this.visible = !IMMERSIVE_PREFIXES.some((p) => url.startsWith(p));
  }
}
