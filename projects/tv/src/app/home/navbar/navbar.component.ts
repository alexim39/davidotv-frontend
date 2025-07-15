import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthComponent } from '../../auth/auth.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { UserInterface, UserService } from '../../common/services/user.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from '../../auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

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
  mobileMenuOpen = false;
  searchQuery = '';
  isAuthenticated = false;
  notificationsCount = 0;
  imageSource: string = '';

  readonly dialog = inject(MatDialog);
  isDarkTheme = false;

  private userService = inject(UserService);
  user: UserInterface | null = null;
  subscriptions: Subscription[] = [];
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const authFlag = localStorage.getItem('isAuthenticated');
    if (authFlag === 'true') {
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
        }
      })

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

  authDialog() {
    this.dialog.open(AuthComponent);
  }

  logout() {
    this.isAuthenticated = false;
    localStorage.clear();
  
    this.subscriptions.push(
      this.authService.signOut({}).subscribe({
        next: (response) => {
          if (response.success) {
            localStorage.removeItem('isAuthenticated');
            this.router.navigate(['/'], { replaceUrl: true });
            window.location.reload();
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error during sign out:', error);
          this.router.navigate(['/'], { replaceUrl: true });
        }
      })
    );
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