import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private shippingMethods = [
    { id: 'standard', name: 'Standard Shipping', cost: 5.99, estimatedDays: '3-5' },
    { id: 'express', name: 'Express Shipping', cost: 12.99, estimatedDays: '1-2' },
    { id: 'free', name: 'Free Shipping', cost: 0, estimatedDays: '5-7', minOrder: 50 }
  ];

  getShippingMethods(subtotal: number) {
    return this.shippingMethods.filter(method => 
      !method.minOrder || subtotal >= method.minOrder
    );
  }

  processPayment(paymentData: any, cartItems: CartItem[]) {
    // In a real app, this would call your backend API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          orderId: 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 10).toUpperCase()
        });
      }, 1500);
    });
  }
}