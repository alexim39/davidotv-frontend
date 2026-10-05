import { Component, ElementRef, ViewChild, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { UserInterface, UserService } from '../../common/services/user.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from '../../auth/auth.service';
import { AuthStateService } from '../../core/services/auth-state.service';

@Component({
  selector: 'async-navbar',
  standalone: true,
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
    MatTooltipModule,
    FormsModule,
    MatDividerModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.desktop.component.scss', './navbar.mobile.component.scss']
})
export class NavbarComponent implements OnDestroy, OnInit {
  @ViewChild('desktopSearch') private desktopSearch?: ElementRef<HTMLInputElement>;
  @ViewChild('mobileSearch') private mobileSearch?: ElementRef<HTMLInputElement>;
  private readonly onGlobalKey = (e: KeyboardEvent) => this.handleGlobalKey(e);
  mobileMenuOpen = false;
  searchQuery = '';
  isAuthenticated = false;
  notificationsCount = 0;
  //imageSource: string = '';

  readonly dialog = inject(MatDialog);
  isDarkTheme = false;

  private userService = inject(UserService);
  user: UserInterface | null = null;
  subscriptions: Subscription[] = [];
  private authService = inject(AuthService);
  private authState = inject(AuthStateService);
  private router = inject(Router);

  ngOnInit(): void {
    // Always-on subscription: dialog login bridges via setCurrentUser,
    // so the navbar updates even when boot saw a logged-out state.
    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
          if (user) this.isAuthenticated = true;
        }
      })
    );

    const authFlag = localStorage.getItem('isAuthenticated');
    if (authFlag === 'true') {
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

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      document.body.classList.add('dark-theme');
    }
    window.addEventListener('keydown', this.onGlobalKey);
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    const body = document.body;
    if (this.isDarkTheme) {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  async authDialog() {
    // Dynamic import: AuthComponent pulls Firebase + signin/signup dialogs.
    // Keeping it out of the shell chunk protects the initial bundle.
    const { AuthComponent } = await import('../../auth/auth.component');
    this.dialog.open(AuthComponent);
  }

  logout() {
    this.subscriptions.push(
      this.authService.signOut({}).subscribe({
        next: (response) => {
          if (response.success) this.finishLogout();
        },
        error: (error: any) => {
          console.error('Error during sign out:', error);
          // Still clear local state: server call failed, don't strand the user.
          this.finishLogout();
        }
      })
    );
  }

  /** Local sign-out without reload (state propagates via services). */
  private finishLogout(): void {
    this.authState.clearSession();
    localStorage.removeItem('isAuthenticated');
    this.userService.setCurrentUser(null as unknown as UserInterface);
    this.user = null;
    this.isAuthenticated = false;
    this.router.navigate(['/'], { replaceUrl: true });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery.trim() } 
      });
      
      if (this.mobileMenuOpen) {
        this.toggleMobileMenu();
      }
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.onGlobalKey);
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Global `/` focuses search (power users), Escape releases it.
   * Never hijacks typing, native control keys, or open dialogs/menus.
   */
  private handleGlobalKey(e: KeyboardEvent): void {
    const t = e.target as HTMLElement | null;
    const typing = !!t?.closest('input, textarea, select, [contenteditable="true"]');
    if (e.key === 'Escape' && typing && t?.closest('.search-bar')) {
      (t as HTMLInputElement).blur();
      return;
    }
    if (e.key !== '/' || typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector('.cdk-overlay-pane')) return;
    e.preventDefault();
    const desktop = this.desktopSearch?.nativeElement;
    if (desktop && desktop.offsetParent !== null) {
      desktop.focus();
      return;
    }
    if (!this.mobileMenuOpen) this.toggleMobileMenu();
    setTimeout(() => this.mobileSearch?.nativeElement?.focus(), 50);
  }

  uploadContent(): void {
    if (this.isAuthenticated) {
      this.router.navigateByUrl('/talent/upload');
    } else {
      this.authDialog();
    }
  }
}