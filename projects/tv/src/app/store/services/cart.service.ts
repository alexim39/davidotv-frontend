import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();

  addToCart(item: CartItem) {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(i => 
      i.productId === item.productId && 
      i.size === item.size && 
      i.color === item.color
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      currentItems.push(item);
    }

    this.cartItems.next([...currentItems]);
  }

  removeFromCart(itemId: string) {
    const updatedItems = this.cartItems.value.filter(item => item.id !== itemId);
    this.cartItems.next(updatedItems);
  }

  updateQuantity(itemId: string, quantity: number) {
    const updatedItems = this.cartItems.value.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity };
      }
      return item;
    });
    this.cartItems.next(updatedItems);
  }

  getCartCount() {
    return this.cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
  }

   clearCart() {
    this.cartItems.next([]);
  }
}