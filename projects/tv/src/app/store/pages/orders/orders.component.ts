import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, catchError, forkJoin, map, of } from 'rxjs';
import { OrdersService } from '../../services/orders.service';
import { CartService } from '../cart/cart.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

export interface OrderLine {
  productId: string | null;
  quantity: number;
  price: number;
}

export interface OrderView {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  itemCount: number;
  itemNames: string[];
  lines: OrderLine[];
}

/**
 * Order history (/store/orders) + checkout success deep-link (?fresh=NUMBER).
 * Defensive parsing: the orders payload shape is backend-owned; unknown shapes
 * render with graceful fallbacks instead of blank screens.
 */
@Component({
  selector: 'app-orders-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  template: `
    <div class="orders-page">
      <h1 class="page-title">My Orders</h1>

      <div *ngIf="freshOrder" class="fresh-banner" role="status">
        <mat-icon aria-hidden="true">check_circle</mat-icon>
        <div>
          <strong>Order {{ freshOrder }} confirmed.</strong>
          <span>Receipt sent to your email — track it here any time.</span>
        </div>
      </div>

      <async-skeleton-loader *ngIf="loading" [count]="4" />

      <async-error-state
        *ngIf="!loading && loadError"
        [message]="loadError"
        (retry)="load()" />

      <async-empty-state
        *ngIf="!loading && !loadError && orders.length === 0"
        icon="receipt_long"
        title="No orders yet"
        message="Your confirmed orders and their status will appear here."
        actionLabel="Browse the store"
        (actionClicked)="browse()" />

      <div *ngIf="!loading && !loadError && orders.length > 0" class="orders-list">
        <article *ngFor="let o of orders; trackBy: trackById" class="order-card">
          <div class="order-head">
            <div>
              <div class="order-number">{{ o.orderNumber }}</div>
              <div class="order-date">{{ o.date }}</div>
            </div>
            <span class="status-pill" [attr.data-status]="o.status">{{ o.status }}</span>
          </div>
          <div class="order-lines">
            <span *ngFor="let n of o.itemNames">{{ n }}</span>
            <span *ngIf="o.itemCount > o.itemNames.length" class="more">+{{ o.itemCount - o.itemNames.length }} more</span>
          </div>
          <div class="order-foot">
            <span class="items">{{ o.itemCount }} item{{ o.itemCount === 1 ? '' : 's' }}</span>
            <span class="total">₦{{ o.total | number:'1.2-2' }}</span>
          </div>
          @if (reorderable(o)) {
            <button mat-stroked-button class="reorder-btn" (click)="buyAgain(o)" [disabled]="reordering()">
              <mat-icon>replay</mat-icon><span>{{ reordering() ? 'Adding…' : 'Buy again' }}</span>
            </button>
          }
        </article>
      </div>
    </div>
  `,
  styles: [`
    .orders-page { max-width: 860px; margin: 0 auto; padding: var(--dt-gutter); display: grid; gap: var(--dt-space-4); }
    .page-title { margin: 0; font: var(--dt-headline); color: var(--dt-text-1); }
    .fresh-banner {
      display: flex; gap: var(--dt-space-3); align-items: center;
      padding: var(--dt-space-4); border-radius: var(--dt-radius-card);
      background: rgba(74, 222, 128, 0.10); border: 1px solid rgba(74, 222, 128, 0.30);
      color: var(--dt-text-1); font: var(--dt-body);
    }
    .fresh-banner mat-icon { color: var(--dt-success); font-size: 28px; width: 28px; height: 28px; flex-shrink: 0; }
    .fresh-banner span { display: block; color: var(--dt-text-2); }
    .orders-list { display: grid; gap: var(--dt-space-3); }
    .order-card {
      background: var(--dt-card); border: 1px solid var(--dt-line);
      border-radius: var(--dt-radius-card); padding: var(--dt-space-4);
      display: grid; gap: var(--dt-space-2);
    }
    .order-head { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--dt-space-3); }
    .order-number { font: var(--dt-title-sm); color: var(--dt-text-1); }
    .order-date { font: var(--dt-caption); letter-spacing: var(--dt-letter-caption); color: var(--dt-text-3); margin-top: 2px; }
    .status-pill {
      font: var(--dt-caption); letter-spacing: var(--dt-letter-caption); text-transform: uppercase;
      padding: 6px 12px; border-radius: var(--dt-radius-pill);
      background: rgba(255, 255, 255, 0.08); color: var(--dt-text-2); flex-shrink: 0;
    }
    .status-pill[data-status="pending"] { background: rgba(251, 191, 36, 0.14); color: var(--dt-warn); }
    .status-pill[data-status="processing"] { background: rgba(125, 211, 252, 0.14); color: var(--dt-info); }
    .status-pill[data-status="shipped"] { background: var(--dt-gradient-soft); color: var(--dt-accent-3); }
    .status-pill[data-status="delivered"] { background: rgba(74, 222, 128, 0.14); color: var(--dt-success); }
    .status-pill[data-status="cancelled"], .status-pill[data-status="failed"] { background: rgba(248, 113, 113, 0.14); color: var(--dt-danger); }
    .order-lines { display: flex; flex-wrap: wrap; gap: 6px; font: var(--dt-body-sm); color: var(--dt-text-2); }
    .order-lines .more { color: var(--dt-text-3); }
    .order-foot { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--dt-line); padding-top: var(--dt-space-3); }
    .items { font: var(--dt-caption); letter-spacing: var(--dt-letter-caption); color: var(--dt-text-3); }
    .total { font: var(--dt-title-sm); color: var(--dt-accent-3); }
    .reorder-btn { justify-self: start; min-height: var(--dt-target); border-radius: var(--dt-radius-pill); color: var(--dt-text-1); border-color: var(--dt-line-strong); }
  `]
})
export class OrdersHistoryComponent implements OnInit, OnDestroy {
  orders: OrderView[] = [];
  loading = true;
  loadError: string | null = null;
  freshOrder: string | null = null;

  private readonly ordersService = inject(OrdersService);
  private readonly cartService = inject(CartService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subs: Subscription[] = [];
  reordering = signal(false);

  ngOnInit(): void {
    this.freshOrder = this.route.snapshot.queryParamMap.get('fresh');
    this.load();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.subs.push(this.fetch());
  }

  private fetch(): Subscription {
    return (this.ordersService.list() as any).subscribe({
      next: (res: any) => {
        const raw = res?.data?.orders ?? res?.data ?? res?.orders ?? res ?? [];
        const list = Array.isArray(raw) ? raw : [];
        this.orders = list.map((o: any) => this.toView(o)).filter((o) => o.id);
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.loadError =
          err?.error?.message || err?.message || 'We could not load your orders. Check your connection and try again.';
      },
    });
  }

  trackById(_index: number, o: OrderView): string {
    return o.id;
  }

  browse(): void {
    this.router.navigate(['/store']);
  }

  private toView(o: any): OrderView {
    const id = String(o?._id ?? o?.id ?? o?.orderNumber ?? '');
    const items = Array.isArray(o?.items) ? o.items : [];
    const names = items
      .map((i: any) => i?.product?.name ?? i?.name ?? i?.title)
      .filter(Boolean)
      .slice(0, 3);
    const count = o?.itemCount ?? items.reduce((n: number, i: any) => n + (Number(i?.quantity) || 1), 0) ?? items.length;
    const total = Number(o?.total ?? o?.totalPrice ?? o?.amount ?? 0) || 0;
    const rawDate = o?.createdAt ?? o?.date ?? o?.placedAt;
    let date = 'Date unavailable';
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    return {
      id,
      orderNumber: String(o?.orderNumber ?? (id ? `#${id.slice(-8).toUpperCase()}` : 'Order')),
      date,
      status: String(o?.status ?? 'pending').toLowerCase(),
      total,
      itemCount: count,
      itemNames: names,
      lines: items.map((i: any) => ({
        productId: i?.product?._id ?? i?.product?.id ?? i?.productId ?? i?.id ?? null,
        quantity: Number(i?.quantity) || 1,
        price: Number(i?.priceAtAddition ?? i?.price ?? 0) || 0,
      })),
    };
  }

  /** Only orders whose lines still reference products can be reordered. */
  reorderable(o: OrderView): boolean {
    return o.lines.some((l) => !!l.productId);
  }

  buyAgain(o: OrderView): void {
    const lines = o.lines.filter((l) => !!l.productId);
    if (lines.length === 0 || this.reordering()) return;
    this.reordering.set(true);
    this.subs.push(
      forkJoin(lines.map((l) =>
        this.cartService.addToCart({
          productId: l.productId as string,
          quantity: l.quantity,
          priceAtAddition: l.price,
        }).pipe(
          map(() => true),
          catchError(() => of(false))
        )
      )).subscribe((results) => {
        this.reordering.set(false);
        const ok = results.filter(Boolean).length;
        const failed = results.length - ok;
        this.snackBar.open(
          failed > 0 ? `Re-added ${ok} items (${failed} unavailable)` : `Re-added ${ok} item${ok === 1 ? '' : 's'} to cart`,
          'View cart', { duration: 4000 }
        ).onAction().subscribe(() => this.router.navigate(['/store/cart']));
      })
    );
  }
}
