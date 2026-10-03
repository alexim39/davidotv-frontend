import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// FE checkout wiring: real orders module (server-side quote, verified payment).
import { ApiService } from '../../core/services/api.service';

export interface OrderItemInput {
  productId: string;
  quantity: number;
  selectedVariant?: { name: string; option: string };
}

export interface PriceQuote {
  lines: unknown[];
  subtotal: number;
  discountPct: number;
  discount: number;
  shipping: number;
  shippingMethod: string;
  total: number;
  tier: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private static readonly BASE = 'api/v1/orders';

  constructor(private api: ApiService) {}

  quote(items: OrderItemInput[], shippingMethod = 'standard'): Observable<{ data: PriceQuote }> {
    return this.api.post(OrdersService.BASE + '/quote', { items, shippingMethod }) as any;
  }

  checkout(input: {
    items: OrderItemInput[];
    shippingMethod: string;
    shippingAddress?: unknown;
    paymentReference: string;
  }): Observable<{ data: unknown; idempotent?: boolean }> {
    return this.api.post(OrdersService.BASE + '/checkout', input) as any;
  }

  list(page = 1, limit = 12): Observable<unknown> {
    return this.api.get(`${OrdersService.BASE}?page=${page}&limit=${limit}`) as any;
  }
}
