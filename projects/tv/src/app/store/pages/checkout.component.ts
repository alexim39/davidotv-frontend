import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CheckoutService } from '../services/checkout.service';
import { CheckoutProgressComponent } from '../components/checkout-progress.component';

@Component({
selector: 'app-checkout',
standalone: true,
imports: [CommonModule, FormsModule, ReactiveFormsModule, CheckoutProgressComponent],
template: `
<div class="checkout-container">
  <app-checkout-progress [currentStep]="currentStep"></app-checkout-progress>
  
  <div class="checkout-content">
    <div class="checkout-steps">
      <!-- Shipping Step -->
      <div class="step shipping-step" *ngIf="currentStep === 'shipping'">
        <h2>Shipping Information</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label>First Name</label>
            <input type="text" [(ngModel)]="shippingInfo.firstName" required>
          </div>
          
          <div class="form-group">
            <label>Last Name</label>
            <input type="text" [(ngModel)]="shippingInfo.lastName" required>
          </div>
          
          <div class="form-group full-width">
            <label>Address</label>
            <input type="text" [(ngModel)]="shippingInfo.address" required>
          </div>
          
          <div class="form-group">
            <label>City</label>
            <input type="text" [(ngModel)]="shippingInfo.city" required>
          </div>
          
          <div class="form-group">
            <label>Country</label>
            <select [(ngModel)]="shippingInfo.country" required>
              <option value="NG">Nigeria</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="GH">Ghana</option>
              <option value="SA">South Africa</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>ZIP Code</label>
            <input type="text" [(ngModel)]="shippingInfo.zipCode" required>
          </div>
          
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" [(ngModel)]="shippingInfo.phone" required>
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="shippingInfo.email" required>
          </div>
        </div>
        
        <div class="shipping-methods">
          <h3>Shipping Method</h3>
          <div class="method-options">
            <label *ngFor="let method of shippingMethods">
              <input type="radio" 
                     name="shippingMethod" 
                     [value]="method" 
                     [(ngModel)]="selectedShipping">
              <div class="method-card">
                <div class="method-info">
                  <h4>{{ method.name }}</h4>
                  <p>Estimated delivery: {{ method.estimatedDays }} days</p>
                </div>
                <div class="method-price">
                  {{ method.cost | currency }}
                </div>
              </div>
            </label>
          </div>
        </div>
        
        <div class="step-actions">
          <button class="continue-button" (click)="nextStep()">Continue to Payment</button>
        </div>
      </div>
      
      <!-- Payment Step -->
      <div class="step payment-step" *ngIf="currentStep === 'payment'">
        <h2>Payment Information</h2>
        
        <div class="payment-methods">
          <label *ngFor="let method of paymentMethods">
            <input type="radio" 
                   name="paymentMethod" 
                   [value]="method" 
                   [(ngModel)]="selectedPayment">
            {{ method }}
          </label>
        </div>
        
        <div *ngIf="selectedPayment === 'Credit Card'" class="credit-card-form">
          <div class="form-group">
            <label>Card Number</label>
            <input type="text" [(ngModel)]="paymentInfo.cardNumber" placeholder="1234 5678 9012 3456">
          </div>
          
          <div class="form-group">
            <label>Name on Card</label>
            <input type="text" [(ngModel)]="paymentInfo.cardName" placeholder="John Doe">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Expiry Date</label>
              <input type="text" [(ngModel)]="paymentInfo.expiry" placeholder="MM/YY">
            </div>
            
            <div class="form-group">
              <label>CVV</label>
              <input type="text" [(ngModel)]="paymentInfo.cvv" placeholder="123">
            </div>
          </div>
        </div>
        
        <div class="step-actions">
          <button class="back-button" (click)="prevStep()">Back</button>
          <button class="continue-button" (click)="nextStep()">Continue to Review</button>
        </div>
      </div>
      
      <!-- Review Step -->
      <div class="step review-step" *ngIf="currentStep === 'review' && !orderComplete">
        <h2>Review Your Order</h2>
        
        <div class="order-summary">
          <div class="shipping-summary">
            <h3>Shipping Information</h3>
            <p>{{ shippingInfo.firstName }} {{ shippingInfo.lastName }}</p>
            <p>{{ shippingInfo.address }}</p>
            <p>{{ shippingInfo.city }}, {{ shippingInfo.country }} {{ shippingInfo.zipCode }}</p>
            <p>{{ shippingInfo.phone }}</p>
            <p>{{ shippingInfo.email }}</p>
            
            <h3>Shipping Method</h3>
            <p>{{ selectedShipping.name }} ({{ selectedShipping.estimatedDays }} days)</p>
          </div>
          
          <div class="payment-summary">
            <h3>Payment Method</h3>
            <p>{{ selectedPayment }}</p>
            
            <div *ngIf="selectedPayment === 'Credit Card'">
              <p>Card ending in {{ paymentInfo.cardNumber.slice(-4) }}</p>
            </div>
          </div>
          
          <div class="order-items">
            <h3>Order Items</h3>
            <div class="order-item" *ngFor="let item of cartItems | async">
              <img [src]="item.image" [alt]="item.name">
              <div class="item-details">
                <h4>{{ item.name }}</h4>
                <p>{{ item.quantity }} × {{ item.price | currency }}</p>
                <p *ngIf="item.size">Size: {{ item.size }}</p>
                <p *ngIf="item.color">Color: {{ item.color }}</p>
              </div>
              <div class="item-total">
                {{ item.price * item.quantity | currency }}
              </div>
            </div>
          </div>
          
          <div class="order-totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>{{ calculateSubtotal(cartItems | async) | currency }}</span>
            </div>
            <div class="total-row">
              <span>Shipping</span>
              <span>{{ selectedShipping.cost | currency }}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total</span>
              <!-- <span>{{ calculateTotal(cartItems | async) | currency }}</span> -->
               <span>{{ calculateTotal(cartItems | async) | currency }}</span>
            </div>
          </div>
        </div>
        
        <div class="step-actions">
          <button class="back-button" (click)="prevStep()">Back</button>
          <button class="place-order-button" (click)="placeOrder()">Place Order</button>
        </div>
      </div>
      
      <!-- Order Complete -->
      <div class="order-complete" *ngIf="orderComplete">
        <div class="complete-message">
          <i class="icon-check-circle"></i>
          <h2>Order Confirmed!</h2>
          <p>Thank you for your purchase. Your order has been received.</p>
          <p class="order-number">Order #{{ orderDetails.orderId }}</p>
          
          <div class="order-details">
            <div class="detail">
              <span>Tracking Number:</span>
              <strong>{{ orderDetails.trackingNumber }}</strong>
            </div>
            <div class="detail">
              <span>Estimated Delivery:</span>
              <strong>3-5 business days</strong>
            </div>
          </div>
          
          <button class="continue-shopping" (click)="router.navigate(['/shop'])">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
    
    <div class="order-summary-sidebar" *ngIf="currentStep !== 'shipping' && !orderComplete">
      <h3>Order Summary</h3>
      
      <div class="order-items">
        <div class="order-item" *ngFor="let item of cartItems | async">
          <img [src]="item.image" [alt]="item.name">
          <div class="item-details">
            <h4>{{ item.name }}</h4>
            <p>{{ item.quantity }} × {{ item.price | currency }}</p>
          </div>
        </div>
      </div>
      
      <div class="order-totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>{{ calculateSubtotal() | currency }}</span>
        </div>
        <div class="total-row">
          <span>Shipping</span>
          <span>{{ selectedShipping.cost | currency }}</span>
        </div>
        <div class="total-row grand-total">
          <span>Total</span>
          <!-- <span>{{ calculateTotal() | currency }}</span> -->
           <span>{{ calculateTotal(cartItems | async) | currency }}</span>
        </div>
      </div>
    </div>
  </div>
</div>
`,
styles: [`
    .checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-content {
  display: flex;
  gap: 30px;
  margin-top: 30px;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
}

.checkout-steps {
  flex: 1;
  
  .step {
    background: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    
    h2 {
      margin-top: 0;
      color: #333;
    }
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  
  .form-group {
    margin-bottom: 15px;
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }
    
    input, select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    &.full-width {
      grid-column: 1 / -1;
    }
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
}

.shipping-methods {
  margin-bottom: 30px;
  
  h3 {
    margin-bottom: 15px;
    color: #333;
  }
  
  .method-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    label {
      display: block;
      cursor: pointer;
      
      input {
        display: none;
        
        &:checked + .method-card {
          border-color: #2196F3;
          background: #f5f9ff;
        }
      }
    }
    
    .method-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: #999;
      }
      
      .method-info {
        h4 {
          margin: 0 0 5px;
          font-size: 16px;
        }
        
        p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
      }
      
      .method-price {
        font-weight: 600;
        font-size: 16px;
      }
    }
  }
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
  
  label {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: #999;
    }
    
    input {
      margin: 0;
    }
  }
}

.credit-card-form {
  margin-bottom: 30px;
  
  .form-row {
    display: flex;
    gap: 20px;
    
    .form-group {
      flex: 1;
    }
  }
}

.order-summary {
  .shipping-summary, .payment-summary {
    margin-bottom: 30px;
    
    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
    }
    
    p {
      margin: 5px 0;
    }
  }
  
  .order-items {
    margin-bottom: 30px;
    
    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
    }
    
    .order-item {
      display: flex;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid #eee;
      
      img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
      }
      
      .item-details {
        flex: 1;
        
        h4 {
          margin: 0 0 5px;
          font-size: 16px;
        }
        
        p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
      }
      
      .item-total {
        font-weight: 600;
      }
    }
  }
  
  .order-totals {
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
      
      &.grand-total {
        font-weight: 600;
        font-size: 18px;
        border-bottom: none;
      }
    }
  }
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  
  button {
    padding: 12px 25px;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .back-button {
    background: #f5f5f5;
    border: none;
    color: #333;
    
    &:hover {
      background: #eee;
    }
  }
  
  .continue-button, .place-order-button {
    background: #2196F3;
    border: none;
    color: white;
    
    &:hover {
      background: #0d8aee;
    }
  }
  
  .place-order-button {
    background: #4CAF50;
    
    &:hover {
      background: #3d8b40;
    }
  }
}

.order-complete {
  text-align: center;
  padding: 40px 20px;
  
  i {
    font-size: 60px;
    color: #4CAF50;
    margin-bottom: 20px;
  }
  
  h2 {
    margin: 0 0 15px;
    color: #333;
  }
  
  p {
    margin: 0 0 15px;
    color: #666;
    font-size: 16px;
    
    &.order-number {
      font-weight: 600;
      font-size: 18px;
      color: #333;
    }
  }
  
  .order-details {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 15px;
    max-width: 400px;
    margin: 20px auto;
    
    .detail {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .continue-shopping {
    padding: 12px 25px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
    margin-top: 20px;
    
    &:hover {
      background: #0d8aee;
    }
  }
}

.order-summary-sidebar {
  width: 300px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 20px;
  
  @media (max-width: 992px) {
    width: 100%;
    position: static;
  }
  
  h3 {
    margin-top: 0;
    color: #333;
  }
  
  .order-items {
    max-height: 300px;
    overflow-y: auto;
    margin: 20px 0;
    
    .order-item {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      
      img {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 4px;
      }
      
      .item-details {
        flex: 1;
        
        h4 {
          margin: 0 0 5px;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        p {
          margin: 0;
          font-size: 13px;
          color: #666;
        }
      }
    }
  }
  
  .order-totals {
    border-top: 1px solid #eee;
    padding-top: 15px;
    
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      
      &.grand-total {
        font-weight: 600;
        font-size: 16px;
      }
    }
  }
}
`]
})
export class CheckoutComponent {
  currentStep: 'shipping' | 'payment' | 'review' = 'shipping';
  cartItems: any;
  
  shippingMethods: any;
  selectedShipping: any;
  
  paymentMethods = ['Credit Card', 'Mobile Money', 'PayPal'];
  selectedPayment = this.paymentMethods[0];
  
  shippingInfo = {
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
    phone: '',
    email: ''
  };
  
  paymentInfo = {
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  };
  
  orderComplete = false;
  orderDetails: any;

  constructor(
    private cartService: CartService,
    private checkoutService: CheckoutService,
    public router: Router
  ) {
    this.cartItems = this.cartService.cartItems$;
    this.shippingMethods = this.checkoutService.getShippingMethods(0);
    this.selectedShipping = this.shippingMethods[0];
  }
  
  nextStep() {
    if (this.currentStep === 'shipping') {
      this.currentStep = 'payment';
    } else if (this.currentStep === 'payment') {
      this.currentStep = 'review';
    }
  }
  
  prevStep() {
    if (this.currentStep === 'payment') {
      this.currentStep = 'shipping';
    } else if (this.currentStep === 'review') {
      this.currentStep = 'payment';
    }
  }
  
  placeOrder() {
    this.cartService.cartItems$.subscribe(cartItems => {
      this.checkoutService.processPayment(this.paymentInfo, cartItems)
        .then((result: any) => {
          this.orderComplete = true;
          this.orderDetails = result;
          this.cartService.clearCart();
        });
    }).unsubscribe();
  }
  
 calculateSubtotal(cartItems: any[] | null = []): number {
  const items = cartItems ?? [];
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

calculateTotal(cartItems: any[] | null = []): number {
  const items = cartItems ?? [];
  return this.calculateSubtotal(items) + (this.selectedShipping?.cost || 0);
}
}