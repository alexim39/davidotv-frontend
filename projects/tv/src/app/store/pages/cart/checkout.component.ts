import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <div class="checkout-container">
      <!-- Checkout Header -->
      <div class="checkout-header">
        <h1>Checkout</h1>
        <div class="stepper-container">
          <mat-stepper linear #stepper>
            <mat-step [completed]="deliveryCompleted">
              <ng-template matStepLabel>Delivery</ng-template>
            </mat-step>
            <mat-step [completed]="paymentCompleted">
              <ng-template matStepLabel>Payment</ng-template>
            </mat-step>
            <mat-step [completed]="reviewCompleted">
              <ng-template matStepLabel>Review</ng-template>
            </mat-step>
          </mat-stepper>
        </div>
      </div>

      <!-- Checkout Content -->
      <div class="checkout-content">
        <!-- Delivery Section -->
        <mat-card class="checkout-section" *ngIf="currentStep === 1">
          <h2 class="section-title">Delivery Information</h2>
          
          <form [formGroup]="deliveryForm" class="delivery-form">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" required>
                <mat-error *ngIf="deliveryForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" required>
                <mat-error *ngIf="deliveryForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" required>
              <mat-error *ngIf="deliveryForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="deliveryForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone" required>
              <mat-error *ngIf="deliveryForm.get('phone')?.hasError('required')">
                Phone number is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Address</mat-label>
              <input matInput formControlName="address" required>
              <mat-error *ngIf="deliveryForm.get('address')?.hasError('required')">
                Address is required
              </mat-error>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>City</mat-label>
                <input matInput formControlName="city" required>
                <mat-error *ngIf="deliveryForm.get('city')?.hasError('required')">
                  City is required
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>State</mat-label>
                <mat-select formControlName="state" required>
                  <mat-option *ngFor="let state of nigerianStates" [value]="state">
                    {{state}}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="deliveryForm.get('state')?.hasError('required')">
                  State is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Postal Code</mat-label>
              <input matInput formControlName="postalCode">
            </mat-form-field>

            <div class="shipping-method">
              <h3>Shipping Method</h3>
              <mat-radio-group formControlName="shippingMethod">
                <mat-radio-button value="standard" class="shipping-option">
                  <div class="option-content">
                    <span class="option-name">Standard Delivery</span>
                    <span class="option-details">3-5 business days</span>
                    <span class="option-price">N1,500</span>
                  </div>
                </mat-radio-button>
                
                <mat-radio-button value="express" class="shipping-option">
                  <div class="option-content">
                    <span class="option-name">Express Delivery</span>
                    <span class="option-details">1-2 business days</span>
                    <span class="option-price">N3,000</span>
                  </div>
                </mat-radio-button>
              </mat-radio-group>
            </div>

            <mat-checkbox formControlName="saveInfo">Save this information for next time</mat-checkbox>
          </form>

          <div class="section-actions">
            <button mat-stroked-button routerLink="/store/cart">
              <mat-icon>arrow_back</mat-icon>
              Back to Cart
            </button>
            <button mat-raised-button color="primary" (click)="submitDelivery()" [disabled]="deliveryForm.invalid">
              Continue to Payment
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </mat-card>

        <!-- Payment Section -->
        <mat-card class="checkout-section" *ngIf="currentStep === 2">
          <h2 class="section-title">Payment Method</h2>
          
          <form [formGroup]="paymentForm" class="payment-form">
            <mat-radio-group formControlName="paymentMethod" class="payment-options">
              <mat-radio-button value="card" class="payment-option">
                <div class="option-content">
                  <mat-icon>credit_card</mat-icon>
                  <span>Credit/Debit Card</span>
                </div>
              </mat-radio-button>
              
              <mat-radio-button value="transfer" class="payment-option">
                <div class="option-content">
                  <mat-icon>account_balance</mat-icon>
                  <span>Bank Transfer</span>
                </div>
              </mat-radio-button>
              
              <mat-radio-button value="paypal" class="payment-option">
                <div class="option-content">
                  <img src="assets/paypal-logo.png" alt="PayPal" class="paypal-logo">
                  <span>PayPal</span>
                </div>
              </mat-radio-button>
            </mat-radio-group>

            <div *ngIf="paymentForm.get('paymentMethod')?.value === 'card'" class="card-form">
              <mat-form-field appearance="outline">
                <mat-label>Card Number</mat-label>
                <input matInput formControlName="cardNumber" placeholder="1234 5678 9012 3456">
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Expiration Date</mat-label>
                  <input matInput formControlName="expiryDate" placeholder="MM/YY">
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>CVV</mat-label>
                  <input matInput formControlName="cvv" placeholder="123">
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Name on Card</mat-label>
                <input matInput formControlName="cardName">
              </mat-form-field>
            </div>

            <div *ngIf="paymentForm.get('paymentMethod')?.value === 'transfer'" class="transfer-info">
              <p>You'll receive our bank account details after placing your order. Please include your order number as the payment reference.</p>
            </div>

            <div *ngIf="paymentForm.get('paymentMethod')?.value === 'paypal'" class="paypal-info">
              <p>You'll be redirected to PayPal to complete your payment securely.</p>
            </div>
          </form>

          <div class="section-actions">
            <button mat-stroked-button (click)="backToDelivery()">
              <mat-icon>arrow_back</mat-icon>
              Back to Delivery
            </button>
            <button mat-raised-button color="primary" (click)="submitPayment()" [disabled]="paymentForm.invalid">
              Review Order
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </mat-card>

        <!-- Review Section -->
        <mat-card class="checkout-section" *ngIf="currentStep === 3">
          <h2 class="section-title">Review Your Order</h2>
          
          <div class="order-summary">
            <div class="summary-section">
              <h3>Delivery Information</h3>
              <div class="summary-content">
                <p>{{deliveryForm.value.firstName}} {{deliveryForm.value.lastName}}</p>
                <p>{{deliveryForm.value.address}}</p>
                <p>{{deliveryForm.value.city}}, {{deliveryForm.value.state}} {{deliveryForm.value.postalCode}}</p>
                <p>{{deliveryForm.value.email}}</p>
                <p>{{deliveryForm.value.phone}}</p>
                <p class="shipping-method">
                  Shipping Method: 
                  <strong>{{deliveryForm.value.shippingMethod === 'standard' ? 'Standard Delivery' : 'Express Delivery'}}</strong>
                </p>
              </div>
            </div>

            <div class="summary-section">
              <h3>Payment Method</h3>
              <div class="summary-content">
                <p *ngIf="paymentForm.value.paymentMethod === 'card'">
                  <mat-icon>credit_card</mat-icon>
                  Credit/Debit Card ending in ****
                </p>
                <p *ngIf="paymentForm.value.paymentMethod === 'transfer'">
                  <mat-icon>account_balance</mat-icon>
                  Bank Transfer
                </p>
                <p *ngIf="paymentForm.value.paymentMethod === 'paypal'">
                  <img src="assets/paypal-logo.png" alt="PayPal" class="paypal-logo">
                  PayPal
                </p>
              </div>
            </div>

            <div class="summary-section">
              <h3>Order Items ({{cartItems.length}})</h3>
              <div class="order-items">
                <div *ngFor="let item of cartItems" class="order-item">
                  <div class="item-image-container">
                    <img [src]="item.image" [alt]="item.name" class="item-image">
                    <span class="item-quantity">{{item.quantity}}</span>
                  </div>
                  <div class="item-details">
                    <p class="item-name">{{item.name}}</p>
                    <p *ngIf="item.variant" class="item-variant">{{item.variant}}</p>
                  </div>
                  <div class="item-price">N{{item.price * item.quantity | number:'1.2-2'}}</div>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="price-summary">
              <div class="price-row">
                <span>Subtotal</span>
                <span>N{{subtotal | number:'1.2-2'}}</span>
              </div>
              <div class="price-row">
                <span>Shipping</span>
                <span>{{shippingCost === 0 ? 'Free' : 'N' + (shippingCost | number:'1.2-2')}}</span>
              </div>
              <div *ngIf="discountAmount > 0" class="price-row discount">
                <span>Discount</span>
                <span>-N{{discountAmount | number:'1.2-2'}}</span>
              </div>
              <div class="price-row total">
                <span>Total</span>
                <span>N{{total | number:'1.2-2'}}</span>
              </div>
            </div>
          </div>

          <mat-checkbox [(ngModel)]="agreeTerms">I agree to the Terms of Service and Privacy Policy</mat-checkbox>

          <div class="section-actions">
            <button mat-stroked-button (click)="backToPayment()">
              <mat-icon>arrow_back</mat-icon>
              Back to Payment
            </button>
            <button mat-raised-button color="primary" (click)="placeOrder()" [disabled]="!agreeTerms || isPlacingOrder">
              <span *ngIf="!isPlacingOrder">Place Order</span>
              <span *ngIf="isPlacingOrder">Processing...</span>
              <mat-icon *ngIf="!isPlacingOrder">shopping_bag</mat-icon>
              <mat-spinner *ngIf="isPlacingOrder" diameter="20"></mat-spinner>
            </button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    .checkout-header {
      margin-bottom: 32px;
      text-align: center;

      h1 {
        font-size: 2rem;
        margin: 0 0 16px;
        font-weight: 500;
      }
    }

    .stepper-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .checkout-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .checkout-section {
      padding: 24px;
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 1.5rem;
      margin: 0 0 24px;
      font-weight: 500;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .shipping-method {
      margin: 24px 0;

      h3 {
        font-size: 1rem;
        margin: 0 0 12px;
        font-weight: 500;
      }
    }

    .shipping-option {
      display: block;
      margin-bottom: 12px;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;

      &.mat-radio-checked {
        border-color: #3f51b5;
        background: rgba(63, 81, 181, 0.05);
      }

      .option-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .option-name {
        font-weight: 500;
      }

      .option-details {
        color: #666;
        font-size: 0.9rem;
      }

      .option-price {
        font-weight: 500;
      }
    }

    .payment-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .payment-option {
      display: block;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;

      &.mat-radio-checked {
        border-color: #3f51b5;
        background: rgba(63, 81, 181, 0.05);
      }

      .option-content {
        display: flex;
        align-items: center;
        gap: 12px;

        .paypal-logo {
          height: 20px;
        }
      }
    }

    .card-form {
      margin: 24px 0;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }

    .transfer-info, .paypal-info {
      margin: 24px 0;
      padding: 16px;
      border-radius: 4px;
    }

    .section-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;

      button {
        mat-icon {
          margin-right: 8px;
        }
      }
    }

    .order-summary {
      .summary-section {
        margin-bottom: 24px;

        h3 {
          font-size: 1.1rem;
          margin: 0 0 12px;
          font-weight: 500;
        }
      }

      .shipping-method {
        margin: 16px 0;
      }
    }

    .order-items {
      .order-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }
      }

      .item-image-container {
        position: relative;
        width: 60px;
        height: 60px;
        margin-right: 16px;
        background: #f5f5f5;
        border-radius: 4px;
        overflow: hidden;

        .item-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .item-quantity {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #3f51b5;
          //color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
        }
      }

      .item-details {
        flex: 1;

        .item-name {
          margin: 0;
          font-size: 0.9rem;
        }

        .item-variant {
          margin: 4px 0 0;
          font-size: 0.8rem;
          color: #666;
        }
      }

      .item-price {
        font-weight: 500;
      }
    }

    .price-summary {
      margin: 24px 0;

      .price-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        &.discount {
          color: #f44336;
        }

        &.total {
          font-size: 1.1rem;
          font-weight: 500;
          margin-top: 16px;
          padding-top: 8px;
          border-top: 1px solid #eee;
        }
      }
    }

    mat-checkbox {
      display: block;
      margin: 24px 0;
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .section-actions {
        flex-direction: column-reverse;
        gap: 12px;

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class CheckoutPageComponent {
  currentStep = 1;
  deliveryCompleted = false;
  paymentCompleted = false;
  reviewCompleted = false;

  private fb = inject(FormBuilder);

  // Mock cart data - replace with actual service in production
  cartItems = [
    {
      id: '1',
      productId: '1',
      name: 'Official Davido 30BG Logo T-Shirt',
      image: 'https://m.media-amazon.com/images/I/61-jBuhtgZL._AC_UY1100_.jpg',
      price: 39.99,
      quantity: 2,
      variant: 'Large'
    },
    {
      id: '2',
      productId: '2',
      name: 'Limited Edition Davido Signed Album',
      image: 'https://static-01.daraz.com.np/p/7a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a.jpg',
      price: 199.99,
      quantity: 1
    }
  ];

  subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  shippingCost = 1500;
  discountAmount = 0;
  total = this.subtotal + this.shippingCost - this.discountAmount;

  // Nigerian states for dropdown
  nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 
    'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 
    'Zamfara'
  ];

  // Form groups
  deliveryForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postalCode: [''],
    shippingMethod: ['standard', Validators.required],
    saveInfo: [false]
  });

  paymentForm = this.fb.group({
    paymentMethod: ['card', Validators.required],
    cardNumber: [''],
    expiryDate: [''],
    cvv: [''],
    cardName: ['']
  });

  agreeTerms = false;
  isPlacingOrder = false;

  constructor(private snackBar: MatSnackBar) {}

  submitDelivery() {
    if (this.deliveryForm.valid) {
      this.deliveryCompleted = true;
      this.currentStep = 2;
      window.scrollTo(0, 0);
    }
  }

  submitPayment() {
    if (this.paymentForm.valid) {
      this.paymentCompleted = true;
      this.currentStep = 3;
      window.scrollTo(0, 0);
    }
  }

  backToDelivery() {
    this.currentStep = 1;
    window.scrollTo(0, 0);
  }

  backToPayment() {
    this.currentStep = 2;
    window.scrollTo(0, 0);
  }

  placeOrder() {
    this.isPlacingOrder = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isPlacingOrder = false;
      this.reviewCompleted = true;
      
      // In a real app, you would navigate to order confirmation page
      this.snackBar.open('Order placed successfully!', 'Dismiss', {
        duration: 5000,
        panelClass: 'success-snackbar'
      });
    }, 2000);
  }
}