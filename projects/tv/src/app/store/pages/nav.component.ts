import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatDividerModule } from '@angular/material/divider';
import { UserInterface, UserService } from '../../common/services/user.service';
import { CartInterface, CartService } from './cart/cart.service';

@Component({
  selector: 'app-category-nav',
  providers: [CartService],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="nav-container" color="primary">
  <!-- Desktop Navigation -->
  <nav class="desktop-nav" *ngIf="!(isHandset$ | async)">
    <a
      *ngFor="let category of categories"
      mat-button
      [routerLink]="['/store/category', category.id]"
      routerLinkActive #rla="routerLinkActive"
      [class.active]="rla.isActive"
      class="nav-item">
      <span class="nav-text">{{ category.name }}</span>
      <mat-icon *ngIf="category.id === 'limited-edition'" class="limited-badge">whatshot</mat-icon>
      <div class="active-indicator" *ngIf="rla.isActive"></div>
    </a>
  </nav>

  <!-- Mobile Menu Trigger -->
  <div class="mobile-actions" *ngIf="isHandset$ | async">
    <button mat-icon-button [matMenuTriggerFor]="mobileMenu" aria-label="Menu">
      <mat-icon>menu</mat-icon>
    </button>
  </div>

  <!-- Action Buttons -->
  <div class="action-buttons">
    <button mat-icon-button class="search-btn" aria-label="Search">
      <mat-icon>search</mat-icon>
    </button>
    <button 
      mat-icon-button 
      class="cart-btn" 
      aria-label="Cart" 
      [matBadge]="cartItemCount" 
      matBadgeColor="accent"
      [matBadgeHidden]="cartItemCount === 0"
      routerLink="/store/cart">
      <mat-icon>shopping_cart</mat-icon>
    </button>
  </div>

  <!-- Mobile Menu -->
  <mat-menu #mobileMenu="matMenu" class="mobile-menu">
    <div class="mobile-menu-header">
      <h3 style="text-align: center; color: gray;">Browse Categories</h3>
    </div>
    <mat-divider></mat-divider>
    <button
      *ngFor="let category of categories"
      mat-menu-item
      [routerLink]="['/store/category', category.id]"
      routerLinkActive #rla="routerLinkActive"
      [class.active]="rla.isActive">
      <mat-icon *ngIf="rla.isActive" class="menu-active-icon">chevron_right</mat-icon>
      {{ category.name }}
      <span class="spacer"></span>
      <mat-icon *ngIf="category.id === 'limited-edition'" class="limited-badge">whatshot</mat-icon>
    </button>
  </mat-menu>
</mat-toolbar>
  `,
  styles: [`
    .nav-container {
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 72px;
      padding: 0 24px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #302b63, #8f0045);
      color: white;

      .branding {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin-right: 32px;

        .brand-icon {
          font-size: 32px;
          margin-right: 8px;
          color: #FF4081;
        }

        .brand-name {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.5px;
          background: linear-gradient(to right, #FF4081, #00BCD4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      .desktop-nav {
        display: flex;
        height: 100%;
        flex: 1;
        margin-left: 24px;

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          height: 100%;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 0;

          &:hover {
            color: white;
            background: rgba(255, 255, 255, 0.1);
          }

          &.active {
            color: white;
            font-weight: 600;

            .active-indicator {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: #FF4081;
              border-radius: 3px 3px 0 0;
              animation: fadeIn 0.3s ease;
            }
          }

          .nav-text {
            margin-right: 8px;
          }

          .limited-badge {
            font-size: 18px;
            color: #FFD700;
            margin-left: 4px;
          }
        }
      }

      .action-buttons {
        display: flex;
        align-items: center;
        margin-left: auto;

        button {
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.2s ease;

          &:hover {
            color: white;
            transform: scale(1.1);
          }

          &.cart-btn {
            position: relative;
            margin: 0 8px;
          }
        }
      }

      .mobile-actions {
        display: none;
      }

      .mobile-menu {
        width: 280px;
        padding: 8px 0;

        // .mobile-menu-header {
        //   //padding: 16px;
        //   text-align: center;

        //   // h3 {
        //   //   margin-left: 2em;
        //   //   font-size: 16px;
        //   //   font-weight: 500;
        //   //   color: #333;
        //   // }
        // }

        button {
          position: relative;
          height: 48px;
          font-size: 14px;

          &.active {
            background: rgba(63, 81, 181, 0.1);
            color: #3f51b5;
            font-weight: 500;
          }

          .menu-active-icon {
            position: absolute;
            left: 8px;
            color: #3f51b5;
          }

          .limited-badge {
            color: #FFD700;
            font-size: 20px;
          }

          .spacer {
            flex: 1 1 auto;
          }
        }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }
    }

    @media (max-width: 960px) {
      .nav-container {
        padding: 0 16px;
        height: 64px;

        .desktop-nav {
          display: none;
        }

        .mobile-actions {
          display: block;
          margin-left: auto;
          margin-right: 16px;
        }

        .branding {
          margin-right: 16px;

          .brand-icon {
            font-size: 28px;
          }

          .brand-name {
            font-size: 18px;
          }
        }
      }
    }

    @media (max-width: 480px) {
      .nav-container {
        padding: 0 12px;

        .brand-name {
          display: none;
        }

        .action-buttons {
          button {
            margin: 0 4px;
          }
        }
      }
    }
  `]
})
export class CategoryNavComponent implements OnInit, OnDestroy {
  categories = [
    { id: 'all', name: 'All' },
    { id: 'apparel', name: 'Apparel & Fashion' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'home', name: 'Home & Lifestyle' },
    { id: 'music', name: 'Music & Collectibles' },
    { id: 'limited-edition', name: 'Exclusive' }
  ];

  cartItemCount = 0;
  isHandset$: Observable<boolean>;

  private subscriptions: Subscription[] = [];
  private userService = inject(UserService);
  private cartService = inject(CartService);
  user: UserInterface | null = null;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.isHandset$ = this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.TabletPortrait
    ]).pipe(
      map(result => result.matches)
    );
  }

  ngOnInit() {
    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
          this.loadCartCount();
        }
      })
    );

    // Subscribe to cart updates
    this.subscriptions.push(
      this.cartService.cartUpdates$.subscribe(() => {
        this.loadCartCount();
      })
    );
  }

  loadCartCount(): void {
    if (!this.user) {
      this.cartItemCount = 0;
      return;
    }

    this.cartService.getCart().pipe(
      map(cart => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((sum: number, item: CartInterface) => sum + item.quantity, 0);
      }),
      catchError(() => of(0))
    ).subscribe(count => {
      this.cartItemCount = count;
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}