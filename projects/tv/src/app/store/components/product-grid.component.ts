import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product.model';
import { ProductCardComponent } from './product-card.component';

@Component({
selector: 'app-product-grid',
standalone: true,
imports: [CommonModule, ProductCardComponent],
template: `

<div class="product-grid" [class.minimal]="gridLayout === 'minimal'">
  <app-product-card 
    *ngFor="let product of products" 
    [product]="product"
    (addToCart)="onAddToCart($event)"
    (quickView)="onQuickView($event)"
    (addToWishlist)="onAddToWishlist($event)"
  ></app-product-card>
</div>

<ng-container *ngIf="products.length === 0">
  <div class="empty-state">
    <i class="icon-search"></i>
    <h3>No products found</h3>
    <p>Try adjusting your search or filter to find what you're looking for.</p>
  </div>
</ng-container>

`,
styles: [`

.product-grid {
  display: grid;
  gap: 20px;
  padding: 15px 0;

  &.minimal {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    
    app-product-card {
      .product-name {
        font-size: 14px;
      }
      
      .price-container {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
      }
      
      .add-to-cart {
        padding: 6px;
        font-size: 14px;
      }
    }
  }

  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  @media (min-width: 576px) and (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  color: #666;
  
  i {
    font-size: 48px;
    margin-bottom: 20px;
    color: #ddd;
  }
  
  h3 {
    font-size: 20px;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 16px;
    max-width: 500px;
    margin: 0 auto;
  }
}

`]
})
export class ProductGridComponent {
  @Input() products: Product[] = [];
  @Input() gridLayout: 'standard' | 'minimal' = 'standard';

  onAddToWishlist(e: any) {}
  onQuickView(e: any) {}
  onAddToCart(e: any) {}
}