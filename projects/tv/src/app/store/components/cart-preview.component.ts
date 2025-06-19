import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';

@Component({
selector: 'app-cart-preview',
standalone: true,
imports: [CommonModule, RouterModule],
template: `
<div class="cart-preview">
  <button class="cart-button" [routerLink]="['/cart']">
    <i class="icon-cart"></i>
    <span class="cart-count">{{ cartService.getCartCount() }}</span>
  </button>
  
  <div class="preview-dropdown">
    <div *ngIf="cartService.cartItems$ | async as items">
      <div *ngIf="items.length > 0; else emptyCart">
        <div class="preview-items">
          <div class="preview-item" *ngFor="let item of items.slice(0, 3)">
            <img [src]="item.image" [alt]="item.name">
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <div class="item-meta">
                <span>{{ item.quantity }} × {{ item.price | currency }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="preview-footer">
          <div class="subtotal">
            <span>Subtotal:</span>
            <span>{{ getSubtotal(items) | currency }}</span>
          </div>
          <a routerLink="/cart" class="view-cart">View Cart</a>
          <a routerLink="/checkout" class="checkout">Checkout</a>
        </div>
      </div>
      
      <ng-template #emptyCart>
        <div class="empty-cart">
          <i class="icon-cart"></i>
          <p>Your cart is empty</p>
        </div>
      </ng-template>
    </div>
  </div>
</div>
`,
styles: [`

.cart-preview {
  position: relative;
  
  .cart-button {
    background: none;
    border: none;
    position: relative;
    cursor: pointer;
    
    i {
      font-size: 24px;
      color: #333;
    }
    
    .cart-count {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #E91E63;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
  }
  
  .preview-dropdown {
    position: absolute;
    right: 0;
    top: 100%;
    width: 320px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    padding: 15px;
    z-index: 100;
    margin-top: 10px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    
    &:before {
      content: '';
      position: absolute;
      bottom: 100%;
      right: 15px;
      border-width: 8px;
      border-style: solid;
      border-color: transparent transparent white transparent;
    }
  }
  
  &:hover .preview-dropdown {
    opacity: 1;
    visibility: visible;
    margin-top: 0;
  }
  
  .preview-items {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 15px;
    
    .preview-item {
      display: flex;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
      
      img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
      }
      
      .item-info {
        flex: 1;
        
        h4 {
          margin: 0 0 5px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .item-meta {
          font-size: 13px;
          color: #666;
        }
      }
    }
  }
  
  .preview-footer {
    .subtotal {
      display: flex;
      justify-content: space-between;
      font-weight: 600;
      margin-bottom: 15px;
      padding-top: 10px;
      border-top: 1px solid #eee;
    }
    
    .view-cart, .checkout {
      display: block;
      text-align: center;
      padding: 8px;
      border-radius: 4px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .view-cart {
      background: #f5f5f5;
      color: #333;
      text-decoration: none;
      
      &:hover {
        background: #eee;
      }
    }
    
    .checkout {
      background: #E91E63;
      color: white;
      text-decoration: none;
      
      &:hover {
        background: #d81b60;
      }
    }
  }
  
  .empty-cart {
    text-align: center;
    padding: 20px;
    
    i {
      font-size: 40px;
      color: #ddd;
      margin-bottom: 10px;
    }
    
    p {
      margin: 0;
      color: #666;
    }
  }
}
    `]
})
export class CartPreviewComponent {
  constructor(public cartService: CartService) {}

  getSubtotal(items: any[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}
}