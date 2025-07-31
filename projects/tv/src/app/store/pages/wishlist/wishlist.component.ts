import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { UserInterface, UserService } from '../../../common/services/user.service';
import { Subscription, catchError, map, of } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductInterface, StoreService } from '../../services/store.service';
import { WishlistMoveToCartDialogComponent } from './wishlist-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  providers: [StoreService, CartService],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule,
    FormsModule,
    MatCheckboxModule,
    MatDialogModule,
    MatToolbarModule
  ],
  template: `
    <div class="wishlist-container" [class.mobile-view]="isHandset$ | async">
      <!-- Header Section -->
      <div class="wishlist-header">

        <mat-toolbar class="section-header">
          <h2>My Wishlist <small class="wishlist-subtitle">{{ wishlistItems.length }} {{ wishlistItems.length === 1 ? 'item' : 'items' }}</small></h2>
          <br>

          <span class="spacer"></span>
          <a mat-button color="primary" routerLink="/store/category/all" class="view-all">
            View Store
            <mat-icon>chevron_right</mat-icon>
          </a>
        </mat-toolbar>
        
        
        <!-- Bulk Actions (visible when items are selected) -->
        <div class="bulk-actions" *ngIf="selectedItems.length > 0">
          <button mat-stroked-button (click)="clearSelection()">
            <mat-icon>clear</mat-icon>
            Clear
          </button>
          <button mat-flat-button color="warn" (click)="removeSelectedItems()">
            <mat-icon>delete</mat-icon>
            Remove
          </button>
          <button mat-flat-button color="primary" (click)="moveSelectedToCart()">
            <mat-icon>shopping_cart</mat-icon>
            Add to Cart
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-wishlist" *ngIf="!isLoading && wishlistItems.length === 0">
        <div class="empty-icon">
          <mat-icon>favorite_border</mat-icon>
        </div>
        <h2>Your wishlist is empty</h2>
        <p>Save items you love for later by clicking the heart icon</p>
        <button mat-flat-button color="primary" routerLink="/store">
          Start Shopping
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading-spinner" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Wishlist Items Grid -->
      <div class="wishlist-grid" *ngIf="!isLoading && wishlistItems.length > 0">
        <div class="wishlist-item" *ngFor="let product of wishlistItems">
          <mat-card class="product-card">
            <!-- Product Image -->
            <div class="product-image-container">
              <img 
                [src]="product.images[0].url || 'assets/images/product-placeholder.jpg'" 
                [alt]="product.images[0].altText || product.name"
                class="product-image"
                routerLink="/store/product/{{product._id}}"
              >
              <div class="product-badges">
                <span class="badge new" *ngIf="product.isNewProduct">New</span>
                <span class="badge limited" *ngIf="product.isLimitedEdition">Limited</span>
              </div>
              <div class="product-actions">
                <button 
                  mat-icon-button 
                  class="action-btn remove-btn"
                  (click)="removeFromWishlist(product._id)"
                  matTooltip="Remove from wishlist"
                  aria-label="Remove from wishlist"
                >
                  <mat-icon>delete</mat-icon>
                </button>
                <button 
                  mat-icon-button 
                  class="action-btn cart-btn"
                  (click)="addToCart(product._id)"
                  matTooltip="Add to cart"
                  aria-label="Add to cart"
                >
                  <mat-icon>shopping_cart</mat-icon>
                </button>
              </div>
            </div>

            <!-- Product Details -->
            <div class="product-details">
              <div class="product-select">
                <mat-checkbox 
                  [(ngModel)]="product.selected" 
                  (change)="updateSelection()"
                  aria-label="Select this item"
                ></mat-checkbox>
              </div>
              <h3 class="product-name" routerLink="/store/product/{{product._id}}">
                {{ product.name }}
              </h3>
              <div class="product-brand">{{ product.brand }}</div>
              
              <div class="product-price">
                <span class="current-price" *ngIf="product.discountedPrice">
                  {{ product.discountedPrice | currency }}
                </span>
                <span class="original-price" [class.discounted]="product.discountedPrice">
                  {{ product.price | currency }}
                </span>
                <span class="discount-percent" *ngIf="product.discountedPrice">
                  {{ calculateDiscountPercent(product.price, product.discountedPrice) }}% off
                </span>
              </div>

              <div class="product-stock">
                <mat-icon 
                  [class.in-stock]="product.inventory.stock > 0" 
                  [class.out-of-stock]="product.inventory.stock <= 0"
                >
                  {{ product.inventory.stock > 0 ? 'check_circle' : 'cancel' }}
                </mat-icon>
                <span>
                  {{ product.inventory.stock > 0 ? 'In stock' : 'Out of stock' }}
                </span>
              </div>

              <div class="product-rating">
                <div class="stars">
                  <mat-icon *ngFor="let star of [1,2,3,4,5]" 
                    [class.filled]="star <= product.rating.average"
                  >star</mat-icon>
                </div>
                <span class="review-count">({{ product.rating.count }})</span>
              </div>
            </div>
          </mat-card>
        </div>
      </div>

      <!-- Recommendations Section -->
      <div class="recommendations-section" *ngIf="!isLoading && wishlistItems.length > 0">
        <h2 class="section-title">You might also like</h2>
        
        <div class="loading-spinner" *ngIf="isRecommendationsLoading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
        
        <div class="recommendations-grid" *ngIf="!isRecommendationsLoading">
          <div class="recommendation-item" *ngFor="let product of recommendedProducts">
            <mat-card class="recommendation-card">
              <img 
                [src]="product.images[0].url || '/images/product-placeholder.jpg'" 
                [alt]="product.images[0].altText || product.name"
                class="recommendation-image"
                routerLink="/store/product/{{product._id}}"
              >
              <div class="recommendation-details">
                <h3 class="recommendation-name">{{ product.name }}</h3>
                <div class="recommendation-price">
                  <span *ngIf="product.discountedPrice">{{ product.discountedPrice | currency }}</span>
                  <span [class.discounted]="product.discountedPrice">{{ product.price | currency }}</span>
                </div>
                <button 
                  mat-stroked-button 
                  class="add-to-wishlist-btn"
                  (click)="addToWishlist(product._id)"
                >
                  <mat-icon>favorite_border</mat-icon>
                  Save
                </button>
              </div>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Main Container */
    .wishlist-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      min-height: calc(100vh - 150px);
    }



    .section-header {
      background: transparent !important;
      padding: 0 !important;
      margin-bottom: 16px;

      h2 {
        font-size: 1.5rem;
        font-weight: 500;
        margin: 0;
      }

      p {
        color: #666;
        margin: 0;
        font-size: 0.9rem;
      }

      .spacer {
        flex: 1 1 auto;
      }

      .view-all {
        font-weight: 500;

        mat-icon {
          font-size: 20px;
          height: 20px;
          width: 20px;
        }
      }
    }

    /* Header Section */
    .wishlist-header {
      margin-bottom: 32px;
      position: relative;
    }

    /* .wishlist-title {
      display: flex;
      align-items: center;
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #3a2b63;
    }

    .title-icon {
      color: #8f0045;
      margin-right: 12px;
      font-size: 32px;
      width: 32px;
      height: 32px;
    } */

    .wishlist-subtitle {
      font-size: 16px;
      color: #666;
      margin-bottom: 24px;
    }

    /* Bulk Actions */
    .bulk-actions {
      display: flex;
      gap: 12px;
      margin: 16px 0;
      padding: 16px 0;
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
      background-color: #100404ff;
      button {
        display: flex;
        align-items: center;
        gap: 8px;
        
      }
    }

    /* Empty State */
    .empty-wishlist {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 20px;
      background-color: #fafafa;
      border-radius: 8px;
      margin-top: 40px;

      .empty-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: #f0e6f0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;

        mat-icon {
          color: #8f0045;
          font-size: 40px;
          width: 40px;
          height: 40px;
        }
      }

      h2 {
        font-size: 24px;
        margin: 0 0 12px 0;
        color: #666;
      }

      p {
        font-size: 16px;
        color: #666;
        margin: 0 0 24px 0;
        max-width: 400px;
      }

      button {
        padding: 10px 32px;
        font-size: 16px;
      }
    }

    /* Loading State */
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
    }

    /* Wishlist Grid */
    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .product-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      overflow: hidden;
      border-radius: 8px;
      position: relative;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
      }
    }

    /* Product Image */
    .product-image-container {
      position: relative;
      padding-top: 100%; /* 1:1 Aspect Ratio */
      overflow: hidden;
    }

    .product-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: pointer;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    .product-badges {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      gap: 8px;
      z-index: 1;
      .badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        color: white;

        &.new {
            background-color: #4caf50;
        }

        &.limited {
            background-color: #ff9800;
        }
      }
    }

    .product-actions {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1;

      .product-card:hover & {
        opacity: 1;
      }
    }

    .action-btn {
      background-color: rgba(255, 255, 255, 0.9);
      color: #333;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;

      &:hover {
        background-color: white;
        transform: scale(1.1);
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &.remove-btn:hover {
        color: #f44336;
      }

      &.cart-btn:hover {
        color: #8f0045;
      }
    }

    /* Product Details */
    .product-details {
      padding: 16px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .product-select {
      margin-bottom: 12px;
    }

    .product-name {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px 0;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #8f0045;
      }
    }

    .product-brand {
      font-size: 14px;
      color: #666;
      margin-bottom: 12px;
    }

    .product-price {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .current-price {
      font-size: 18px;
      font-weight: 700;
      color: #8f0045;
    }

    .original-price {
      font-size: 16px;
      color: #333;

      &.discounted {
        text-decoration: line-through;
        color: #999;
        font-size: 14px;
      }
    }

    .discount-percent {
      font-size: 14px;
      color: #4caf50;
      font-weight: 600;
    }

    .product-stock {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      margin-bottom: 12px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;

        &.in-stock {
          color: #4caf50;
        }

        &.out-of-stock {
          color: #f44336;
        }
      }
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: auto;
    }

    .stars {
      display: flex;
      align-items: center;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #ddd;

        &.filled {
          color: #ffc107;
        }
      }
    }

    .review-count {
      font-size: 12px;
      color: #666;
    }

    /* Recommendations Section */
      .recommendations-section {
      margin-top: 48px;
      padding-top: 32px;
      border-top: 1px solid #eee;

      .recommendations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
      }
    }

    // Mobile responsiveness
    @media (max-width: 600px) {
      .recommendations-section {
        padding-top: 20px;
        margin-top: 32px;

        .section-title {
          font-size: 18px;
          margin-bottom: 16px;
        }

        .recommendations-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .recommendation-card {
          .recommendation-image {
            height: 140px;
          }
          .recommendation-details {
            padding: 12px;
          }
        }
      }
    }

    .section-title {
      font-size: 22px;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: #333;
    }

    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }

    .recommendation-card {
      transition: transform 0.3s ease;
      border-radius: 8px;
      overflow: hidden;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .recommendation-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      cursor: pointer;
    }

    .recommendation-details {
      padding: 16px;
    }

    .recommendation-name {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 8px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .recommendation-price {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #8f0045;

      span:last-child {
        color: #999;
        text-decoration: line-through;
        font-size: 14px;
        margin-left: 8px;
      }
    }

    .add-to-wishlist-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 13px;
      padding: 4px 8px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    /* Mobile View */
    .mobile-view {
      padding: 16px;

      .wishlist-title {
        font-size: 24px;
      }

      .wishlist-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .recommendations-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .product-actions {
        opacity: 1; /* Always show on mobile */
      }
    }
  `]
})
export class WishlistComponent implements OnInit, OnDestroy {
  private storeService = inject(StoreService);
  private cartService = inject(CartService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  private breakpointObserver = inject(BreakpointObserver);
  user: UserInterface | null = null;

  wishlistItems: (ProductInterface & { selected: boolean })[] = [];
  recommendedProducts: ProductInterface[] = [];
  selectedItems: string[] = [];
  isLoading = false;
  isRecommendationsLoading = false;
  private subscriptions: Subscription[] = [];

  isHandset$ = this.breakpointObserver.observe([Breakpoints.Handset])
    .pipe(map((result: any) => result.matches));

  ngOnInit() {

     this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
          if (this.user?._id) {
            this.loadWishlistItems(this.user._id);
          }
        }
      })
    );

    
    this.loadRecommendations();
  }

  loadWishlistItems(userId: string) {
      this.isLoading = true;

      this.subscriptions.push(
        this.storeService.getUserWishlist(userId).subscribe({
            next: (product: any) => {
              //console.log('wishlist ',product)
              this.wishlistItems = product;
              this.isLoading = false;
              this.cdr.markForCheck(); // Trigger change detection
            },
            error: (error: HttpErrorResponse) => {
                this.isLoading = false;

                let errorMessage = 'Server error occurred, please try again.'; // default error message.
                if (error.error && error.error.message) {
                    errorMessage = error.error.message; // Use backend's error message if available.
                }  
                this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
                this.cdr.markForCheck();
            }
          
        })
      );
    
  }

  loadRecommendations() {
    // In a real app, you would fetch recommendations based on wishlist items

    this.isRecommendationsLoading = true;

    this.subscriptions.push(
      this.storeService.getFeaturedProducts(4).subscribe({
        next: (products) => {
          this.recommendedProducts = products;
          this.isRecommendationsLoading = false;
          this.cdr.markForCheck(); // Trigger change detection
        },
        error: (error: HttpErrorResponse) => {
          this.isRecommendationsLoading = false;
          let errorMessage = 'Failed to load recommendations';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Ok', { duration: 3000 });
          this.cdr.markForCheck();
        }
      })
    );
  }

  calculateDiscountPercent(original: number, discounted: number): number {
    return Math.round(((original - discounted) / original) * 100);
  }

  addToWishlist(productId: string) {
    const userId = this.user?._id;
    if (!userId) return;

    this.subscriptions.push(
      this.storeService.addToWishlist(productId, userId).subscribe({
        next: () => {
          this.snackBar.open('Added to wishlist', 'Close', { duration: 3000 });
            // Refresh wishlist items
          this.loadWishlistItems(userId);
        },
        error: () => {
          this.snackBar.open('Failed to add to wishlist', 'Close', { duration: 3000 });
        }
      })
    );
  }

  removeFromWishlist(productId: string) {
    // In a real app, you would call a removeFromWishlist API endpoint
    this.wishlistItems = this.wishlistItems.filter(item => item._id !== productId);
    this.snackBar.open('Removed from wishlist', 'Close', { duration: 3000 });
  }

  addToCart(productId: string) {
    const userId = this.user?._id;
    if (!userId) return;

    // In a real app, you would call addToCart API endpoint
    this.snackBar.open('Added to cart', 'Close', { duration: 3000 });
  }

  updateSelection() {
    this.selectedItems = this.wishlistItems
      .filter(item => item.selected)
      .map(item => item._id);
  }

  clearSelection() {
    this.wishlistItems.forEach(item => item.selected = false);
    this.selectedItems = [];
  }

  removeSelectedItems() {
    if (this.selectedItems.length === 0) return;

    // In a real app, you would call a bulk remove API endpoint
    this.wishlistItems = this.wishlistItems.filter(item => !this.selectedItems.includes(item._id));
    this.snackBar.open(`Removed ${this.selectedItems.length} items`, 'Close', { duration: 3000 });
    this.selectedItems = [];
  }

  moveSelectedToCart() {
    if (this.selectedItems.length === 0) return;

    const dialogRef = this.dialog.open(WishlistMoveToCartDialogComponent, {
      width: '400px',
      data: { count: this.selectedItems.length }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'move') {
        // In a real app, you would call a bulk add to cart API endpoint
        this.snackBar.open(`Added ${this.selectedItems.length} items to cart`, 'Close', { duration: 3000 });
        this.wishlistItems = this.wishlistItems.filter(item => !this.selectedItems.includes(item._id));
        this.selectedItems = [];
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}