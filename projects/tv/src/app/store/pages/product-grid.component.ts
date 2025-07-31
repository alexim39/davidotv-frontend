import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductInterface, StoreService } from '../services/store.service';
import { UserInterface, UserService } from '../../common/services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CartService } from './cart/cart.service';
import { MatMenuModule } from '@angular/material/menu';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  providers: [StoreService, CartService],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  template: `
    <div class="product-grid-container">
      @if (!products || products.length === 0) {
        <div class="empty-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading products...</p>
        </div>
      } @else {
        <div class="product-grid">
          @for (product of products; track product._id) {
            <mat-card class="product-card">
              <!-- Product Image with Badges -->
              <div class="product-image-container" [routerLink]="['/store/product', product._id]">
                <img 
                  [src]="product.images[0].url || 'assets/images/product-placeholder.jpg'" 
                  [alt]="product.name" 
                  class="product-image"
                  [class.out-of-stock]="product.inventory.stock <= 0"
                >
                <div class="product-badges">
                  @if (product.isNewProduct) {
                    <span class="badge new">New</span>
                  }
                  @if (product.isLimitedEdition) {
                    <span class="badge limited">Limited</span>
                  }
                </div>
                
                @if (product.inventory.stock <= 0) {
                  <div class="out-of-stock-overlay">
                    <span>Out of Stock</span>
                  </div>
                }
              </div>

              <!-- Quick Actions -->
              <div class="quick-actions">
                <button 
                  mat-icon-button 
                  class="quick-action-btn wishlist-btn"
                  (click)="addToWishlist($event, product)" 
                  aria-label="Add to wishlist"
                  [matTooltip]="isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'"
                >
                  <mat-icon>
                    {{ isInWishlist(product._id) ? 'favorite' : 'favorite_border' }}
                  </mat-icon>
                </button>
                
                <button 
                  mat-icon-button 
                  class="quick-action-btn more-btn"
                  [matMenuTriggerFor]="productMenu"
                  (click)="$event.stopPropagation()"
                  aria-label="More options"
                  matTooltip="More options"
                >
                  <mat-icon>more_vert</mat-icon>
                </button>
                
                <mat-menu #productMenu="matMenu">
                  <button mat-menu-item (click)="shareProduct(product)">
                    <mat-icon>share</mat-icon>
                    <span>Share</span>
                  </button>
                  <button mat-menu-item (click)="notifyWhenAvailable(product)" *ngIf="product.inventory.stock <= 0">
                    <mat-icon>notifications</mat-icon>
                    <span>Notify when available</span>
                  </button>
                </mat-menu>
              </div>

              <!-- Product Info -->
              <div class="product-info" [routerLink]="['/store/product', product._id]">
                <h3 class="product-title" [matTooltip]="product.name">{{ truncateName(product.name) }}</h3>
                <div class="product-brand">{{ product.brand }}</div>
                
                <div class="product-rating">
                  <div class="stars">
                    @for (star of [1,2,3,4,5]; track star) {
                      <mat-icon [class.filled]="star <= product.rating.average">star</mat-icon>
                    }
                  </div>
                  <span class="review-count">({{ product.rating.count }})</span>
                </div>
                
                <div class="product-price">
                  @if (product.discountedPrice) {
                    <span class="current-price">{{ product.discountedPrice | currency:'N':'symbol':'1.0-0' }}</span>
                    <span class="original-price">{{ product.price | currency:'N':'symbol':'1.0-0' }}</span>
                    <span class="discount-percent">
                      {{ calculateDiscountPercent(product.price, product.discountedPrice) }}% off
                    </span>
                  } @else {
                    <span class="standard-price">{{ product.price | currency:'N':'symbol':'1.0-0' }}</span>
                  }
                </div>
                
                <div class="product-stock">
                  <mat-icon 
                    [class.in-stock]="product.inventory.stock > 0" 
                    [class.out-of-stock]="product.inventory.stock <= 0"
                  >
                    {{ product.inventory.stock > 0 ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                  <span>
                    {{ product.inventory.stock > 0 ? 
                      (product.inventory.stock < 5 ? 'Only ' + product.inventory.stock + ' left' : 'In stock') : 
                      'Out of stock' }}
                  </span>
                </div>
              </div>

              <!-- Add to Cart -->
              <div class="product-actions">
                <button
                  mat-raised-button
                  color="primary"
                  class="add-to-cart"
                  [disabled]="loadingProductId === product._id || product.inventory.stock <= 0"
                  (click)="addToCart($event, product)"
                >
                  @if (loadingProductId === product._id) {
                    <mat-icon class="loading-icon">hourglass_empty</mat-icon>
                  } @else {
                    <mat-icon>add_shopping_cart</mat-icon>
                  }
                  <span>{{ product.inventory.stock > 0 ? 'Add to Cart' : 'Notify Me' }}</span>
                </button>
              </div>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .product-grid-container {
      padding: 16px 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #666;

      p {
        margin-top: 16px;
        font-size: 14px;
      }
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      padding: 8px;
    }

    .product-card {
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      height: 100%;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
      }
    }

    .product-image-container {
      position: relative;
      padding-top: 100%; /* 1:1 Aspect Ratio */
      overflow: hidden;
      cursor: pointer;

      .product-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;

        &.out-of-stock {
          filter: grayscale(30%);
          opacity: 0.7;
        }
      }

      &:hover .product-image {
        transform: scale(1.05);
      }

      .out-of-stock-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    }

    .product-badges {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 1;

      .badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        color: white;
        text-align: center;
        line-height: 1.2;

        &.new {
          background-color: #4caf50;
        }

        &.limited {
          background-color: #ff9800;
        }
      }
    }

    .quick-actions {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 2;

      .quick-action-btn {
        background: rgba(255, 255, 255, 0.9);
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
          background: white;
          transform: scale(1.1);
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        &.wishlist-btn:hover {
          color: #f44336;
        }

        &.more-btn:hover {
          color: #3a2b63;
        }
      }
    }

    .product-card:hover .quick-actions {
      opacity: 1;
      transform: translateY(0);
    }

    .product-info {
      padding: 16px;
      cursor: pointer;
      flex-grow: 1;

      .product-title {
        margin: 0 0 4px;
        font-size: 16px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .product-brand {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }

      .product-rating {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 8px;

        .stars {
          display: flex;

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
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
      }

      .product-price {
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;

        .current-price {
          font-size: 18px;
          font-weight: 700;
          color: #8f0045;
        }

        .original-price {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
        }

        .standard-price {
          font-size: 18px;
          font-weight: 600;
          color: #666;
        }

        .discount-percent {
          font-size: 14px;
          color: #4caf50;
          font-weight: 600;
        }
      }

      .product-stock {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;

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
    }

    .product-actions {
      padding: 0 16px 16px;

      .add-to-cart {
        width: 100%;
        font-weight: 500;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          margin-right: 8px;
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }

    @media (max-width: 960px) {
      .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }
    }

    @media (max-width: 600px) {
      .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
      }

      .product-info {
        padding: 12px;

        .product-title {
          font-size: 14px;
        }

        .product-price {
          .current-price, .standard-price {
            font-size: 16px;
          }
        }
      }

      .quick-actions {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class ProductGridComponent implements OnInit {
  @Input() products: ProductInterface[] = [];
  @Input() wishlistItems: string[] = [];
  //@Output() cartUpdated = new EventEmitter<void>();
  @Output() wishlistUpdated = new EventEmitter<void>();

  loadingProductId: string | null = null;

  subscriptions: Subscription[] = [];
  private userService = inject(UserService);
  user: UserInterface | null = null;

  constructor(
    private storeService: StoreService, 
    private snackBar: MatSnackBar,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.getCurrentUser()
  }

   private getCurrentUser() {
    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
          //console.log('current user ',this.user)
        }
      })
    )
  }

  truncateName(name: string, limit: number = 24): string {
    return name.length > limit ? `${name.substring(0, limit)}...` : name;
  }

  calculateDiscountPercent(original: number, discounted: number): number {
    return Math.round(((original - discounted) / original) * 100);
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistItems.includes(productId);
  }

  addToCart(event: Event, product: ProductInterface) {
    event.stopPropagation();
    if (!this.user) {
      this.snackBar.open('Please log in to add items to your cart', 'Close', { duration: 3000 });
      return;
    }

    if (product.inventory.stock <= 0) {
      this.notifyWhenAvailable(product);
      return;
    }

    this.loadingProductId = product._id;
    this.cdr.markForCheck();

    const cartItem = {
      userId: this.user._id,
      productId: product._id,
      quantity: 1, // Default quantity
      priceAtAddition: product.discountedPrice || product.price,
    };

    this.cartService.addToCart(cartItem).subscribe({
      next: (response) => {
        if (response) {
          this.snackBar.open(response.message, 'Close', { duration: 3000 });
           this.cartService.cartUpdates; // Notify globally
        }
        this.loadingProductId = null;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.loadingProductId = null;
        this.cdr.markForCheck();
        let errorMessage = 'Server error occurred, please try again.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }  
        this.snackBar.open(errorMessage, 'Ok', {duration: 3000});
      }
    });
  }

  addToWishlist(event: Event, product: ProductInterface) {
    event.stopPropagation();
    if (!this.user) {
      this.snackBar.open('Please log in to add to wishlist', 'Close', { duration: 3000 });
      return;
    }
    
    this.storeService.addToWishlist(product._id, this.user._id).subscribe({
      next: (response) => {
        if (response) {
          this.snackBar.open(response.message, 'Close', { duration: 3000 });
          this.wishlistUpdated.emit();
        }
      },
      error: (error: HttpErrorResponse) => {
        let errorMessage = 'Server error occurred, please try again.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }  
        this.snackBar.open(errorMessage, 'Ok', {duration: 3000});
      }
    });
  }

  shareProduct(product: ProductInterface) {
    // In a real app, implement share functionality
    this.snackBar.open(`Share link for ${product.name} copied to clipboard`, 'Close', { duration: 3000 });
    // navigator.clipboard.writeText(`${window.location.origin}/store/product/${product._id}`);
  }

  notifyWhenAvailable(product: ProductInterface) {
    if (!this.user) {
      this.snackBar.open('Please log in to get notified', 'Close', { duration: 3000 });
      return;
    }
    this.snackBar.open(`We'll notify you when ${product.name} is back in stock`, 'Close', { duration: 3000 });
    // Implement actual notification subscription logic
  }
}