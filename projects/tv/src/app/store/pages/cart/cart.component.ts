import { Component, OnInit } from '@angular/core';
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
import { StoreService, ProductInterface } from '../../services/store.service';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { CartInterface, CartService } from './cart.service';



@Component({
  selector: 'app-cart-page',
  providers: [CartService, StoreService],
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
  templateUrl: './cart.component.html', // Separated template
  styleUrls: ['./cart.component.scss'] // Separated styles
})
export class CartPageComponent implements OnInit {
  isLoading = true;
  cartItems: CartInterface[] = [];
  discountCode = '';
  discountApplied = false;
  discountAmount = 0;

  constructor(
    private snackBar: MatSnackBar,
    private cartService: CartService,
    private storeService: StoreService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.getCart().pipe(
      switchMap(cart => {
        if (!cart || !cart.items || cart.items.length === 0) {
          return of([]);
        }
        
        // Fetch product details for each cart item
        const productIds = cart.items.map((item: CartInterface) => item.product);
        return this.storeService.getProductsByIds(productIds).pipe(
          map(products => {
            return cart.items.map((item: CartInterface) => {
              const product = products.find(p => p._id === item.product.toString());
              return {
                id: item._id,
                product: product,
                quantity: item.quantity,
                selectedVariant: item.selectedVariant,
                priceAtAddition: item.priceAtAddition
              };
            });
          })
        );
      }),
      catchError(error => {
        console.error('Error loading cart:', error);
        this.snackBar.open('Error loading cart', 'Dismiss', { duration: 2000 });
        return of([]);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(items => {
      this.cartItems = items;
    });
  }

  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.priceAtAddition * item.quantity), 0);
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

  increaseQuantity(item: CartInterface): void {
    if (!item.product.inventory || item.quantity < item.product.inventory.stock) {
      this.updateCartItem(item, item.quantity + 1);
    } else {
      this.snackBar.open('Maximum available quantity reached', 'Dismiss', {
        duration: 2000
      });
    }
  }

  decreaseQuantity(item: CartInterface): void {
    if (item.quantity > 1) {
      this.updateCartItem(item, item.quantity - 1);
    }
  }

  updateCartItem(item: CartInterface, newQuantity: number): void {
    this.isLoading = true;
    this.cartService.updateCartItem(item._id, newQuantity).pipe(
      catchError(error => {
        console.error('Error updating cart:', error);
        this.snackBar.open('Error updating cart', 'Dismiss', { duration: 2000 });
        return of(null);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(updatedCart => {
      if (updatedCart) {
        item.quantity = newQuantity;
        this.snackBar.open('Cart updated', 'Dismiss', { duration: 2000 });
      }
    });
  }

  removeItem(item: CartInterface): void {
    this.isLoading = true;
    this.cartService.removeCartItem(item._id).pipe(
      catchError(error => {
        console.error('Error removing item:', error);
        this.snackBar.open('Error removing item', 'Dismiss', { duration: 2000 });
        return of(null);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(success => {
      if (success) {
        this.cartItems = this.cartItems.filter(i => i._id !== item._id);
        this.snackBar.open('Item removed from cart', 'Dismiss', { duration: 2000 });
      }
    });
  }

  applyDiscount(): void {
    if (!this.discountCode) return;

    this.isLoading = true;
    this.cartService.applyDiscount(this.discountCode).pipe(
      catchError(error => {
        console.error('Error applying discount:', error);
        this.snackBar.open('Invalid discount code', 'Dismiss', { 
          duration: 2000,
          panelClass: 'error-snackbar'
        });
        return of(null);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(discount => {
      if (discount) {
        this.discountAmount = discount.amount;
        this.discountApplied = true;
        this.snackBar.open('Discount applied successfully', 'Dismiss', {
          duration: 2000,
          panelClass: 'success-snackbar'
        });
      }
    });
  }
}