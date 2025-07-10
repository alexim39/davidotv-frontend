import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductGridComponent } from './product-grid.component';

@Component({
  selector: 'app-shop-home',
  standalone: true,
  providers: [ProductService],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatGridListModule,
    MatToolbarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    ProductGridComponent
  ],
  template: `
    <!-- Main Container -->
    <div class="shop-home">

      <!-- Featured Products -->
      <section class="section-container">
        <mat-toolbar class="section-header">
          <h2>Featured Products</h2>
          <span class="spacer"></span>
          <a mat-button color="primary" routerLink="/shop/category/featured" class="view-all">
            View All
            <mat-icon>chevron_right</mat-icon>
          </a>
        </mat-toolbar>
        <mat-divider></mat-divider>
        @if (isLoading) {
          <div class="loading-spinner">
            <mat-spinner diameter="50"></mat-spinner>
          </div>
        } @else {
          <app-product-grid [products]="featuredProducts"></app-product-grid>
        }
      </section>

      <!-- New Arrivals -->
      <section class="section-container">
        <mat-toolbar class="section-header">
          <h2>New Arrivals</h2>
          <span class="spacer"></span>
          <a mat-button color="primary" routerLink="/shop/category/new" class="view-all">
            View All
            <mat-icon>chevron_right</mat-icon>
          </a>
        </mat-toolbar>
        <mat-divider></mat-divider>
        @if (isLoading) {
          <div class="loading-spinner">
            <mat-spinner diameter="50"></mat-spinner>
          </div>
        } @else {
          <app-product-grid [products]="newArrivals"></app-product-grid>
        }
      </section>

      <!-- Category Promos -->
      <mat-grid-list cols="2" rowHeight="300px" gutterSize="16px" class="category-promos">
        <mat-grid-tile>
          <mat-card class="promo-banner clothing-promo" routerLink="/shop/category/clothing">
            <div class="promo-content">
              <h3>Davido Clothing</h3>
              <button mat-stroked-button color="primary" class="promo-link">
                Shop Now
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </mat-card>
        </mat-grid-tile>
        <mat-grid-tile>
          <mat-card class="promo-banner accessories-promo" routerLink="/shop/category/accessories">
            <div class="promo-content">
              <h3>Accessories</h3>
              <button mat-stroked-button color="primary" class="promo-link">
                Shop Now
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>

      <!-- Limited Edition -->
      <section class="section-container">
        <mat-toolbar class="section-header">
          <h2>Limited Edition</h2>
          <span class="spacer"></span>
          <p>Get these exclusive items before they're gone</p>
        </mat-toolbar>
        <mat-divider></mat-divider>
        @if (isLoading) {
          <div class="loading-spinner">
            <mat-spinner diameter="50"></mat-spinner>
          </div>
        } @else {
          <app-product-grid [products]="limitedEdition"></app-product-grid>
        }
      </section>
    </div>
  `,
  styles: [`


    .section-container {
      margin-bottom: 40px;
    }

    .section-header {
      background: transparent !important;
      padding: 0 !important;
      margin-bottom: 16px;

      h2 {
        font-size: 1.5rem;
        font-weight: 500;
        margin: 0;
      }

      p {
        color: #666;
        margin: 0;
        font-size: 0.9rem;
      }

      .spacer {
        flex: 1 1 auto;
      }

      .view-all {
        font-weight: 500;

        mat-icon {
          font-size: 20px;
          height: 20px;
          width: 20px;
        }
      }
    }

    .category-promos {
      margin: 40px 0;

      .promo-banner {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        background-size: cover;
        background-position: center;
        border-radius: 8px !important;
        cursor: pointer;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.02);
        }

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          transition: background 0.3s ease;
        }

        &:hover::after {
          background: rgba(0, 0, 0, 0.1);
        }

        .promo-content {
          z-index: 1;
          text-align: center;
          color: white;

          h3 {
            font-size: 2rem;
            margin-bottom: 15px;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
            font-weight: 600;
          }
        }

        .promo-link {
          font-weight: 500;
          border-width: 2px;

          mat-icon {
            margin-left: 8px;
          }
        }
      }

      .clothing-promo {
        background-image: url('https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
      }

      .accessories-promo {
        background-image: url('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
      }
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }

    @media (max-width: 768px) {
      .category-promos {
        mat-grid-list {
          grid-template-columns: 1fr;
        }
      }

      .hero-banner {
        height: 350px;
      }
    }
  `]
})
export class ShopHomeComponent {
  featuredProducts: any[] = [];
  newArrivals: any[] = [];
  limitedEdition: any[] = [];
  isLoading = true;

  constructor(public productService: ProductService) {}

  ngOnInit() {
    // Simulate API loading
    setTimeout(() => {
      this.featuredProducts = this.mockProducts(4, 'featured');
      this.newArrivals = this.mockProducts(4, 'new');
      this.limitedEdition = this.mockProducts(4, 'limited');
      this.isLoading = false;
    }, 1500);
  }

  mockProducts(count: number, type: string): any[] {
    const products = [];
    const categories = ['T-Shirts', 'Hoodies', 'Caps', 'Accessories'];
    const types = {
      featured: ['Exclusive', 'Best Seller', 'Popular'],
      new: ['New Release', 'Just Added'],
      limited: ['Limited Edition', 'Collector\'s Item']
    };

    for (let i = 1; i <= count; i++) {
      products.push({
        id: i,
        name: `Davido ${categories[i % categories.length]} ${i}`,
        price: 29.99 + (i * 5),
        image: this.getRandomProductImage(),
        category: categories[i % categories.length],
        type: types[type as keyof typeof types][i % types[type as keyof typeof types].length],
        rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
        reviews: Math.floor(Math.random() * 50),
        isNew: type === 'new',
        isLimited: type === 'limited'
      });
    }
    return products;
  }

  getRandomProductImage(): string {
    const images = [
      'https://m.media-amazon.com/images/I/61-jBuhtgZL._AC_UY1100_.jpg',
      'https://i.ebayimg.com/images/g/9~AAAOSwPc9V2H6~/s-l1600.jpg',
      'https://i5.walmartimages.com/asr/9a9f8f3f-5a5e-4f9b-8b8e-5e8f5b5e5e5e_1.3b9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c.jpeg',
      'https://static-01.daraz.com.np/p/7a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a.jpg'
    ];
    return images[Math.floor(Math.random() * images.length)];
  }
}