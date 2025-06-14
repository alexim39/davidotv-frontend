import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthComponent } from '../auth/auth.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { UserInterface, UserService } from '../common/services/user.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from '../auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
selector: 'async-navbar',
providers: [AuthService],
imports: [
  CommonModule,
  MatToolbarModule, 
  MatButtonModule, 
  MatIconModule, 
  MatFormFieldModule, 
  MatInputModule,
  MatMenuModule,
  MatBadgeModule,
  FormsModule,
  MatDividerModule,
  RouterModule
],
template: `
  

<mat-toolbar class="navbar" color="primary">
  <div class="navbar-container">
    <!-- Logo -->
    <div class="logo" mat-button routerLink="/">
      <mat-icon class="logo-icon">live_tv</mat-icon>
      <span class="brand-name">
        Davido<span class="tv-red">TV</span>
      </span>
    </div>

    <!-- Search Bar (Desktop) -->
    <div class="search-container">
      <div class="search-bar">
        <input 
          type="text" 
          placeholder="Search videos, music..." 
          [(ngModel)]="searchQuery"
          (keyup.enter)="onSearch()"
        >
        <button class="search-button" (click)="onSearch()">
          <mat-icon>search</mat-icon>
        </button>
      </div>
    </div>

    <!-- Desktop Navigation -->
    <div class="nav-links">
      <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
      <a mat-button routerLink="/videos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Videos</a>
      <a mat-button routerLink="/audio/player" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Music</a>
      <a mat-button routerLink="/fan-art" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Fan Groups</a>
      <a mat-button routerLink="/store" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Store</a>
      <button mat-button routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="uploadContent()">Upload</button>
    </div>

    <!-- Desktop Actions -->
    <div class="actions">

     <!-- Theme Toggle Button -->
    <!-- <button mat-icon-button (click)="toggleTheme()" aria-label="Toggle theme">
      <mat-icon>{{ isDarkTheme ? 'dark_mode' : 'light_mode' }}</mat-icon>
    </button> -->

      <button *ngIf="!isAuthenticated" mat-stroked-button color="accent" (click)="authDialog()">Log In</button>
      
      <div *ngIf="isAuthenticated" class="user-actions">
        <button mat-icon-button class="action-icon" [matBadge]="notificationsCount" matBadgeColor="warn">
          <mat-icon>notifications</mat-icon>
        </button>
        
        <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-avatar">
          <img [src]="imageSource || './img/avatar.png'" alt="User profile" class="avatar-img">
        </button>
        
        <mat-menu #userMenu="matMenu" class="user-menu">
          <button mat-menu-item>
            <mat-icon>account_circle</mat-icon>
            <span>Your Channel</span>
          </button>
          <button mat-menu-item>
            <mat-icon>video_library</mat-icon>
            <span>Your Videos</span>
          </button>
          <button mat-menu-item>
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </mat-menu>
      </div>
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
  <!-- Mobile Search -->
  <div class="mobile-search">
    <div class="search-bar">
      <input 
        type="text" 
        placeholder="Search videos, music..." 
        [(ngModel)]="searchQuery"
        (keyup.enter)="onSearch(); toggleMobileMenu()"
      >
      <button class="search-button" (click)="onSearch(); toggleMobileMenu()">
        <mat-icon>search</mat-icon>
      </button>
    </div>
  </div>

  <a mat-button routerLink="/" (click)="toggleMobileMenu()">Home</a>
  <a mat-button routerLink="/videos" (click)="toggleMobileMenu()">Videos</a>
  <a mat-button routerLink="/audio/player" (click)="toggleMobileMenu()">Music</a>
  <a mat-button routerLink="/fan-art" (click)="toggleMobileMenu()">Fan Groups</a>
  <a mat-button routerLink="/store" (click)="toggleMobileMenu()">Store</a>
  <a mat-button (click)="uploadContent(); toggleMobileMenu()">Upload</a>

  <!-- Theme Toggle Button -->
  <!-- <button mat-icon-button (click)="toggleTheme()" aria-label="Toggle theme">
    <mat-icon>{{ isDarkTheme ? 'dark_mode' : 'light_mode' }}</mat-icon>
  </button> -->

  <div *ngIf="isAuthenticated" class="mobile-user-section">
    <a mat-button routerLink="/profile" (click)="toggleMobileMenu()">
      <div class="mobile-user-avatar">
        <img [src]="imageSource || './img/avatar.png'" alt="User profile" class="mobile-avatar-img">
      </div>
      Profile
    </a>
    <a mat-button routerLink="/notifications" (click)="toggleMobileMenu()">
      <mat-icon [matBadge]="notificationsCount" matBadgeColor="warn">notifications</mat-icon>
      Notifications
    </a>
  </div>

  <button *ngIf="!isAuthenticated" mat-stroked-button color="accent" (click)="authDialog(); toggleMobileMenu()">Log In</button>
  <button *ngIf="isAuthenticated" mat-stroked-button color="warn" (click)="logout(); toggleMobileMenu()">Log Out</button>
</nav>


`,
  styles: [`
.navbar {
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  position: fixed; /* Changed from sticky to fixed */
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px; /* Explicit height */

  .navbar-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1400px;
    padding: 0 24px;
    height: 100%; /* Use parent height */
    width: 100%;
    gap: 24px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 140px;
    cursor: pointer;
  }

  .logo-icon {
    font-size: 26px;
    color: #8f0045;
    margin-bottom: 6px;
  }

  .brand-name {
    font-size: 20px;
    font-weight: 700;
  }

  .tv-red {
    color: #8f0045;
    font-weight: 700;
    font-style: italic;
  }

  /* Search Bar Styles */
  .search-container {
    flex: 1;
    max-width: 600px;
    margin: 0 20px;
  }

  .search-bar {
    display: flex;
    border: 1px solid #ddd;
    border-radius: 40px;
    overflow: hidden;
    height: 40px;
    transition: all 0.3s ease;

    &:focus-within {
      border-color: #8f0045;
      box-shadow: 0 1px 6px rgba(0,0,0,0.1);
    }

    input {
      flex: 1;
      border: none;
      padding: 0 16px;
      outline: none;
      font-size: 14px;
      background: transparent;
    }

    .search-button {
      width: 64px;
      background: transparent;
      border: none;
      border-left: 1px solid #ddd;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background:rgb(36, 36, 36);
      }
    }
  }

  .nav-links {
    display: flex;
    gap: 12px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 140px;
    justify-content: flex-end;
  }

  .user-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .action-icon {
    color: #333333;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    padding: 0;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-menu {
    margin-top: 8px;
    min-width: 200px;
  }

  .mobile-toggle {
    display: none;
  }

  @media (max-width: 1024px) {
    .nav-links {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .navbar-container {
      padding: 0 16px;
      gap: 12px;
    }

    .search-container {
      display: none;
    }

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
  height: calc(100vh - 64px);
  background: black;
  box-shadow: -2px 0 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  z-index: 1001;
  overflow-y: auto;

  a,
  button {
    margin-bottom: 16px;
    width: 100%;
    text-align: left;
    justify-content: flex-start;
  }

  &.open {
    transform: translateX(0);
  }

  .mobile-search {
    margin-bottom: 24px;
    
    .search-bar {
      display: flex;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
      height: 40px;

      input {
        flex: 1;
        border: none;
        padding: 0 12px;
        outline: none;
        font-size: 14px;
      }

      .search-button {
        width: 48px;
        height: 100%;
        background: transparent;
        border: none;
        border-left: 1px solid #ddd;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .mobile-user-section {
    margin: 16px 0;
    border-top: 1px solid #eee;
    padding-top: 16px;

    a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-left: 8px;
    }

    .mobile-user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mobile-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.mobile-menu-overlay {
  position: fixed;
  top: 64px;
  left: 0;
  width: 100%;
  height: calc(100vh - 64px);
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
export class NavbarComponent implements OnDestroy, OnInit {
  mobileMenuOpen = false;
  searchQuery = '';
  isAuthenticated = false; // This should come from your auth service
  notificationsCount = 3; // Example notification count
  imageSource: string = ''; // User avatar image source

  readonly dialog = inject(MatDialog);

  isDarkTheme = false; // Example theme toggle state

  private userService = inject(UserService);
  user: UserInterface | null = null;
  subscriptions: Subscription[] = [];
  private authService = inject(AuthService);
  private router = inject(Router);

 constructor() {}

  ngOnInit(): void {
    const authFlag = localStorage.getItem('isAuthenticated');
    if (authFlag === 'true') {
      
     /*  this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
          console.log('user ',this.user)
        }
      }) */

      this.subscriptions.push(
        this.userService.getUser().subscribe({
          next: (response) => {
            if (response.success) {
              this.userService.setCurrentUser(response.user);
              this.isAuthenticated = true;
            }
          }
        })
      );

    }
  }

 toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    const body = document.body;
    if (this.isDarkTheme) {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  authDialog() {
    this.dialog.open(AuthComponent);
    // After successful auth, set isAuthenticated to true and load user image
  }

  logout() {
    this.isAuthenticated = false;

    // Clear any stored session data
    localStorage.clear();
  
    // Call backend signOut API
    this.subscriptions.push(
      this.authService.signOut({}).subscribe({
        next: (response) => {
          if (response.success) {
            localStorage.removeItem('isAuthenticated'); // Remove token from localStorage
            // Navigate to the login page
            this.router.navigate(['/'], { replaceUrl: true });
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error during sign out:', error);
          this.router.navigate(['/'], { replaceUrl: true });
        }
      })
    );
    //this.scrollToTop(null); // Close the drawer if on mobile
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      // Implement your search functionality
      console.log('Searching for:', this.searchQuery);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  uploadContent(): void {    
    if (this.isAuthenticated) {
      this.router.navigateByUrl('upload');
    } else {
      this.authDialog();
    }
  }
}