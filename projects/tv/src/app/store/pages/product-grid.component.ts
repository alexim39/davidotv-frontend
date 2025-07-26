import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface Product {
  id: string;
  name: string;
  image: string;
  isNew: boolean;
  isLimited: boolean;
  rating: number;
  reviews: number;
  price: number;
}

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="product-grid-container">
      @if (!products || products.length === 0) {
        <div class="empty-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading products...</p>
        </div>
      } @else {
        <div class="product-grid">
          @for (product of products; track product.id) {
            <mat-card class="product-card" [routerLink]="['/store/product', product.id]">
              <!-- Product Image with Badges -->
              <div class="product-image-container">
                <img [src]="product.image" [alt]="product.name" class="product-image">
                @if (product.isNew) {
                  <mat-chip class="new-badge" color="accent" selected>NEW</mat-chip>
                }
                @if (product.isLimited) {
                  <mat-chip class="limited-badge" color="warn" selected>
                    <mat-icon>whatshot</mat-icon>
                    LIMITED
                  </mat-chip>
                }
                <div class="quick-actions">
                  <button mat-icon-button class="quick-action-btn" (click)="addToWishlist($event, product)" aria-label="Add to wishlist">
                    <mat-icon>favorite_border</mat-icon>
                  </button>
                  <button mat-icon-button class="quick-action-btn" (click)="onQuickView($event, product)" aria-label="Quick view">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Product Info -->
              <div class="product-info">
                <h3 class="product-title" [matTooltip]="product.name">{{truncateName(product.name)}}</h3>
                <div class="product-meta">
                  <div class="product-rating">
                    @for (star of [1,2,3,4,5]; track star) {
                      <mat-icon [class.filled]="star <= product.rating">star</mat-icon>
                    }
                    <span>({{product.reviews}})</span>
                  </div>
                  <span class="product-price">N{{formatPrice(product.price)}}</span>
                </div>
              </div>

              <!-- Add to Cart -->
              <div class="product-actions">
                <button mat-raised-button color="primary" class="add-to-cart" (click)="addToCart($event, product)">
                  <mat-icon>add_shopping_cart</mat-icon>
                  Add to Cart
                </button>
              </div>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
styles: [`
    .product-grid-container {
      padding: 16px 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #666;

      p {
        margin-top: 16px;
        font-size: 14px;
      }
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      padding: 8px;
    }

    .product-card {
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
      }
    }

    .product-image-container {
      position: relative;
      padding-top: 100%; /* 1:1 Aspect Ratio */
      overflow: hidden;

      .product-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      &:hover .product-image {
        transform: scale(1.05);
      }

      mat-chip {
        position: absolute;
        top: 12px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.5px;

        &.new-badge {
          left: 12px;
        }

        &.limited-badge {
          right: 12px;
          mat-icon {
            font-size: 16px;
            height: 16px;
            width: 16px;
            margin-right: 4px;
          }
        }
      }

      .quick-actions {
        position: absolute;
        bottom: 12px;
        right: 12px;
        display: flex;
        gap: 8px;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;

        .quick-action-btn {
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          width: 36px;
          height: 36px;

          &:hover {
            background: white;
            color: #ff4081;
          }

          mat-icon {
            font-size: 18px;
          }
        }
      }

      &:hover .quick-actions {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .product-info {
      padding: 16px;

      .product-title {
        margin: 0 0 8px;
        font-size: 16px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .product-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .product-rating {
        display: flex;
        align-items: center;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: #ddd;

          &.filled {
            color: #ffc107;
          }
        }

        span {
          margin-left: 4px;
          font-size: 12px;
          color: #666;
        }
      }

      .product-price {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }

    .product-actions {
      padding: 0 16px 16px;

      .add-to-cart {
        width: 100%;
        font-weight: 500;
        letter-spacing: 0.5px;

        mat-icon {
          margin-right: 8px;
        }
      }
    }

    @media (max-width: 960px) {
      .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }
    }

    @media (max-width: 600px) {
      .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
      }

      .product-info {
        padding: 12px;

        .product-title {
          font-size: 14px;
        }

        .product-price {
          font-size: 16px;
        }
      }
    }
  `]
})
export class ProductGridComponent {
  @Input() products: Product[] = [];
  @Output() quickView = new EventEmitter<any>();

  truncateName(name: string, limit: number = 24): string {
    return name.length > limit ? `${name.substring(0, limit)}...` : name;
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  addToCart(event: Event, product: Product) {
    event.stopPropagation();
    console.log('Added to cart:', product);
  }

  addToWishlist(event: Event, product: Product) {
    event.stopPropagation();
    console.log('Added to wishlist:', product);
  }

  onQuickView(event: Event, product: Product) {
    event.stopPropagation();
    console.log('Quick view:', product, this.quickView);
  }
}