import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../models/product.model';

@Component({
selector: 'app-product-card',
standalone: true,
imports: [CommonModule, RouterModule],
template: `

<div class="product-card" [class.featured]="product.isFeatured">
  <div class="badges">
    <span *ngIf="product.isNew" class="badge new">New</span>
    <span *ngIf="product.isFeatured" class="badge featured">Featured</span>
    <span *ngIf="product.isLimited" class="badge limited">Limited</span>
  </div>
  
  <div class="image-container">
    <img [src]="product.images[0]" [alt]="product.name" class="product-image">
    <div class="hover-actions">
      <button class="quick-view" (click)="onQuickView()">
        <i class="icon-eye"></i>
      </button>
      <button class="wishlist" (click)="onAddToWishlist()">
        <i class="icon-heart"></i>
      </button>
    </div>
  </div>
  
  <div class="product-info">
    <h3 class="product-name">{{ product.name }}</h3>
    <div class="price-container">
      <span class="current-price">{{ product.price | currency }}</span>
      <span *ngIf="product.originalPrice" class="original-price">{{ product.originalPrice | currency }}</span>
    </div>
    <div class="rating">
      <!-- <app-review-stars [rating]="product.rating"></app-review-stars> -->
      <span class="review-count">({{ product.reviewCount }})</span>
    </div>
    <button class="add-to-cart" (click)="onAddToCart()">Add to Cart</button>
  </div>
</div>

`,
styles: [`

  .product-card {
  position: relative;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
  
  &:hover {
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    transform: translateY(-5px);
    
    .hover-actions {
      opacity: 1;
    }
  }

  .badges {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 2;
    
    .badge {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      color: white;
      margin-right: 5px;
      
      &.new {
        background: #4CAF50;
      }
      
      &.featured {
        background: #FF5722;
      }
      
      &.limited {
        background: #9C27B0;
      }
    }
  }

  .image-container {
    position: relative;
    overflow: hidden;
    aspect-ratio: 1/1;
    
    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    
    &:hover .product-image {
      transform: scale(1.05);
    }
    
    .hover-actions {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      button {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: white;
        border: none;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          background: #f8f8f8;
          transform: scale(1.1);
        }
        
        i {
          font-size: 16px;
          color: #333;
        }
      }
    }
  }

  .product-info {
    padding: 15px;
    
    .product-name {
      font-size: 16px;
      margin: 0 0 8px;
      font-weight: 600;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .price-container {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      
      .current-price {
        font-size: 18px;
        font-weight: bold;
        color: #E91E63;
      }
      
      .original-price {
        font-size: 14px;
        color: #999;
        text-decoration: line-through;
      }
    }
    
    .rating {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 12px;
      
      .review-count {
        font-size: 12px;
        color: #777;
      }
    }
    
    .add-to-cart {
      width: 100%;
      padding: 8px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
      
      &:hover {
        background: #0d8aee;
      }
    }
  }
}

`]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<Product>();

  onAddToCart() {
    this.addToCart.emit(this.product);
  }

  onQuickView() {
    this.quickView.emit(this.product);
  }

  onAddToWishlist() {
    this.addToWishlist.emit(this.product);
  }
}