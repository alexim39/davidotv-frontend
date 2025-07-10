import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
  stock: number;
}

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="cart-container">
      <!-- Cart Header -->
      <div class="cart-header">
        <h1>Your Shopping Cart</h1>
        <span class="items-count">{{cartItems.length}} {{cartItems.length === 1 ? 'item' : 'items'}}</span>
      </div>

      <!-- Cart Content -->
      <div class="cart-content">
        <!-- Cart Items -->
        <div class="cart-items-section">
          @if (isLoading) {
            <div class="loading-overlay">
              <mat-spinner diameter="50"></mat-spinner>
            </div>
          }

          @if (cartItems.length > 0) {
            <div class="cart-items">
              @for (item of cartItems; track item.id) {
                <mat-card class="cart-item">
                  <div class="item-image-container">
                    <img [src]="item.image" [alt]="item.name" class="item-image">
                  </div>

                  <div class="item-details">
                    <h3 class="item-name">{{item.name}}</h3>
                    @if (item.variant) {
                      <p class="item-variant">Variant: {{item.variant}}</p>
                    }
                    <p class="item-price">N{{item.price | number:'1.2-2'}}</p>
                    
                    <div class="item-actions">
                      <div class="quantity-selector">
                        <button mat-icon-button (click)="decreaseQuantity(item)" [disabled]="item.quantity <= 1">
                          <mat-icon>remove</mat-icon>
                        </button>
                        <span class="quantity">{{item.quantity}}</span>
                        <button mat-icon-button (click)="increaseQuantity(item)" [disabled]="item.quantity >= item.stock">
                          <mat-icon>add</mat-icon>
                        </button>
                      </div>
                      <button mat-button color="warn" (click)="removeItem(item)">
                        <mat-icon>delete</mat-icon>
                        Remove
                      </button>
                    </div>
                  </div>

                  <div class="item-total">
                    N{{(item.price * item.quantity) | number:'1.2-2'}}
                  </div>
                </mat-card>
              }
            </div>

            <div class="continue-shopping">
              <button mat-stroked-button routerLink="/store">
                <mat-icon>arrow_back</mat-icon>
                Continue Shopping
              </button>
            </div>
          } @else {
            <div class="empty-cart">
              <mat-icon class="empty-icon">shopping_cart</mat-icon>
              <h2>Your cart is empty</h2>
              <p>Browse our store to find amazing Davido merchandise</p>
              <button mat-raised-button color="primary" routerLink="/store">
                Start Shopping
              </button>
            </div>
          }
        </div>

        <!-- Order Summary -->
        @if (cartItems.length > 0) {
          <mat-card class="order-summary">
            <h2 class="summary-title">Order Summary</h2>
            <mat-divider></mat-divider>

            <div class="summary-row">
              <span>Subtotal ({{getTotalItems()}} items)</span>
              <span>N{{getSubtotal() | number:'1.2-2'}}</span>
            </div>

            <div class="summary-row">
              <span>Shipping</span>
              <span>{{getShippingCost() === 0 ? 'Free' : 'N' + (getShippingCost() | number:'1.2-2')}}</span>
            </div>

            <div class="summary-row discount-row">
              <mat-form-field appearance="outline" class="discount-input">
                <mat-label>Discount Code</mat-label>
                <input matInput [(ngModel)]="discountCode" placeholder="Enter code">
                <button matSuffix mat-button (click)="applyDiscount()">APPLY</button>
              </mat-form-field>
              @if (discountApplied) {
                <span class="discount-amount">-N{{discountAmount | number:'1.2-2'}}</span>
              }
            </div>

            <mat-divider></mat-divider>

            <div class="summary-row total-row">
              <span>Total</span>
              <span class="total-amount">N{{getTotal() | number:'1.2-2'}}</span>
            </div>

            <button mat-raised-button color="primary" class="checkout-btn" routerLink="/checkout">
              Proceed to Checkout
            </button>

            <div class="secure-checkout">
              <mat-icon>lock</mat-icon>
              <span>Secure checkout</span>
            </div>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    .cart-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;

      h1 {
        font-size: 1.8rem;
        margin: 0;
        font-weight: 500;
      }

      .items-count {
        margin-left: 16px;
        border: 1px solid gray;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.9rem;
      }
    }

    .cart-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 32px;
    }

    .cart-items-section {
      position: relative;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto;
      gap: 16px;
      padding: 16px;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }

    .item-image-container {
      width: 100px;
      height: 100px;
      border-radius: 4px;
      overflow: hidden;
      background: #f5f5f5;

      .item-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .item-details {
      .item-name {
        font-size: 1.1rem;
        margin: 0 0 8px;
        font-weight: 500;
      }

      .item-variant {
        font-size: 0.9rem;
        color: #666;
        margin: 0 0 8px;
      }

      .item-price {
        font-size: 1rem;
        font-weight: 500;
        margin: 0 0 16px;
        color: #333;
      }
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .quantity-selector {
        display: flex;
        align-items: center;
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;

        button {
          width: 36px;
          height: 36px;
        }

        .quantity {
          width: 40px;
          text-align: center;
        }
      }
    }

    .item-total {
      font-size: 1.1rem;
      font-weight: 600;
      min-width: 100px;
      text-align: right;
    }

    .continue-shopping {
      margin-top: 24px;

      button {
        mat-icon {
          margin-right: 8px;
        }
      }
    }

    .empty-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      text-align: center;

      .empty-icon {
        font-size: 60px;
        height: 60px;
        width: 60px;
        margin-bottom: 16px;
      }

      h2 {
        font-size: 1.5rem;
        margin: 0 0 8px;
      }

      p {
        color: #666;
        margin: 0 0 16px;
      }
    }

    .order-summary {
      padding: 24px;
      position: sticky;
      top: 24px;
      height: fit-content;

      .summary-title {
        font-size: 1.3rem;
        margin: 0 0 16px;
        font-weight: 500;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        margin: 16px 0;

        &.discount-row {
          flex-direction: column;
          gap: 8px;
        }

        &.total-row {
          margin: 24px 0;
        }
      }

      .discount-input {
        width: 100%;

        button {
          color: #3f51b5;
        }
      }

      .discount-amount {
        color: #f44336;
        font-weight: 500;
      }

      .total-row {
        font-size: 1.1rem;
        font-weight: 500;

        .total-amount {
          font-size: 1.3rem;
          font-weight: 600;
        }
      }

      .checkout-btn {
        width: 100%;
        height: 48px;
        font-size: 1rem;
        font-weight: 500;
        margin: 16px 0;
      }

      .secure-checkout {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #666;
        font-size: 0.9rem;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    @media (max-width: 960px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .order-summary {
        margin-top: 32px;
      }
    }

    @media (max-width: 600px) {
      .cart-item {
        grid-template-columns: 80px 1fr;
        grid-template-rows: auto auto;

        .item-total {
          grid-column: 2;
          grid-row: 2;
          text-align: left;
          padding-left: 96px; /* 80px image + 16px gap */
          margin-top: 8px;
        }
      }

      .item-actions {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class CartPageComponent {
  isLoading = false;
  cartItems: CartItem[] = [
    {
      id: '1',
      productId: '1',
      name: 'Official Davido 30BG Logo T-Shirt',
      image: 'https://m.media-amazon.com/images/I/61-jBuhtgZL._AC_UY1100_.jpg',
      price: 39.99,
      quantity: 2,
      variant: 'Large',
      stock: 10
    },
    {
      id: '2',
      productId: '2',
      name: 'Limited Edition Davido Signed Album',
      image: 'https://static-01.daraz.com.np/p/7a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a.jpg',
      price: 199.99,
      quantity: 1,
      stock: 3
    }
  ];

  discountCode = '';
  discountApplied = false;
  discountAmount = 0;

  constructor(private snackBar: MatSnackBar) {}

  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getShippingCost(): number {
    // Free shipping for orders over N50,000
    return this.getSubtotal() > 50000 ? 0 : 1500;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShippingCost() - this.discountAmount;
  }

  getTotalItems(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  increaseQuantity(item: CartItem): void {
    if (item.quantity < item.stock) {
      item.quantity++;
    } else {
      this.snackBar.open('Maximum available quantity reached', 'Dismiss', {
        duration: 2000
      });
    }
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
    }
  }

  removeItem(item: CartItem): void {
    this.cartItems = this.cartItems.filter(i => i.id !== item.id);
    this.snackBar.open('Item removed from cart', 'Dismiss', {
      duration: 2000
    });
  }

  applyDiscount(): void {
    // Mock discount logic
    if (this.discountCode.toUpperCase() === 'DAVIDO20') {
      this.discountAmount = this.getSubtotal() * 0.2; // 20% discount
      this.discountApplied = true;
      this.snackBar.open('Discount applied successfully', 'Dismiss', {
        duration: 2000,
        panelClass: 'success-snackbar'
      });
    } else if (this.discountCode) {
      this.snackBar.open('Invalid discount code', 'Dismiss', {
        duration: 2000,
        panelClass: 'error-snackbar'
      });
    }
  }
}