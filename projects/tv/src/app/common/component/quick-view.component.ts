import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { ProductInterface } from '../../store/services/store.service';

@Component({
  selector: 'async-quick-view',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    CurrencyPipe,
    MatChipsModule
  ],
  template: `
    <div class="quick-view-dialog">
      <div class="dialog-header">
        <h2 class="dialog-title">{{data.name}}</h2>
        <button mat-icon-button (click)="onClose()" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <div class="dialog-content">
        <div class="product-image-container">
          <img [src]="data.images[0].url || './assets/images/placeholder-product.jpg'" [alt]="data.name" class="product-image">
          <div class="badge-container">
            @if (data.isNewProduct) {
              <mat-chip class="new-chip" color="primary" selected>
                <mat-icon>fiber_new</mat-icon>
                NEW
              </mat-chip>
            }
            @if (data.isFeatured) {
              <mat-chip class="trending-chip" selected>
                <mat-icon>whatshot</mat-icon>
                TRENDING
              </mat-chip>
            }
            @if (data.isLimitedEdition) {
              <mat-chip class="limited-chip" selected>
                <mat-icon>star</mat-icon>
                LIMITED
              </mat-chip>
            }
          </div>
        </div>

        <div class="product-details">
          <div class="price-section">
            @if (data.discountedPrice) {
              <div class="discount-price">
                <span class="original-price">{{data.price | currency:'NGN':'symbol':'1.2-2'}}</span>
                <span class="current-price">{{data.discountedPrice | currency:'NGN':'symbol':'1.2-2'}}</span>
                <span class="discount-percent">-{{calculateDiscountPercent(data.price, data.discountedPrice)}}%</span>
              </div>
            } @else {
              <div class="price">{{data.price | currency:'NGN':'symbol':'1.2-2'}}</div>
            }
          </div>

          <div class="product-meta">
            <div class="category">
              <mat-icon class="meta-icon">category</mat-icon>
              <span>{{data.categories[0] || 'Uncategorized'}}</span>
            </div>
            
            <div class="rating">
              <mat-icon class="meta-icon">star_rate</mat-icon>
              <span>
                {{data.rating.average || 0}} 
                ({{data.rating.count || 0}} reviews)
              </span>
            </div>
          </div>

          <div class="product-description">
            <h3>Description</h3>
            <p>{{data.description || 'No description available'}}</p>
          </div>

          <div class="action-buttons">
           <!--  <button mat-flat-button color="primary" class="add-to-cart" (click)="addToCart()">
              <mat-icon>add_shopping_cart</mat-icon>
              Add to Cart
            </button> -->
            <button mat-stroked-button color="primary" class="view-details" (click)="viewFullDetails()">
              <mat-icon>visibility</mat-icon>
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quick-view-dialog {
      max-width: 900px;
      width: 100%;
      padding: 0;
      overflow: hidden;

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;

        .dialog-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 500;
        }

        button {
          color: #666;
          transition: all 0.2s ease;

          &:hover {
            color: #8f0045;
            background-color: rgba(143, 0, 69, 0.08);
          }
        }
      }

      .dialog-content {
        display: flex;
        flex-direction: column;
        padding: 24px;

        @media (min-width: 768px) {
          flex-direction: row;
          gap: 32px;
        }
      }

      .product-image-container {
        position: relative;
        flex: 1;
        max-width: 400px;
        border-radius: 12px;
        overflow: hidden;
        aspect-ratio: 1 / 1;
        margin-bottom: 16px;

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .badge-container {
          position: absolute;
          top: 12px;
          left: 120px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 2;
          
          mat-chip {
            font-size: 0.5rem;
            //font-weight: 600;
            //height: 24px;
            border-radius: 12px;
            padding: 0 2px;
            background: rgba(0, 0, 0, 0.8);
            
            mat-icon {
              font-size: 18px;
              height: 15px;
              width: 15px;
              margin-right: 4px;
            }
          }

        }
      }

      .product-details {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .price-section {
        margin-bottom: 20px;

        .price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #8f0045;
        }

        .discount-price {
          display: flex;
          align-items: center;
          gap: 12px;

          .original-price {
            font-size: 1rem;
            color: #999;
            text-decoration: line-through;
          }

          .current-price {
            font-size: 1.5rem;
            font-weight: 700;
            color: #8f0045;
          }

          .discount-percent {
            font-size: 0.875rem;
            font-weight: 700;
            background-color: #FF4D4D;
            padding: 4px 8px;
            border-radius: 4px;
            color: white;
          }
        }
      }

      .product-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 24px;

        .category, .rating {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: #666;

          .meta-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }

      .product-description {
        margin-bottom: 24px;

        h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 8px;
          color: #666;
        }

        p {
          font-size: 0.9375rem;
          line-height: 1.6;
          color: #666;
          margin: 0;
        }
      }

      .action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: auto;

        button {
          flex: 1;
          min-width: 200px;
          padding: 8px 16px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        .add-to-cart {
          &:hover {
            box-shadow: 0 4px 12px rgba(143, 0, 69, 0.3);
          }
        }

        .view-details {
          &:hover {
            background-color: rgba(143, 0, 69, 0.08);
          }
        }
      }
    }

    @media (max-width: 600px) {
      .quick-view-dialog {
        .dialog-content {
          padding: 16px;
        }

        .action-buttons {
          button {
            min-width: 100%;
          }
        }
      }
    }
  `]
})
export class QuickViewComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<QuickViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductInterface
  ) {}

  ngOnInit(): void {
    // You can add initialization logic here if needed
  }

  onClose(): void {
    this.dialogRef.close();
  }

  addToCart(): void {
    this.dialogRef.close('added_to_cart');
  }

  viewFullDetails(): void {
    this.dialogRef.close('view_details');
  }

  calculateDiscountPercent(originalPrice: number, discountedPrice: number): number {
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  }
}