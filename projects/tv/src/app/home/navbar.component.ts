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

    <!-- Navigation Links -->
    <div class="nav-links">
      <a mat-button routerLink="/">Home</a>
      <a mat-button routerLink="/videos">Videos</a>
      <a mat-button routerLink="/fan-art">Fan Art</a>
      <a mat-button routerLink="/music">Music</a>
      <a mat-button routerLink="/store">Store</a>
      <a mat-button routerLink="/upload">Upload</a>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button mat-stroked-button color="accent" (click)="auth()">Log In</button>
    </div>

    <!-- Mobile Hamburger -->
    <button mat-icon-button class="mobile-toggle" (click)="toggleMobileMenu()">
      <mat-icon>menu</mat-icon>
    </button>
  </div>

  <!-- Mobile menu -->
  <div class="mobile-menu" [class.open]="mobileMenuOpen">
    <a mat-button routerLink="/">Home</a>
    <a mat-button routerLink="/videos">Videos</a>
    <a mat-button routerLink="/fan-art">Fan Art</a>
    <a mat-button routerLink="/music">Music</a>
    <a mat-button routerLink="/store">Store</a>
    <a mat-button routerLink="/upload">Upload</a>
    <button mat-stroked-button color="accent" (click)="auth()">Log In</button>
  </div>
</mat-toolbar>
`,
  styles: [`
.navbar {
  background-color: #fff;
  color: #222;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);

  .navbar-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 1200px;
    margin: auto;
    padding: 0 16px;
    height: 64px;
    position: relative;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .logo-icon {
    font-size: 26px;
    //color: #e53935; /* YouTube red */
    color: #8f0045; /* YouTube red */
    margin-bottom: 6px;
  }

  .brand-name {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #000;
  }

  .tv-red {
    //color: #e53935;
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

  .mobile-menu {
    display: none;
    flex-direction: column;
    background-color: #f9f9f9;
    padding: 16px;
    border-top: 1px solid #e0e0e0;

    a, button {
      margin-bottom: 8px;
      width: 100%;
      text-align: left;
    }

    &.open {
      display: flex;
    }
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
