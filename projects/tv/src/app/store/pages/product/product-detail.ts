import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ProductGridComponent } from '../product-grid.component';
import { StoreService, ProductInterface } from '../../services/store.service';
import { catchError, finalize, of } from 'rxjs';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'app-product-detail',
  providers: [StoreService, CartService],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSnackBarModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ProductGridComponent
  ],
  template: `
    <!-- Main Product Container -->
    <div class="product-detail-container">
      @if (isLoading) {
        <div class="loading-overlay">
          <mat-spinner diameter="40"/>
          <p>Loading...</p>
        </div>
      }

      <!-- Product Header -->
      <div class="product-header">
        <button mat-icon-button class="back-button" (click)="goBack()" aria-label="Go back">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="product-title">{{product?.name}}</h1>
      </div>

      <!-- Product Content -->
      @if (product && !isLoading) {
        <div class="product-content">
          <!-- Product Gallery -->
          <div class="product-gallery">
            <div class="main-image-container">
              <img [src]="selectedImage || product.images[0].url" [alt]="product.name" class="main-image">
              @if (product.isNewProduct) {
                <mat-chip class="new-badge new" selected>NEW</mat-chip>
              }
              @if (product.isLimitedEdition) {
                <mat-chip class="limited-badge limited" selected>
                  <mat-icon>whatshot</mat-icon>
                  LIMITED
                </mat-chip>
              }
            </div>
            
            <div class="thumbnail-container">
              @for (image of product.images; track image._id; let i = $index) {
                <div class="thumbnail" [class.active]="selectedImage === image.url || (!selectedImage && i === 0)" 
                   (click)="selectImage(image.url)">
                  <img [src]="image.url" [alt]="image.altText || 'Product thumbnail'">
                </div>
              }
            </div>
          </div>

          <!-- Product Info -->
          <div class="product-info">
            <!-- Price and Actions -->
            <div class="price-section">
              <div class="price-container">
                <span class="current-price">N{{formatPrice(product.price)}}</span>
                @if (product.discountedPrice) {
                  <span class="original-price">N{{formatPrice(product.discountedPrice)}}</span>
                }
              </div>
              
              <div class="rating-container">
                <div class="stars">
                  @for (star of [1,2,3,4,5]; track star) {
                    <mat-icon [class.filled]="star <= product.rating.average">star</mat-icon>
                  }
                </div>
                <span class="reviews">({{product.rating.count}} reviews)</span>
                <span class="stock-status" [class.low-stock]="product.inventory.stock < 10">
                  {{product.inventory.stock < 10 ? 'Only ' + product.inventory.stock + ' left!' : 'In Stock'}}
                </span>
              </div>
            </div>

            <!-- Variants -->
            @if (product.variants && product.variants.length > 0) {
              <div class="variants-section">
                <h3>Options:</h3>
                <div class="variant-options">
                  @for (variant of product.variants; track variant._id) {
                    <button mat-stroked-button 
                            [class.selected]="selectedVariant?._id === variant._id"
                            (click)="selectVariant(variant)">
                      {{variant.name}}
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Quantity Selector -->
            <div class="quantity-section">
              <h3>Quantity:</h3>
              <div class="quantity-selector">
                <button mat-icon-button (click)="decreaseQuantity()" [disabled]="quantity <= 1">
                  <mat-icon>remove</mat-icon>
                </button>
                <span class="quantity">{{quantity}}</span>
                <button mat-icon-button (click)="increaseQuantity()" [disabled]="quantity >= 10">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button mat-raised-button color="primary" class="add-to-cart" (click)="addToCart()">
                <mat-icon>add_shopping_cart</mat-icon>
                Add to Cart
              </button>
              <button mat-stroked-button class="wishlist-btn" (click)="toggleWishlist()">
                <mat-icon>{{isInWishlist ? 'favorite' : 'favorite_border'}}</mat-icon>
                Wishlist
              </button>
            </div>

            <!-- Delivery Info -->
            <div class="delivery-info">
              <div class="delivery-item">
                <mat-icon>local_shipping</mat-icon>
                <span>Free delivery on orders over N50,000</span>
              </div>
              <div class="delivery-item">
                <mat-icon>assignment_return</mat-icon>
                <span>30-day returns policy</span>
              </div>
              <div class="delivery-item">
                <mat-icon>verified_user</mat-icon>
                <span>Authentic merchandise guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Tabs -->
        <mat-tab-group class="product-tabs" animationDuration="0ms">
          <mat-tab label="Description">
            <div class="tab-content">
              <h3>Product Details</h3>
              <p>{{product.description}}</p>
              
              @if (product.tags && product.tags.length > 0) {
                <div class="features-list">
                  <h4>Tags:</h4>
                  <div class="tags-container">
                    @for (tag of product.tags; track tag) {
                      <mat-chip>{{tag}}</mat-chip>
                    }
                  </div>
                </div>
              }
            </div>
          </mat-tab>
          <mat-tab label="Specifications">
            <div class="tab-content">
              <div class="specs-table">
                <div class="spec-row">
                  <span class="spec-name">Brand:</span>
                  <span class="spec-value">{{product.brand}}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-name">Collection:</span>
                  <span class="spec-value">{{product.artistCollection}}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-name">Type:</span>
                  <span class="spec-value">{{product.type}}</span>
                </div>
                @if (product.shippingInfo) {
                  <div class="spec-row">
                    <span class="spec-name">Weight:</span>
                    <span class="spec-value">{{product.shippingInfo.weight}}g</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-name">Dimensions:</span>
                    <span class="spec-value">
                      {{product.shippingInfo.dimensions.length}}cm × 
                      {{product.shippingInfo.dimensions.width}}cm × 
                      {{product.shippingInfo.dimensions.height}}cm
                    </span>
                  </div>
                }
                <div class="spec-row">
                  <span class="spec-name">SKU:</span>
                  <span class="spec-value">{{product.inventory.sku}}</span>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>

        <!-- Related Products -->
        <div class="related-products">
          <h2>You may also like</h2>
          @if (relatedProductsLoading) {
            <div class="loading-spinner">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading related products...</p>
            </div>
          } @else {
            <app-product-grid [products]="relatedProducts"></app-product-grid>
          }
        </div>
      } @else if (!isLoading) {
        <div class="product-not-found">
          <mat-icon>error_outline</mat-icon>
          <h2>Product not found</h2>
          <p>Sorry, we couldn't find the product you're looking for.</p>
          <button mat-raised-button color="primary" routerLink="/store">Browse Products</button>
        </div>
      }
    </div>
  `,
  styles: [`
    /* Your existing styles remain unchanged */
    .product-detail-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px 16px;
      position: relative;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(98, 98, 98, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      p {
        color: #ccc;
        margin-left: 1em;
        font-size: 14px;
      }
    }

    .product-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;

      .back-button {
        margin-right: 16px;
      }

      .product-title {
        font-size: 1.8rem;
        margin: 0;
        font-weight: 500;
      }
    }

    .product-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }

    .product-gallery {
      .main-image-container {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 16px;
        background: #f5f5f5;
        aspect-ratio: 1/1;

        .main-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        mat-chip {
          position: absolute;
          top: 12px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          background: rgba(0, 0, 0, 0.8);

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
      }

      .thumbnail-container {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 8px;

        .thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          flex-shrink: 0;
          background: #f5f5f5;

          &.active {
            border-color: #3f51b5;
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }

    .product-info {
      .price-section {
        margin-bottom: 24px;

        .price-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .current-price {
            font-size: 1.8rem;
            font-weight: 700;
            color: #333;
          }

          .original-price {
            font-size: 1.2rem;
            text-decoration: line-through;
            color: #999;
          }

          .discount-badge {
            background: #f44336;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
          }
        }

        .rating-container {
          display: flex;
          align-items: center;
          gap: 12px;

          .stars {
            display: flex;
            mat-icon {
              color: #ddd;
              width: 20px;
              height: 20px;
              font-size: 20px;

              &.filled {
                color: #ffc107;
              }
            }
          }

          .reviews {
            font-size: 0.9rem;
            color: #666;
          }

          .stock-status {
            font-size: 0.9rem;
            color: #4caf50;

            &.low-stock {
              color: #f44336;
            }
          }
        }
      }

      .variants-section {
        margin-bottom: 24px;

        h3 {
          font-size: 1rem;
          margin: 0 0 12px;
          font-weight: 500;
        }

        .variant-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          button {
            &.selected {
              background: #3f51b5;
              color: white;
              border-color: #3f51b5;
            }
          }
        }
      }

      .quantity-section {
        margin-bottom: 24px;

        h3 {
          font-size: 1rem;
          margin: 0 0 12px;
          font-weight: 500;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 8px;

          button {
            width: 36px;
            height: 36px;
            border-radius: 50%;
          }

          .quantity {
            width: 40px;
            text-align: center;
            font-size: 1rem;
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;

        .add-to-cart {
          flex: 1;
          height: 48px;
          font-size: 1rem;
          font-weight: 500;

          mat-icon {
            margin-right: 8px;
          }
        }

        .wishlist-btn {
          height: 48px;
          mat-icon {
            color: #f44336;
          }
        }
      }

      .delivery-info {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 16px;

        .delivery-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          mat-icon {
            color: #666;
          }

          span {
            font-size: 0.9rem;
          }
        }
      }
    }

    .product-tabs {
      margin-bottom: 40px;

      .tab-content {
        padding: 24px 0;

        h3 {
          font-size: 1.2rem;
          margin: 0 0 16px;
        }

        p {
          line-height: 1.6;
          margin: 0 0 16px;
        }

        .features-list {
          ul {
            padding-left: 20px;
            margin: 0;
          }
        }

        .specs-table {
          .spec-row {
            display: flex;
            padding: 8px 0;
            border-bottom: 1px solid #eee;

            &:last-child {
              border-bottom: none;
            }

            .spec-name {
              font-weight: 500;
              width: 200px;
              color: #666;
            }

            .spec-value {
              flex: 1;
            }
          }
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
      }
    }

    .related-products {
      h2 {
        font-size: 1.5rem;
        margin: 0 0 24px;
      }
    }

    .product-not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
      text-align: center;

      mat-icon {
        font-size: 60px;
        height: 60px;
        width: 60px;
        margin-bottom: 16px;
        color: #9e9e9e;
      }

      h2 {
        font-size: 1.8rem;
        margin: 0 0 8px;
      }

      p {
        font-size: 1rem;
        margin: 0 0 16px;
        color: #666;
      }
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
      gap: 16px;
      
      p {
        color: #666;
        font-size: 0.875rem;
        font-weight: 500;
      }
    }

    @media (max-width: 960px) {
      .product-content {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .product-gallery {
        order: 1;
      }

      .product-info {
        order: 2;
      }
    }

    @media (max-width: 600px) {
      .product-header {
        .product-title {
          font-size: 1.5rem;
        }
      }

      .action-buttons {
        flex-direction: column;
      }

      .product-tabs {
        ::ng-deep .mat-tab-label {
          padding: 0 8px;
          min-width: auto;
        }
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
 product: ProductInterface | null = null;
  relatedProducts: ProductInterface[] = [];
  isLoading = true;
  relatedProductsLoading = false;
  selectedImage: string | null = null;
  selectedVariant: any = null;
  quantity = 1;
  isInWishlist = false;
  isAddingToCart = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeService: StoreService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      this.loadProduct(productId);
    });
  }

  loadProduct(productId: string) {
    this.isLoading = true;
    
    this.storeService.getProductById(productId).pipe(
      catchError(error => {
        console.error('Error loading product:', error);
        return of(null);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(product => {
      this.product = product;
      if (product) {
        if (product.variants && product.variants.length > 0) {
          this.selectedVariant = product.variants[0];
        }
        this.loadRelatedProducts(productId);
        this.checkWishlistStatus(productId);
      }
    });
  }

  loadRelatedProducts(productId: string) {
    this.relatedProductsLoading = true;
    this.storeService.getRelatedProducts(productId).pipe(
      catchError(error => {
        console.error('Error loading related products:', error);
        return of([]);
      }),
      finalize(() => this.relatedProductsLoading = false)
    ).subscribe(products => {
      this.relatedProducts = products;
    });
  }

  checkWishlistStatus(productId: string) {
    // In a real app, you would call a wishlist service here
    // For now, we'll just set it to false
    this.isInWishlist = false;
  }

  selectImage(image: string) {
    this.selectedImage = image;
  }

  selectVariant(variant: any) {
    this.selectedVariant = variant;
  }

  increaseQuantity() {
    if (this.product && this.quantity < Math.min(10, this.product.inventory.stock)) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (!this.product || this.isAddingToCart) return;

    this.isAddingToCart = true;

    const cartItem = {
      product: this.product._id,
      quantity: this.quantity,
      priceAtAddition: this.product.discountedPrice || this.product.price,
      ...(this.selectedVariant && { 
        selectedVariant: {
          name: this.selectedVariant.name,
          option: this.selectedVariant.option
        }
      })
    };

    this.cartService.addToCart(cartItem).pipe(
      finalize(() => this.isAddingToCart = false)
    ).subscribe({
      next: () => {
        this.snackBar.open('Added to cart', 'Dismiss', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.snackBar.open('Failed to add to cart', 'Dismiss', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  toggleWishlist() {
    if (!this.product) return;

    const productId = this.product._id;
    // In a real app, you would call a wishlist service here
    this.isInWishlist = !this.isInWishlist;
    const message = this.isInWishlist ? 'Added to wishlist' : 'Removed from wishlist';
    this.snackBar.open(message, 'Dismiss', {
      duration: 2000
    });
  }

  goBack() {
    this.router.navigate(['/store']);
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  getRoundedRating(): number {
    return this.product ? Math.round(this.product.rating.average) : 0;
  }
}