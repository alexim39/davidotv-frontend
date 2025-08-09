import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductInterface, StoreService } from '../services/store.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductGridComponent } from './product-grid.component';
import { catchError, finalize, of, Subscription } from 'rxjs';
import { UserInterface, UserService } from '../../common/services/user.service';

@Component({
  selector: 'app-shop-home',
  standalone: true,
  providers: [StoreService],
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
          <a mat-button color="primary" routerLink="/store/category/featured" class="view-all">
            View All
            <mat-icon>chevron_right</mat-icon>
          </a>
        </mat-toolbar>
        <mat-divider></mat-divider>
        @if (isLoading) {
          <div class="loading-spinner">
            <mat-spinner diameter="50" strokeWidth="2" color="accent"/>
            <p class="loading-text">Loading featured products...</p>
          </div>
        } @else if (featuredProducts.length > 0) {
          <app-product-grid [products]="featuredProducts"/>
        } @else {
          

           <div class="no-results">
            <mat-icon class="no-results-icon" aria-hidden="false" aria-label="No product found">search_off</mat-icon>
            <h3>No Product found</h3>
            <p>No featured products available.</p>
            <button 
              mat-flat-button 
              color="primary" 
              (click)="retry()"
              aria-label="Retry loading product"
            >
              <mat-icon>refresh</mat-icon>
              Try Again
            </button>
          </div>
        }
      </section>

      <!-- New Arrivals -->
      <section class="section-container">
        <mat-toolbar class="section-header">
          <h2>New Arrivals</h2>
          <span class="spacer"></span>
          <a mat-button color="primary" routerLink="/store/category/new" class="view-all">
            View All
            <mat-icon>chevron_right</mat-icon>
          </a>
        </mat-toolbar>
        <mat-divider></mat-divider>
        @if (isLoading) {
          <div class="loading-spinner">
            <mat-spinner diameter="50" strokeWidth="2" color="accent"/>
            <p class="loading-text">Loading new arrivals...</p>
          </div>
        } @else if (newArrivals.length > 0) {
          <app-product-grid [products]="newArrivals"/>
        } @else {

          <div class="no-results">
            <mat-icon class="no-results-icon" aria-hidden="false" aria-label="No product found">search_off</mat-icon>
            <h3>No Product found</h3>
            <p>No new arrivals available.</p>
            <button 
              mat-flat-button 
              color="primary" 
              (click)="retry()"
              aria-label="Retry loading product"
            >
              <mat-icon>refresh</mat-icon>
              Try Again
            </button>
          </div>
        }
      </section>

      <!-- Category Promos -->
      <mat-grid-list cols="2" rowHeight="300px" gutterSize="16px" class="category-promos">
        <mat-grid-tile>
          <mat-card class="promo-banner clothing-promo" routerLink="/shop/category/apparel">
            <div class="promo-content">
              <h3>Davido Branded Apparel</h3>
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
              <h3>Davido Branded Accessories</h3>
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
            <mat-spinner diameter="50" strokeWidth="2" color="accent"/>
            <p class="loading-text">Loading limited...</p>
          </div>
        } @else if (limitedEdition.length > 0) {
          <app-product-grid [products]="limitedEdition"/>
        } @else {
        <div class="no-results">
          <mat-icon class="no-results-icon" aria-hidden="false" aria-label="No product found">search_off</mat-icon>
          <h3>No Product found</h3>
           <p>No limited edition products available.</p>
          <button 
            mat-flat-button 
            color="primary" 
            (click)="retry()"
            aria-label="Retry loading product"
          >
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
        </div>
        }
      </section>
    </div>
  `,
  styles: [`
    /* Your existing styles remain unchanged */
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
        display: block !important;
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
        background-image: url('/img/store/category/apparel.jpg');
      }

      .accessories-promo {
        background-image: url('/img/store/category/accessories.jpg');
      }
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      .loading-text {
        font-size: 0.875rem;
        color: #666;
        font-weight: 500;
        margin-left: 10px;
      }
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
      
      .section-header {
        p {
          display: none !important; /* Hide description on smaller screens */
        }
      }
    }
    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 0;
      gap: 16px;

      .no-results-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        //color: #AAA;
      }

      h3 {
        font-size: 1.25rem;
        font-weight: 500;
        //color: #333;
        margin: 0;
      }

      p {
        font-size: 0.875rem;
        color: #666;
        margin: 0;
        max-width: 300px;
      }

      button {
        margin-top: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      gap: 16px;
      .loading-text {
        font-size: 0.875rem;
        color: #666;
        font-weight: 500;
      }
    }

    
  `]
})
export class ShopHomeComponent implements OnInit {
  featuredProducts: ProductInterface[] = [];
  newArrivals: ProductInterface[] = [];
  limitedEdition: ProductInterface[] = [];
  isLoading = true;

  subscriptionSuccess = false;
  subscriptions: Subscription[] = [];
  private userService = inject(UserService);
  user: UserInterface | null = null;

  constructor(private storeService: StoreService) {}

  ngOnInit() {
    this.loadProducts();
    this.getCurrentUser()
  }

  private getCurrentUser() {
    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
          //console.log('current user ',this.user)
        }
      })
    )
  }

  loadProducts() {
    this.isLoading = true;
    
    // Track completed requests
    let completedRequests = 0;
    const totalRequests = 3;
    
    const checkCompletion = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.isLoading = false;
      }
    };

    // Fetch featured products
    this.storeService.getFeaturedProducts()
      .pipe(
        catchError(error => {
          console.error('Error fetching featured products:', error);
          return of([]);
        }),
        finalize(checkCompletion)
      )
      .subscribe(products => {
        //console.log('products ',products)
        this.featuredProducts = products;
      });

    // Fetch new arrivals
    this.storeService.getNewArrivals()
      .pipe(
        catchError(error => {
          console.error('Error fetching new arrivals:', error);
          return of([]);
        }),
        finalize(checkCompletion)
      )
      .subscribe(products => {
        this.newArrivals = products;
      });

    // Fetch limited edition products
    this.storeService.getLimitedEdition()
      .pipe(
        catchError(error => {
          console.error('Error fetching limited edition products:', error);
          return of([]);
        }),
        finalize(checkCompletion)
      )
      .subscribe(products => {
        this.limitedEdition = products;
      });
  }

   retry(): void {
    this.isLoading = true;
    this.loadProducts();
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  } 
}