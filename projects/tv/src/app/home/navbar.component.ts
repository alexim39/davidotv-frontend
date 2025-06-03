import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthComponent } from '../auth/auth.component';

@Component({
  selector: 'async-navbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  template: `
<mat-toolbar class="navbar" color="primary">
  <div class="navbar-container">
    <!-- Logo -->
    <div class="logo">
      <mat-icon class="logo-icon">live_tv</mat-icon>
      <span class="brand-name">
        Davido<span class="tv-red">TV</span>
      </span>
    </div>

    <!-- Desktop Navigation -->
    <div class="nav-links">
      <a mat-button routerLink="/">Home</a>
      <a mat-button routerLink="/videos">Videos</a>
      <a mat-button routerLink="/fan-art">Fan Art</a>
      <a mat-button routerLink="/music">Music</a>
      <a mat-button routerLink="/store">Store</a>
      <a mat-button routerLink="/upload">Upload</a>
    </div>

    <!-- Desktop Actions -->
    <div class="actions">
      <button mat-stroked-button color="accent" (click)="auth()">Log In</button>
    </div>

    <!-- Mobile Hamburger -->
    <button mat-icon-button class="mobile-toggle" (click)="toggleMobileMenu()">
      <mat-icon>{{ mobileMenuOpen ? 'close' : 'menu' }}</mat-icon>
    </button>
  </div>
</mat-toolbar>

<!-- Slide-in Mobile Menu -->
<div class="mobile-menu-overlay" [class.show]="mobileMenuOpen" (click)="toggleMobileMenu()"></div>
<nav class="mobile-slide-menu" [class.open]="mobileMenuOpen">
  <a mat-button routerLink="/" (click)="toggleMobileMenu()">Home</a>
  <a mat-button routerLink="/videos" (click)="toggleMobileMenu()">Videos</a>
  <a mat-button routerLink="/fan-art" (click)="toggleMobileMenu()">Fan Art</a>
  <a mat-button routerLink="/music" (click)="toggleMobileMenu()">Music</a>
  <a mat-button routerLink="/store" (click)="toggleMobileMenu()">Store</a>
  <a mat-button routerLink="/upload" (click)="toggleMobileMenu()">Upload</a>
  <button mat-stroked-button color="accent" (click)="auth(); toggleMobileMenu()">Log In</button>
</nav>

`,
  styles: [`


.navbar {
  background-color: #fff;
  color: #222;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);

  .navbar-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: auto;
    padding: 0 16px;
    height: 64px;
    position: relative;
    width: 100%;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .logo-icon {
    font-size: 26px;
    color: #8f0045;
    margin-bottom: 6px;
  }

  .brand-name {
    font-size: 20px;
    font-weight: 700;
    color: #000;
  }

  .tv-red {
    color: #8f0045;
    font-weight: 700;
    font-style: italic;
  }

  .nav-links {
    display: flex;
    gap: 24px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mobile-toggle {
    display: none;
  }

  @media (max-width: 768px) {
    .nav-links,
    .actions {
      display: none;
    }

    .mobile-toggle {
      display: block;
    }
  }
}

.mobile-slide-menu {
  position: fixed;
  top: 64px;
  right: 0;
  width: 80%;
  max-width: 320px;
  height: 100%;
  background-color: #fff;
  box-shadow: -2px 0 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  z-index: 1001;

  a,
  button {
    margin-bottom: 16px;
    width: 100%;
    text-align: left;
  }

  &.open {
    transform: translateX(0);
  }
}

.mobile-menu-overlay {
  position: fixed;
  top: 64px;
  left: 0;
  width: 100%;
  height: calc(100% - 64px);
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease-in-out;
  z-index: 1000;

  &.show {
    opacity: 1;
    visibility: visible;
  }
}


`]
})
export class NavbarComponent {
  mobileMenuOpen = false;

  readonly dialog = inject(MatDialog);


  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  auth() {
    this.dialog.open(AuthComponent, {
      //data: {name: this.name(), animal: this.animal()},
    });
  }
}
