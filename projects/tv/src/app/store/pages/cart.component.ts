import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
selector: 'async-cart',
imports: [CommonModule],
template: `
<div class="cart-container">
  <h1>Your Cart</h1>
  
  <div class="cart-content">
    <div class="cart-items" *ngIf="cartItems.length > 0; else emptyCart">
      <div class="cart-item" *ngFor="let item of cartItems">
        <div class="item-image">
          <img [src]="item.image" [alt]="item.name">
        </div>
        
        <div class="item-details">
          <h3 class="item-name">{{ item.name }}</h3>
          <div class="item-variants">
            <span *ngIf="item.color" class="variant">Color: {{ item.color }}</span>
            <span *ngIf="item.size" class="variant">Size: {{ item.size }}</span>
          </div>
          <div class="item-price">{{ item.price | currency }}</div>
          
          <div class="item-actions">
           <!--  <app-quantity-selector 
              [value]="item.quantity"
              [max]="100"
              (quantityChange)="updateQuantity(item.id, $event)"
            ></app-quantity-selector> -->
            
            <button class="remove-item" (click)="removeItem(item.id)">
              <i class="icon-trash"></i> Remove
            </button>
          </div>
        </div>
        
        <div class="item-total">
          {{ item.price * item.quantity | currency }}
        </div>
      </div>
    </div>
    
    <ng-template #emptyCart>
      <div class="empty-cart">
        <i class="icon-cart"></i>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything to your cart yet</p>
        <a routerLink="/shop" class="continue-shopping">Continue Shopping</a>
      </div>
    </ng-template>
    
    <div class="cart-summary" *ngIf="cartItems.length > 0">
      <h3>Order Summary</h3>
      
      <div class="summary-row">
        <span>Subtotal</span>
        <span>{{ subtotal | currency }}</span>
      </div>
      
      <div class="summary-row">
        <span>Shipping</span>
        <span>{{ shippingCost | currency }}</span>
      </div>
      
      <div class="summary-row">
        <span>Tax</span>
        <span>{{ tax | currency }}</span>
      </div>
      
      <div class="summary-row total">
        <span>Total</span>
        <span>{{ total | currency }}</span>
      </div>
      
      <div class="promo-code">
        <input type="text" placeholder="Enter promo code">
        <button>Apply</button>
      </div>
      
      <button class="checkout-button" routerLink="/checkout">Proceed to Checkout</button>
      
      <div class="continue-shopping">
        <a routerLink="/shop">← Continue Shopping</a>
      </div>
    </div>
  </div>
  
  <div class="recommendations" *ngIf="cartItems.length > 0">
    <h3>You May Also Like</h3>
    <!-- <app-product-grid [products]="recommendedProducts" gridLayout="minimal"></app-product-grid> -->
  </div>
</div>
`,
styles: [`

    .cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  h1 {
    font-size: 28px;
    margin-bottom: 30px;
    color: #333;
  }
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
  
  @media (min-width: 992px) {
    flex-direction: row;
    align-items: flex-start;
  }
}

.cart-items {
  flex: 1;
  
  .cart-item {
    display: flex;
    gap: 20px;
    padding: 20px 0;
    border-bottom: 1px solid #eee;
    
    &:first-child {
      border-top: 1px solid #eee;
    }
    
    .item-image {
      width: 120px;
      height: 120px;
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }
    }
    
    .item-details {
      flex: 1;
      
      .item-name {
        font-size: 18px;
        margin: 0 0 8px;
        color: #333;
      }
      
      .item-variants {
        display: flex;
        gap: 10px;
        margin-bottom: 8px;
        
        .variant {
          font-size: 14px;
          color: #666;
        }
      }
      
      .item-price {
        font-size: 16px;
        font-weight: 600;
        color: #E91E63;
        margin-bottom: 15px;
      }
      
      .item-actions {
        display: flex;
        align-items: center;
        gap: 15px;
        
        .remove-item {
          background: none;
          border: none;
          color: #666;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          
          &:hover {
            color: #333;
          }
          
          i {
            font-size: 16px;
          }
        }
      }
    }
    
    .item-total {
      width: 100px;
      text-align: right;
      font-weight: 600;
      font-size: 18px;
    }
  }
}

.empty-cart {
  text-align: center;
  padding: 50px 20px;
  flex: 1;
  
  i {
    font-size: 60px;
    color: #ddd;
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 22px;
    margin-bottom: 10px;
    color: #333;
  }
  
  p {
    color: #666;
    margin-bottom: 20px;
  }
  
  .continue-shopping {
    display: inline-block;
    padding: 10px 20px;
    background: #2196F3;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 600;
    transition: background 0.2s ease;
    
    &:hover {
      background: #0d8aee;
    }
  }
}

.cart-summary {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  
  @media (min-width: 992px) {
    width: 350px;
    position: sticky;
    top: 20px;
  }
  
  h3 {
    font-size: 20px;
    margin: 0 0 20px;
    color: #333;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 16px;
    
    &.total {
      font-size: 18px;
      font-weight: 600;
      padding-top: 12px;
      border-top: 1px solid #eee;
      margin-top: 12px;
    }
  }
  
  .promo-code {
    display: flex;
    margin: 20px 0;
    
    input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px 0 0 4px;
      font-size: 14px;
    }
    
    button {
      padding: 0 15px;
      background: #333;
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      transition: background 0.2s ease;
      
      &:hover {
        background: #555;
      }
    }
  }
  
  .checkout-button {
    width: 100%;
    padding: 12px;
    background: #E91E63;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s ease;
    margin-bottom: 15px;
    
    &:hover {
      background: #d81b60;
    }
  }
  
  .continue-shopping {
    text-align: center;
    
    a {
      color: #2196F3;
      text-decoration: none;
      font-size: 14px;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.recommendations {
  margin-top: 50px;
  
  h3 {
    font-size: 22px;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
  }
}
`]
})
export class CartComponent {
  total = 0
  cartItems: any = [];
  tax = 0;
  shippingCost = 0;
  subtotal = 0;

  removeItem(id: string){}

  updateQuantity(id: string, event: any) {}
}