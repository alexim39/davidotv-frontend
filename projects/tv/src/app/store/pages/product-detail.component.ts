import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { ProductGalleryComponent } from '../components/product-gallery.component';
import { SizeSelectorComponent } from '../components/size-selector.component';
import { ColorSwatchComponent } from '../components/color-swatch.component';
import { QuantitySelectorComponent } from '../components/quantity-selector.component';
import { CartService } from '../services/cart.service';

@Component({
selector: 'app-product-detail',
standalone: true,
imports: [
  CommonModule,
  ProductGalleryComponent,
  SizeSelectorComponent,
  ColorSwatchComponent,
  QuantitySelectorComponent
],
template: `
<div class="product-detail-container">
  <div class="gallery-section">
    <app-product-gallery [images]="product.images" [videoUrl]="product.videoUrl"></app-product-gallery>
    
    <div *ngIf="product.hasAR" class="ar-try-on">
      <!-- <button (click)="activateAR()">Try It On with AR</button> -->
      <button>Try It On with AR</button>
    </div>
  </div>
  
  <div class="info-section">
    <h1 class="product-title">{{ product.name }}</h1>
    
    <div class="price-container">
      <span class="current-price">{{ product.price | currency }}</span>
      <span *ngIf="product.originalPrice" class="original-price">{{ product.originalPrice | currency }}</span>
      <span *ngIf="product.discountPercentage" class="discount">{{ product.discountPercentage }}% OFF</span>
    </div>
    
    <div class="rating-container">
      <!-- <app-review-stars [rating]="product.rating"></app-review-stars> -->
      <span class="review-count">{{ product.reviewCount }} reviews</span>
      <a href="#reviews" class="see-all">See all</a>
    </div>
    
    <div class="product-meta">
      <div class="availability">
        <i class="icon-check"></i>
        <span *ngIf="product.inStock; else outOfStock">
          In Stock ({{ product.stockQuantity }} available)
        </span>
        <ng-template #outOfStock>
          <span class="out-of-stock">Out of Stock</span>
        </ng-template>
      </div>
      
      <div class="sku">
        <span>SKU:</span> {{ product.sku }}
      </div>
      
      <div class="share">
        <span>Share:</span>
        <!-- <app-social-share [product]="product"></app-social-share> -->
      </div>
    </div>
    
    <div class="product-description">
      <p>{{ product.description }}</p>
    </div>
    
    <div class="variants">
      <div class="size-selector" *ngIf="product.sizes.length > 0">
        <h4>Size</h4>
        <app-size-selector 
          [sizes]="product.sizes" 
          (sizeSelected)="selectedSize = $event"
        ></app-size-selector>
      </div>
      
      <div class="color-selector" *ngIf="product.colors.length > 0">
        <h4>Color</h4>
        <app-color-swatch 
          [colors]="product.colors" 
          (colorSelected)="selectedColor = $event"
        ></app-color-swatch>
      </div>
    </div>
    
    <div class="quantity-selector">
      <h4>Quantity</h4>
      <app-quantity-selector 
          [max]="product.inStock ? (product.stockQuantity ?? 0) : 0"
        (quantityChange)="quantity = $event"
      ></app-quantity-selector>
    </div>
    
    <div class="action-buttons">
      <button class="add-to-cart" (click)="addToCart()" [disabled]="!product.inStock">
        Add to Cart
      </button>
      <button class="buy-now" [disabled]="!product.inStock">
        Buy Now
      </button>
      <button class="wishlist">
        <i class="icon-heart"></i> Add to Wishlist
      </button>
    </div>
    
    <div class="delivery-info">
      <div class="delivery-option">
        <i class="icon-truck"></i>
        <div>
          <strong>Free Shipping</strong>
          <p>On orders over $50</p>
        </div>
      </div>
      <div class="delivery-option">
        <i class="icon-undo"></i>
        <div>
          <strong>Easy Returns</strong>
          <p>30-day return policy</p>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="product-tabs">
  <div class="tabs-header">
    <button class="tab-button active">Description</button>
    <button class="tab-button">Additional Info</button>
    <button class="tab-button">Reviews ({{ product.reviewCount }})</button>
    <button class="tab-button">Shipping & Returns</button>
  </div>
  
  <div class="tabs-content">
    <div class="tab-panel active">
      <h3>Product Details</h3>
      <div [innerHTML]="product.longDescription"></div>
    </div>
  </div>
</div>

<div class="related-products">
  <h2>You May Also Like</h2>
  <!-- <app-product-grid [products]="relatedProducts" gridLayout="minimal"></app-product-grid> -->
</div>
`,
styles: [`

.product-detail-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px 0;

  @media (min-width: 992px) {
    flex-direction: row;
  }

  .gallery-section {
    flex: 1;
    
    .ar-try-on {
      margin-top: 20px;
      
      button {
        background: #333;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s ease;
        
        &:hover {
          background: #555;
        }
      }
    }
  }

  .info-section {
    flex: 1;
    padding: 0 15px;
    
    @media (min-width: 992px) {
      padding: 0 0 0 30px;
    }

    .product-title {
      font-size: 28px;
      margin: 0 0 15px;
      color: #333;
      font-weight: 700;
    }

    .price-container {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
      
      .current-price {
        font-size: 24px;
        font-weight: 700;
        color: #E91E63;
      }
      
      .original-price {
        font-size: 18px;
        color: #999;
        text-decoration: line-through;
      }
      
      .discount {
        background: #FFEB3B;
        color: #333;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
      }
    }

    .rating-container {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      
      .review-count {
        font-size: 14px;
        color: #666;
      }
      
      .see-all {
        font-size: 14px;
        color: #2196F3;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }

    .product-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
      
      .availability {
        display: flex;
        align-items: center;
        gap: 5px;
        
        i {
          color: #4CAF50;
        }
        
        .out-of-stock {
          color: #F44336;
        }
      }
      
      .sku {
        color: #666;
      }
      
      .share {
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }

    .product-description {
      margin-bottom: 20px;
      line-height: 1.6;
      color: #555;
    }

    .variants {
      margin-bottom: 25px;
      
      h4 {
        margin: 0 0 10px;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .quantity-selector {
      margin-bottom: 25px;
      
      h4 {
        margin: 0 0 10px;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 25px;
      
      button {
        padding: 12px 20px;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
      
      .add-to-cart {
        background: #2196F3;
        color: white;
        border: none;
        flex: 1;
        
        &:hover:not(:disabled) {
          background: #0d8aee;
        }
      }
      
      .buy-now {
        background: #E91E63;
        color: white;
        border: none;
        flex: 1;
        
        &:hover:not(:disabled) {
          background: #d81b60;
        }
      }
      
      .wishlist {
        background: white;
        color: #333;
        border: 1px solid #ddd;
        display: flex;
        align-items: center;
        gap: 5px;
        
        &:hover:not(:disabled) {
          background: #f9f9f9;
          border-color: #ccc;
        }
      }
    }

    .delivery-info {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 15px;
      
      .delivery-option {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        i {
          font-size: 20px;
          color: #2196F3;
        }
        
        strong {
          display: block;
          margin-bottom: 3px;
        }
        
        p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
}

.product-tabs {
  margin: 40px 0;
  
  .tabs-header {
    display: flex;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
    
    .tab-button {
      padding: 10px 20px;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      font-weight: 600;
      color: #666;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &.active {
        color: #2196F3;
        border-bottom-color: #2196F3;
      }
      
      &:hover:not(.active) {
        color: #333;
      }
    }
  }
  
  .tabs-content {
    .tab-panel {
      display: none;
      
      &.active {
        display: block;
      }
      
      h3 {
        margin-top: 0;
        color: #333;
      }
    }
  }
}

.related-products {
  margin: 40px 0;
  
  h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
  }
}

  `]
})
export class ProductDetailComponent implements OnInit {
  product!: Product;
  selectedSize = '';
  selectedColor = '';
  quantity = 1;
  relatedProducts: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.product = this.productService.getProductById(productId);
      this.relatedProducts = this.productService.getRelatedProducts(productId);
    }
  }

  addToCart() {
    this.cartService.addToCart({
      id: `${this.product.id}-${this.selectedSize}-${this.selectedColor}`,
      productId: this.product.id,
      name: this.product.name,
      price: this.product.price,
      image: this.product.images[0],
      size: this.selectedSize,
      color: this.selectedColor,
      quantity: this.quantity
    });
  }
}