import { Component, inject, OnDestroy, Output, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { OverlayModule } from '@angular/cdk/overlay';
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
    MatDividerModule,
    MatListModule,
    MatTooltipModule,
    MatDialogModule,
    MatCardModule,
    MatRippleModule,
    OverlayModule
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
        <button mat-icon-button class="search-btn" aria-label="Search" matTooltip="Search products">
          <mat-icon>search</mat-icon>
        </button>

        <button 
          mat-icon-button 
          class="cart-btn" 
          aria-label="Cart" 
          [matBadge]="cartItemCount"
          matBadgeColor="accent"
          [matBadgeHidden]="cartItemCount === 0"
          (click)="openCartDialog()"
          matTooltip="Cart & Orders">
          <mat-icon>shopping_cart</mat-icon>
          <span class="cart-count-text" *ngIf="cartItemCount > 0">{{ cartItemCount }}</span>
        </button>
      </div>

      <!-- Mobile Menu -->
      <mat-menu #mobileMenu="matMenu" class="mobile-menu">
        <div class="mobile-menu-header">
          <h3>Browse Categories</h3>
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

      <!-- Premium Cart Dialog Template -->
      <ng-template #cartDialogTemplate>
        <mat-card class="cart-dialog-card">
          <!-- Header with cart summary -->
          <div class="cart-header">
            <div class="cart-title">
              <mat-icon class="cart-icon">shopping_bag</mat-icon>
              <h3>Your Shopping</h3>
              <button mat-icon-button class="close-btn" (click)="closeCartDialog()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="cart-summary">
              <span class="items-count">{{ cartItemCount }} {{ cartItemCount === 1 ? 'item' : 'items' }}</span>
              <span class="total-price">{{ cartSubtotal | currency }}</span>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="cart-tabs">
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'cart'"
              (click)="setActiveTab('cart')">
              <mat-icon>shopping_cart</mat-icon>
              Cart
              <span class="badge" *ngIf="cartItemCount > 0">{{ cartItemCount }}</span>
            </button>
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'quick-actions'"
              (click)="setActiveTab('quick-actions')">
              <mat-icon>menu</mat-icon>
              Quick Actions
            </button>
          </div>

          <mat-divider></mat-divider>

          <!-- Cart Content -->
          <div class="cart-content" *ngIf="activeTab === 'cart'">
            <!-- Cart items preview -->
            <div class="cart-items-section">
              <div *ngIf="cartItemCount === 0" class="empty-cart">
                <div class="empty-cart-icon">
                  <mat-icon>shopping_bag</mat-icon>
                </div>
                <h4>Your cart is empty</h4>
                <p>Looks like you haven't added anything to your cart yet</p>
                <button 
                  mat-flat-button 
                  color="primary" 
                  class="shop-btn"
                  routerLink="/store" 
                  (click)="closeCartDialog()">
                  Continue Shopping
                </button>
              </div>
              
              <!-- Cart items list would go here -->
              <!-- <app-quick-cart-preview *ngIf="cartItemCount > 0"></app-quick-cart-preview> -->
            </div>

            <!-- Checkout section -->
            <div class="checkout-section" *ngIf="cartItemCount > 0">
              <mat-divider></mat-divider>
              <div class="checkout-total">
                <span>Estimated Total</span>
                <span class="amount">{{ cartSubtotal | currency }}</span>
              </div>
              <button 
                mat-flat-button 
                color="primary" 
                class="checkout-btn"
                routerLink="/store/checkout"
                (click)="closeCartDialog()">
                Proceed to Checkout
              </button>
              <div class="secure-checkout">
                <mat-icon>lock</mat-icon>
                <span>Secure checkout</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions Content -->
          <div class="quick-actions-content" *ngIf="activeTab === 'quick-actions'">
            <div class="quick-actions-grid">
              <button matRipple class="quick-action" routerLink="/store/wishlist" (click)="closeCartDialog()">
                <mat-icon>favorite</mat-icon>
                <span>Wishlist</span>
                <span class="badge">{{ wishlistCount }}</span>
              </button>
              <button matRipple class="quick-action" routerLink="/account/orders" (click)="closeCartDialog()">
                <mat-icon>receipt</mat-icon>
                <span>My Orders</span>
              </button>
              <button matRipple class="quick-action" routerLink="/account/orders/track" (click)="closeCartDialog()">
                <mat-icon>local_shipping</mat-icon>
                <span>Track Order</span>
              </button>
              <!-- <button matRipple class="quick-action" routerLink="/account/saved" (click)="closeCartDialog()">
                <mat-icon>bookmark</mat-icon>
                <span>Saved Items</span>
              </button> -->
              <!-- <button matRipple class="quick-action" routerLink="/account/payment-methods" (click)="closeCartDialog()">
                <mat-icon>credit_card</mat-icon>
                <span>Payment Methods</span>
              </button> -->
              <!-- <button matRipple class="quick-action" routerLink="/account/addresses" (click)="closeCartDialog()">
                <mat-icon>home</mat-icon>
                <span>My Addresses</span>
              </button> -->
            </div>

            <div class="account-section">
              <mat-divider></mat-divider>
              <button matRipple class="account-action" routerLink="/settings/account" (click)="closeCartDialog()">
                <mat-icon>person</mat-icon>
                <span>Account Settings</span>
              </button>
              <!-- <button matRipple class="account-action" routerLink="/help-center" (click)="closeCartDialog()">
                <mat-icon>help</mat-icon>
                <span>Help Center</span>
              </button> -->
            </div>
          </div>
        </mat-card>
      </ng-template>
    </mat-toolbar>
  `,
  styles: [`
    /* Base styles */
    .nav-container {
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 72px;
      padding: 0 24px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #3a2b63, #8f0045);
      color: white;
      font-family: 'Roboto', sans-serif;
    }

    /* Desktop navigation */
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
        color: rgba(255, 255, 255, 0.9);
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

    /* Action buttons */
    .action-buttons {
      display: flex;
      align-items: center;
      margin-left: auto;
      gap: 12px;

      button {
        color: rgba(255, 255, 255, 0.9);
        transition: all 0.2s ease;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        &:hover {
          color: white;
          transform: scale(1.1);
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
        }

        &.cart-btn {
          .cart-count-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 10px;
            font-weight: bold;
            color: white;
          }

          .mat-badge-content {
            background: #FF4081;
            color: white;
            font-weight: bold;
            font-size: 10px;
            top: 2px;
            right: 2px;
          }
        }
      }
    }

    /* Mobile menu */
    .mobile-actions {
      display: none;
    }

    .mobile-menu {
      width: 280px;
      padding: 8px 0;

      .mobile-menu-header {
        padding: 16px;
        text-align: center;
        
        h3 {
          margin: 0;
          font-size: 16px;
          color: #666;
          font-weight: 500;
        }
      }

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

    /* Premium Cart Dialog Styles */
    .cart-dialog-card {
      width: 380px;
      max-width: 100vw;
      overflow: hidden;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      position: relative;
      max-height: 80vh;
      display: flex;
      flex-direction: column;

      .cart-header {
        padding: 20px 24px;
        background: linear-gradient(135deg, #3a2b63, #8f0045);
        color: white;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .cart-title {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: space-between;

          .cart-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
          }

          h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            flex: 1;
          }

          .close-btn {
            color: rgba(255, 255, 255, 0.8);
            transition: all 0.2s ease;

            &:hover {
              //color: white;
              transform: scale(1.1);
            }
          }
        }

        .cart-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          opacity: 0.9;

          .items-count {
            font-weight: 500;
          }

          .total-price {
            font-weight: 600;
            font-size: 15px;
          }
        }
      }

      /* Tabs styling */
      .cart-tabs {
        display: flex;
        padding: 0 16px;
        //background: #f9f9fb;

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;

          &.active {
            color: #8f0045;
            border-bottom-color: #8f0045;
            font-weight: 600;

            mat-icon {
              color: #8f0045;
            }
          }

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }

          .badge {
            background: #ff4081;
            //color: white;
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 10px;
          }
        }
      }

      /* Content sections */
      .cart-content, .quick-actions-content {
        flex: 1;
        overflow-y: auto;
      }

      /* Cart items section */
      .cart-items-section {
        padding: 20px 24px;

        .empty-cart {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 20px 0;

          .empty-cart-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            //background: #f5f5f7;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;

            mat-icon {
              color: #8f0045;
              font-size: 32px;
              width: 32px;
              height: 32px;
            }
          }

          h4 {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            //color: #333;
          }

          p {
            margin: 0 0 20px 0;
            font-size: 14px;
            //color: #666;
            max-width: 80%;
          }

          .shop-btn {
            padding: 8px 24px;
            font-weight: 500;
            border-radius: 6px;
          }
        }
      }

      /* Checkout section */
      .checkout-section {
        padding: 16px 24px;
        //background: #f9f9fb;

        .checkout-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 16px;
          font-weight: 600;

          .amount {
            color: #8f0045;
            font-size: 18px;
          }
        }

        .checkout-btn {
          width: 100%;
          padding: 12px;
          font-weight: 600;
          font-size: 15px;
          border-radius: 6px;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(143, 0, 69, 0.1);
        }

        .secure-checkout {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          //color: #666;

          mat-icon {
            font-size: 14px;
            width: 14px;
            height: 14px;
          }
        }
      }

      /* Quick Actions section */
      .quick-actions-content {
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          padding: 16px;

          .quick-action {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px 12px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            //color: #555;
            transition: all 0.2s ease;
            text-align: center;
            //background: #f9f9fb;
            height: 100%;

            mat-icon {
              color: #8f0045;
              font-size: 24px;
              width: 24px;
              height: 24px;
            }

            .badge {
              background: #ff4081;
              color: white;
              font-size: 11px;
              padding: 2px 6px;
              border-radius: 10px;
              margin-top: 4px;
            }

            &:hover {
              background: #f0e6f0;
              color: #3a2b63;
              transform: translateY(-2px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
          }
        }

        .account-section {
          padding: 0 16px 16px;

          .account-action {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 12px;
            font-size: 14px;
            font-weight: 500;
            color: #555;
            text-align: left;
            background: transparent;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;

            mat-icon {
              color: #8f0045;
              font-size: 20px;
              width: 20px;
              height: 20px;
            }

            &:hover {
              //background: #f5f5f7;
            }
          }
        }
      }
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Responsive styles */
    @media (max-width: 960px) {
      .nav-container {
        padding: 0 16px;
        height: 64px;

        .desktop-nav {
          display: none;
        }

        .mobile-actions {
          display: block;
          margin-left: 0;
          margin-right: 0;
          order: -1;
        }

        .action-buttons {
          gap: 8px;
        }
      }

      .cart-dialog-card {
        width: 320px;
      }
    }

    @media (max-width: 480px) {
      .nav-container {
        padding: 0 12px;

        .action-buttons {
          button {
            width: 36px;
            height: 36px;
          }
        }
      }

      .cart-dialog-card {
        width: 280px;
        max-width: calc(100vw - 24px);

        .quick-actions-grid {
          grid-template-columns: 1fr !important;
        }
      }
    }
  `]
})
export class CategoryNavComponent implements OnInit, OnDestroy {
  @ViewChild('cartDialogTemplate') cartDialogTemplate!: TemplateRef<any>;
  private cartDialogRef?: MatDialogRef<any>;

  categories = [
    { id: 'all', name: 'All' },
    { id: 'apparel', name: 'Apparel & Fashion' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'home', name: 'Home & Lifestyle' },
    { id: 'music', name: 'Music & Collectibles' },
    { id: 'limited-edition', name: 'Exclusive' }
  ];

  cartItemCount = 0;
  wishlistCount = 0;
  cartSubtotal = 0;
  isHandset$: Observable<boolean>;
  activeTab: 'cart' | 'quick-actions' = 'cart';

  private subscriptions: Subscription[] = [];
  private userService = inject(UserService);
  private cartService = inject(CartService);
  private dialog = inject(MatDialog);
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
          this.loadWishlistCount();
        }
      })
    );

    this.subscriptions.push(
      this.cartService.cartUpdates$.subscribe(() => {
        this.loadCartCount();
        this.loadCartSubtotal();
      })
    );
  }

  openCartDialog(): void {
    this.cartDialogRef = this.dialog.open(this.cartDialogTemplate, {
      position: { 
        top: '72px',
        right: '24px'
      },
      hasBackdrop: true,
      backdropClass: 'cart-dialog-backdrop',
      panelClass: 'cart-dialog-panel',
      autoFocus: false
    });
  }

  closeCartDialog(): void {
    if (this.cartDialogRef) {
      this.cartDialogRef.close();
    }
  }

  setActiveTab(tab: 'cart' | 'quick-actions'): void {
    this.activeTab = tab;
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

  loadCartSubtotal(): void {
    if (!this.user) {
      this.cartSubtotal = 0;
      return;
    }

    this.cartService.getCart().pipe(
      map(cart => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      }),
      catchError(() => of(0))
    ).subscribe(total => {
      this.cartSubtotal = total;
    });
  }

  loadWishlistCount(): void {
    // Implement wishlist count loading logic here
    this.wishlistCount = 0; // Placeholder
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.closeCartDialog();
  }
}