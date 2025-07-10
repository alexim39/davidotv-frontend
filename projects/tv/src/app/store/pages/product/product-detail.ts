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
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  providers: [ProductService],
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
      @if (product) {
        <div class="product-content">
          <!-- Product Gallery -->
          <div class="product-gallery">
            <div class="main-image-container">
              <img [src]="selectedImage || product.image" [alt]="product.name" class="main-image">
              @if (product.isNew) {
                <mat-chip class="new-badge" color="accent" selected>NEW</mat-chip>
              }
              @if (product.isLimited) {
                <mat-chip class="limited-badge" color="warn" selected>
                  <mat-icon>whatshot</mat-icon>
                  LIMITED
                </mat-chip>
              }
            </div>
            
            <div class="thumbnail-container">
              @for (image of [product.image, product.galleryImages]; track image; let i = $index) {
                <div class="thumbnail" [class.active]="selectedImage === image || (!selectedImage && i === 0)" 
                     (click)="selectImage(image)">
                  <img [src]="image" [alt]="'Thumbnail ' + (i + 1)">
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
                @if (product.originalPrice) {
                  <span class="original-price">N{{formatPrice(product.originalPrice)}}</span>
                }
                @if (product.discount) {
                  <span class="discount-badge">-{{product.discount}}%</span>
                }
              </div>
              
              <div class="rating-container">
                <div class="stars">
                  @for (star of [1,2,3,4,5]; track star) {
                    <mat-icon [class.filled]="star <= product.rating">star</mat-icon>
                  }
                </div>
                <span class="reviews">({{product.reviews}} reviews)</span>
                <span class="stock-status" [class.low-stock]="product.stock < 10">
                  {{product.stock < 10 ? 'Only ' + product.stock + ' left!' : 'In Stock'}}
                </span>
              </div>
            </div>

            <!-- Variants -->
            @if (product.variants && product.variants.length > 0) {
              <div class="variants-section">
                <h3>Options:</h3>
                <div class="variant-options">
                  @for (variant of product.variants; track variant.id) {
                    <button mat-stroked-button 
                            [class.selected]="selectedVariant?.id === variant.id"
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
              
              @if (product.features && product.features.length > 0) {
                <div class="features-list">
                  <h4>Features:</h4>
                  <ul>
                    @for (feature of product.features; track feature) {
                      <li>{{feature}}</li>
                    }
                  </ul>
                </div>
              }
            </div>
          </mat-tab>
          <mat-tab label="Specifications">
            <div class="tab-content">
              @if (product.specifications) {
                <div class="specs-table">
                  @for (spec of product.specifications | keyvalue; track spec.key) {
                    <div class="spec-row">
                      <span class="spec-name">{{spec.key}}:</span>
                      <span class="spec-value">{{spec.value}}</span>
                    </div>
                  }
                </div>
              } @else {
                <p>No specifications available for this product.</p>
              }
            </div>
          </mat-tab>
          <mat-tab label="Reviews">
            <div class="tab-content">
              <div class="reviews-header">
                <div class="average-rating">
                  <span class="average">{{product.rating.toFixed(1)}}</span>
                  <div class="stars">
                    @for (star of [1,2,3,4,5]; track star) {
                        <mat-icon [class.filled]="star <= getRoundedRating()">star</mat-icon>
                    }
                   </div>
                  <span class="total-reviews">{{product.reviews}} reviews</span>
                </div>
                <button mat-raised-button color="primary" class="add-review-btn" (click)="openReviewDialog()">
                  <mat-icon>rate_review</mat-icon>
                  Write a Review
                </button>
              </div>

              <mat-divider></mat-divider>

              <!-- Review Form (hidden by default) -->
              <div class="review-form" [class.visible]="showReviewForm">
                <h3>Write Your Review</h3>
                <div class="rating-input">
                  <span>Your Rating:</span>
                  <div class="stars">
                    @for (star of [1,2,3,4,5]; track star) {
                      <mat-icon (click)="setReviewRating(star)" 
                                [class.filled]="star <= reviewRating">
                        {{star <= reviewRating ? 'star' : 'star_border'}}
                      </mat-icon>
                    }
                  </div>
                </div>
                <mat-form-field class="review-textarea">
                  <mat-label>Your Review</mat-label>
                  <textarea matInput [(ngModel)]="reviewText" rows="4"></textarea>
                </mat-form-field>
                <div class="form-actions">
                  <button mat-button (click)="cancelReview()">Cancel</button>
                  <button mat-raised-button color="primary" (click)="submitReview()">Submit Review</button>
                </div>
              </div>

              <!-- Reviews List -->
              <div class="reviews-list">
                @for (review of product.reviewsList || []; track review.id) {
                  <div class="review-item">
                    <div class="review-header">
                      <span class="reviewer">{{review.user}}</span>
                      <div class="review-rating">
                        @for (star of [1,2,3,4,5]; track star) {
                          <mat-icon [class.filled]="star <= review.rating">star</mat-icon>
                        }
                      </div>
                      <span class="review-date">{{review.date}}</span>
                    </div>
                    <p class="review-text">{{review.text}}</p>
                    @if (review.response) {
                      <div class="review-response">
                        <strong>Response from DavidoTV:</strong>
                        <p>{{review.response}}</p>
                      </div>
                    }
                    <mat-divider></mat-divider>
                  </div>
                }
                @empty {
                  <div class="no-reviews">
                    <mat-icon>rate_review</mat-icon>
                    <p>No reviews yet. Be the first to review!</p>
                  </div>
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>

        <!-- Related Products -->
        <div class="related-products">
          <h2>You may also like</h2>
          <app-product-grid [products]="relatedProducts"></app-product-grid>
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
      }

      .reviews-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .average-rating {
          display: flex;
          align-items: center;
          gap: 8px;

          .average {
            font-size: 2rem;
            font-weight: 700;
          }

          .stars {
            display: flex;
            mat-icon {
              color: #ffc107;
              width: 24px;
              height: 24px;
              font-size: 24px;
            }
          }

          .total-reviews {
            color: #666;
          }
        }

        .add-review-btn {
          mat-icon {
            margin-right: 8px;
          }
        }
      }

      .review-form {
        max-width: 600px;
        margin: 24px 0;
        padding: 16px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        display: none;

        &.visible {
          display: block;
        }

        .rating-input {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;

          .stars {
            display: flex;
            mat-icon {
              color: #ddd;
              cursor: pointer;
              width: 28px;
              height: 28px;
              font-size: 28px;

              &.filled {
                color: #ffc107;
              }
            }
          }
        }

        .review-textarea {
          width: 100%;
          margin-bottom: 16px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
      }

      .reviews-list {
        .review-item {
          padding: 16px 0;

          .review-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 8px;

            .reviewer {
              font-weight: 500;
            }

            .review-rating {
              display: flex;
              mat-icon {
                color: #ffc107;
                width: 18px;
                height: 18px;
                font-size: 18px;
              }
            }

            .review-date {
              color: #666;
              font-size: 0.8rem;
            }
          }

          .review-text {
            margin: 0 0 8px;
            line-height: 1.6;
          }

          .review-response {
            border-left: 1px solid gray;
            border-radius: 45px;
            padding: 12px;
            border-radius: 4px;
            margin: 8px 0 8px 1em;

            p {
              margin: 8px 0 0;
            }
          }
        }

        .no-reviews {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
          color: #666;

          mat-icon {
            font-size: 48px;
            height: 48px;
            width: 48px;
            margin-bottom: 16px;
          }

          p {
            margin: 0;
          }
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
  product: any = null;
  relatedProducts: any[] = [];
  isLoading = true;
  selectedImage: string | null = null;
  selectedVariant: any = null;
  quantity = 1;
  isInWishlist = false;
  
  // Review form
  showReviewForm = false;
  reviewRating = 0;
  reviewText = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      this.loadProduct(productId);
    });
  }

  /* loadProduct(productId: string) {
    this.isLoading = true;
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        if (product) {
          this.product = {
            ...product,
            // Add mock data for demonstration
            galleryImages: [
              'https://example.com/path/to/product-image-2.jpg',
              'https://example.com/path/to/product-image-3.jpg',
              'https://example.com/path/to/product-image-4.jpg'
            ],
            originalPrice: product.price * 1.2, // Add 20% for demo
            discount: 15, // Demo discount
            stock: Math.floor(Math.random() * 50) + 5, // Random stock
            features: [
              'Official Davido merchandise',
              'High-quality materials',
              'Exclusive design',
              'Limited availability'
            ],
            specifications: {
              'Material': '100% Cotton',
              'Size': 'One Size',
              'Color': 'Black',
              'Weight': '0.3kg',
              'Origin': 'Nigeria'
            },
            reviewsList: [
              {
                id: 1,
                user: 'Oluwaseun A.',
                rating: 5,
                date: '2 weeks ago',
                text: 'Amazing quality! Fits perfectly and the design is even better in person.',
                response: 'Thank you for your support! We\'re glad you love your Davido merch.'
              },
              {
                id: 2,
                user: 'Chioma K.',
                rating: 4,
                date: '1 month ago',
                text: 'Great product but delivery took longer than expected.'
              }
            ]
          };

          if (this.product.variants && this.product.variants.length > 0) {
            this.selectedVariant = this.product.variants[0];
          }

          this.loadRelatedProducts();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  } */

    loadProduct(productId: string) {
  this.isLoading = true;
  
  // Mock products data - replace with your actual service call in production
  const mockProducts = {
    '1': {
      id: '1',
      name: 'Official Davido 30BG Logo T-Shirt',
      description: 'Premium quality official Davido merchandise. 100% cotton with the official 30BG logo printed on the front.',
      price: 39.99,
      originalPrice: 49.99,
      discount: 20,
      image: 'https://m.media-amazon.com/images/I/61-jBuhtgZL._AC_UY1100_.jpg',
      galleryImages: [
        'https://i.ebayimg.com/images/g/9~AAAOSwPc9V2H6~/s-l1600.jpg',
        'https://i5.walmartimages.com/asr/9a9f8f3f-5a5e-4f9b-8b8e-5e8f5b5e5e5e_1.3b9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c.jpeg'
      ],
      category: 'clothing',
      type: 'Standard',
      rating: 4.5,
      reviews: 24,
      isNew: true,
      isLimited: false,
      stock: 42,
      createdAt: new Date('2023-05-15'),
      features: [
        '100% premium cotton',
        'Official 30BG logo',
        'Machine washable',
        'Available in multiple sizes'
      ],
      specifications: {
        'Material': '100% Cotton',
        'Size': 'S, M, L, XL',
        'Color': 'Black',
        'Weight': '0.25kg',
        'Origin': 'Nigeria'
      },
      variants: [
        { id: '1-s', name: 'Small' },
        { id: '1-m', name: 'Medium' },
        { id: '1-l', name: 'Large' },
        { id: '1-xl', name: 'XL' }
      ],
      reviewsList: [
        {
          id: 1,
          user: 'Oluwaseun A.',
          rating: 5,
          date: '2 weeks ago',
          text: 'Amazing quality! Fits perfectly and the design is even better in person.',
          response: 'Thank you for your support! We\'re glad you love your Davido merch.'
        },
        {
          id: 2,
          user: 'Chioma K.',
          rating: 4,
          date: '1 month ago',
          text: 'Great product but delivery took longer than expected.'
        }
      ]
    },
    '2': {
      id: '2',
      name: 'Limited Edition Davido Signed Album',
      description: 'Collector\'s item - limited edition signed copy of Davido\'s latest album. Only 500 copies available worldwide.',
      price: 199.99,
      originalPrice: 249.99,
      discount: 20,
      image: 'https://static-01.daraz.com.np/p/7a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a.jpg',
      galleryImages: [
        'https://example.com/path/to/album-cover-2.jpg',
        'https://example.com/path/to/album-back.jpg',
        'https://example.com/path/to/signature-closeup.jpg'
      ],
      category: 'music',
      type: 'Limited Edition',
      rating: 5,
      reviews: 8,
      isNew: false,
      isLimited: true,
      stock: 3, // Low stock to show the warning
      createdAt: new Date('2023-01-10'),
      features: [
        'Hand-signed by Davido',
        'Includes bonus tracks',
        'Collector\'s edition packaging',
        'Certificate of authenticity'
      ],
      specifications: {
        'Format': 'CD + Digital',
        'Tracks': '15',
        'Release Date': 'January 2023',
        'Weight': '0.15kg',
        'Authenticity': 'Certificate included'
      },
      variants: [
        { id: '2-cd', name: 'CD Version' },
        { id: '2-vinyl', name: 'Vinyl Version' }
      ],
      reviewsList: [
        {
          id: 1,
          user: 'Ade B.',
          rating: 5,
          date: '3 weeks ago',
          text: 'Worth every penny! The signature is authentic and the album sounds amazing.'
        },
        {
          id: 2,
          user: 'Funke S.',
          rating: 5,
          date: '2 months ago',
          text: 'Perfect gift for any Davido fan. Packaging was excellent and arrived safely.'
        }
      ]
    }
  };

  // Simulate API delay
  setTimeout(() => {
    const product = mockProducts[productId as keyof typeof mockProducts];
    
    if (product) {
      this.product = product;
      if (this.product.variants && this.product.variants.length > 0) {
        this.selectedVariant = this.product.variants[0];
      }
      this.loadRelatedProducts();
    }
    
    this.isLoading = false;
  }, 800);
}

  /* loadRelatedProducts() {
    this.productService.getRelatedProducts(this.product.id).subscribe(products => {
      this.relatedProducts = products;
    });
  } */

    loadRelatedProducts() {
  // Mock related products - replace with actual service call in production
  this.relatedProducts = [
    {
      id: '3',
      name: 'Davido Tour Cap',
      price: 29.99,
      image: 'https://i.ebayimg.com/images/g/9~AAAOSwPc9V2H6~/s-l1600.jpg',
      isNew: true,
      isLimited: false,
      rating: 4,
      reviews: 12
    },
    {
      id: '4',
      name: '30BG Hoodie',
      price: 59.99,
      image: 'https://i5.walmartimages.com/asr/9a9f8f3f-5a5e-4f9b-8b8e-5e8f5b5e5e5e_1.3b9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c.jpeg',
      isNew: false,
      isLimited: true,
      rating: 5,
      reviews: 8
    },
    {
      id: '5',
      name: 'Davido Wristband Set',
      price: 19.99,
      image: 'https://static-01.daraz.com.np/p/7a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a.jpg',
      isNew: true,
      isLimited: false,
      rating: 3,
      reviews: 5
    }
  ];
}

  selectImage(image: string) {
    this.selectedImage = image;
  }

  selectVariant(variant: any) {
    this.selectedVariant = variant;
  }

  increaseQuantity() {
    if (this.quantity < 10) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    const productToAdd = {
      ...this.product,
      variant: this.selectedVariant,
      quantity: this.quantity
    };

    // In a real app, you would call a cart service here
    console.log('Added to cart:', productToAdd);
    this.snackBar.open('Added to cart', 'Dismiss', {
      duration: 3000,
      panelClass: 'success-snackbar'
    });
  }

  toggleWishlist() {
    this.isInWishlist = !this.isInWishlist;
    const message = this.isInWishlist ? 'Added to wishlist' : 'Removed from wishlist';
    this.snackBar.open(message, 'Dismiss', {
      duration: 2000
    });
  }

  openReviewDialog() {
    this.showReviewForm = true;
    this.reviewRating = 0;
    this.reviewText = '';
  }

  cancelReview() {
    this.showReviewForm = false;
  }

  setReviewRating(rating: number) {
    this.reviewRating = rating;
  }

  submitReview() {
    if (this.reviewRating === 0) {
      this.snackBar.open('Please select a rating', 'Dismiss', {
        duration: 2000,
        panelClass: 'error-snackbar'
      });
      return;
    }

    // In a real app, you would submit this to your backend
    const newReview = {
      id: Date.now(),
      user: 'You',
      rating: this.reviewRating,
      date: 'Just now',
      text: this.reviewText
    };

    this.product.reviewsList = [newReview, ...this.product.reviewsList];
    this.product.reviews++;
    
    // Update average rating (simple average for demo)
    const totalRating = this.product.reviewsList.reduce((sum: number, review: any) => sum + review.rating, 0);
    this.product.rating = totalRating / this.product.reviewsList.length;

    this.snackBar.open('Thank you for your review!', 'Dismiss', {
      duration: 3000,
      panelClass: 'success-snackbar'
    });

    this.showReviewForm = false;
  }

  goBack() {
    this.router.navigate(['/store']);
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  getRoundedRating(): number {
    return Math.round(this.product?.rating || 0);
  }
}