import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService } from '../../../common/services/api.service';
import { ProductInterface } from '../../services/store.service';

export interface CartInterface {
  _id: string;
  product: ProductInterface;
  quantity: number;
  selectedVariant?: {
    name: string;
    option: string;
  };
  priceAtAddition: number;
}


@Injectable()
export class CartService {
  private readonly baseUrl = 'cart'; // Adjust based on your API endpoint
  cartUpdates$ = new BehaviorSubject<void>(undefined);

  constructor(private apiService: ApiService) {}

  getCart(): Observable<any> {
    return this.apiService.get<{ data: any }>(`${this.baseUrl}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching cart:', error);
        return of(null);
      })
    );
  }

 /*  updateCartItem(itemId: string, quantity: number): Observable<any> {
    return this.apiService.patch<{ data: any }>(
      `${this.baseUrl}/items/${itemId}`,
      { quantity }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error updating cart item:', error);
        return of(null);
      })
    );
  } */

    updateCartItem(itemId: string, quantity: number): Observable<any> {
        return this.apiService.patch<{ data: any }>(
            `${this.baseUrl}/items/${itemId}`,
            { quantity }
        ).pipe(
            map(response => {
            this.cartUpdates$.next(); // Notify subscribers
            return response.data;
            }),
            catchError(error => {
            console.error('Error updating cart item:', error);
            return of(null);
            })
        );
    }

  /* removeCartItem(itemId: string): Observable<boolean> {
    return this.apiService.delete<{ success: boolean }>(
      `${this.baseUrl}/items/${itemId}`
    ).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error removing cart item:', error);
        return of(false);
      })
    );
  } */

    removeCartItem(itemId: string): Observable<boolean> {
        return this.apiService.delete<{ success: boolean }>(
            `${this.baseUrl}/items/${itemId}`
        ).pipe(
            map(() => {
            this.cartUpdates$.next(); // Notify subscribers
            return true;
            }),
            catchError(error => {
            console.error('Error removing cart item:', error);
            return of(false);
            })
        );
    }

  applyDiscount(code: string): Observable<{ amount: number } | null> {
    return this.apiService.post<{ data: { amount: number } }>(
      `${this.baseUrl}/discount`,
      { code }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error applying discount:', error);
        return of(null);
      })
    );
  }

  addToCart(item: {
    product: string;
    quantity: number;
    priceAtAddition: number;
    selectedVariant?: { name: string; option: string };
  }): Observable<any> {
    return this.apiService.post(`${this.baseUrl}/items`, item).pipe(
      tap(() => this.cartUpdates$.next()),
      catchError(error => {
        console.error('Error adding to cart:', error);
        return of(null);
      })
    );
  }

  // Add this to expose the updates observable
  get cartUpdates(): Observable<void> {
    return this.cartUpdates$.asObservable();
  }
}