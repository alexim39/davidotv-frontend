import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ProductGridComponent } from '../product-grid.component';
import { StoreService, ProductInterface } from '../../services/store.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-shop-category',
  providers: [StoreService],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatChipsModule,
    ProductGridComponent
  ],
  template: `
    <!-- Category Header -->
    <div class="category-header">
      <div class="category-hero" [style.backgroundImage]="'url(' + categoryImage + ')'">
        <div class="category-overlay"></div>
        <div class="category-info">
          <h1>{{ categoryName }}</h1>
          <p>{{ categoryDescription }}</p>
          <div class="category-stats">
            <span>
              <mat-icon>video_library</mat-icon>
              {{ totalProducts }} products
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Content -->
    <div class="category-content">
      <!-- Filter/Sort Bar -->
      <mat-toolbar class="filter-bar">
        <mat-chip-listbox class="filter-chips" aria-label="Filter options">
          <mat-chip-option (click)="sortProducts('')">All</mat-chip-option>
          <mat-chip-option (click)="sortProducts('popular')">Popular</mat-chip-option>
          <mat-chip-option (click)="sortProducts('newest')">Newest</mat-chip-option>
          <mat-chip-option (click)="sortProducts('price-asc')">Price: Low to High</mat-chip-option>
          <mat-chip-option (click)="sortProducts('price-desc')">Price: High to Low</mat-chip-option>
        </mat-chip-listbox>
        <span class="spacer"></span>
        <button mat-stroked-button class="filter-btn" (click)="openFilters()">
          <mat-icon>filter_list</mat-icon>
          Filters
        </button>
      </mat-toolbar>

      <!-- Loading State -->
      @if (isLoading) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <!-- Products Grid -->
      <div class="products-section">
        @if (!isLoading && products.length > 0) {
          <app-product-grid [products]="products"></app-product-grid>
        }
        @else if (!isLoading && products.length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">inventory_2</mat-icon>
            <h3>No products found in this category</h3>
            <p>Check back later or browse other categories</p>
            <button mat-raised-button color="primary" routerLink="/store">
              Browse All Categories
            </button>
          </div>
        }
      </div>

      <!-- Pagination -->
      @if (!isLoading && products.length > 0) {
        <div class="pagination">
          <button mat-stroked-button [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)">
            <mat-icon>chevron_left</mat-icon>
            Previous
          </button>
          <div class="page-numbers">
            @for (page of visiblePages; track page) {
              <button 
                mat-button 
                [class.active]="currentPage === page"
                (click)="changePage(page)">
                {{ page }}
              </button>
            }
            @if (showEllipsis) {
              <span>...</span>
            }
          </div>
          <button mat-stroked-button [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)">
            Next
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .category-header {
      position: relative;
      margin-bottom: 24px;
    }

    .category-hero {
      height: 300px;
      background-size: cover;
      background-position: center;
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
    }

    .category-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 100%);
    }

    .category-info {
      position: relative;
      z-index: 1;
      padding: 32px;
      color: white;
      width: 100%;

      h1 {
        font-size: 2.5rem;
        margin: 0 0 8px;
        font-weight: 700;
      }

      p {
        font-size: 1rem;
        margin: 0 0 16px;
        max-width: 600px;
        opacity: 0.9;
      }
    }

    .category-stats {
      display: flex;
      gap: 16px;
      font-size: 0.9rem;

      span {
        display: flex;
        align-items: center;
        opacity: 0.8;

        mat-icon {
          font-size: 18px;
          height: 18px;
          width: 18px;
          margin-right: 4px;
        }
      }
    }

    .category-content {
      padding: 0 16px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .filter-bar {
      background: transparent !important;
      padding: 0 0 16px !important;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 24px;
    }

    .filter-chips {
      margin-right: 16px;
    }

    .filter-btn {
      border-radius: 20px;
      padding: 0 16px;
      height: 36px;

      mat-icon {
        margin-right: 8px;
        font-size: 20px;
        height: 20px;
        width: 20px;
      }
    }

    .products-section {
      min-height: 400px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
      text-align: center;

      .empty-icon {
        font-size: 60px;
        height: 60px;
        width: 60px;
        margin-bottom: 16px;
        color: #9e9e9e;
      }

      h3 {
        font-size: 1.5rem;
        margin: 0 0 8px;
        color: #333;
      }

      p {
        font-size: 1rem;
        margin: 0 0 16px;
        color: #666;
      }
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 40px 0;
      gap: 16px;

      button {
        border-radius: 20px;
      }

      .page-numbers {
        display: flex;
        align-items: center;
        gap: 8px;

        button {
          min-width: 40px;
          padding: 0 8px;

          &.active {
            background-color: rgba(0, 0, 0, 0.1);
          }
        }
      }
    }

    @media (max-width: 768px) {
      .category-hero {
        height: 200px;
      }

      .category-info {
        padding: 16px;

        h1 {
          font-size: 1.8rem;
        }

        p {
          font-size: 0.9rem;
        }
      }

      .filter-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding-bottom: 8px !important;

        .filter-chips {
          width: 100%;
          overflow-x: auto;
          padding-bottom: 8px;
        }
      }

      .pagination {
        flex-direction: column;
        gap: 8px;
      }
    }

    @media (max-width: 480px) {
      .category-hero {
        height: 160px;
      }

      .category-info {
        h1 {
          font-size: 1.5rem;
        }

        .category-stats {
          flex-direction: column;
          gap: 4px;
        }
      }
    }
  `]
})
export class ShopCategoryComponent implements OnInit {
  categoryId: string = '';
  categoryName: string = 'All Products';
  categoryDescription: string = 'Browse all official Davido merchandise';
  categoryImage: string = '';
  products: ProductInterface[] = [];
  isLoading: boolean = true;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalProducts: number = 0;
  totalPages: number = 1;
  visiblePages: number[] = [];
  showEllipsis: boolean = false;
  currentSort: string = '';

  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryId = params['id'];
      this.loadCategoryData();
      this.loadProducts();
    });
  }

  loadCategoryData() {
    const categories: {[key: string]: {name: string, description: string, image: string}} = {
      'all': {
        name: 'All Products',
        description: 'Browse all official Davido merchandise',
        image: '/img/store/category/all.jpg'
      },
      'apparel': {
        name: 'Apparel & Fashion',
        description: 'Official Davido clothing including t-shirts, hoodies, and more',
        image: '/img/store/category/apparel.jpg'
      },
      'accessories': {
        name: 'Accessories',
        description: 'Hats, bags, and other Davido accessories',
        image: '/img/store/category/accessories.jpg'
      },
      'home': {
        name: 'Home & Lifestyle',
        description: 'Davido branded home goods and lifestyle products',
        image: '/img/store/category/merch.jpg'
      },
      'music': {
        name: 'Music & Collectibles',
        description: 'Vinyl records, CDs, and exclusive collectibles',
        image: '/img/store/category/music.jpg'
      },
      'limited-edition': {
        name: 'Exclusive Items',
        description: 'Limited edition Davido merchandise',
        image: '/img/store/category/limited.jpg'
      },
      'featured': {
        name: 'Featured Products',
        description: 'Curated selection of featured Davido merchandise',
        image: '/img/store/category/featured.jpg'
      },
      'new': {
        name: 'New Arrivals',
        description: 'The newest Davido merchandise just added to our store',
        image: '/img/store/category/new.jpg'
      }
    };

    const categoryData = categories[this.categoryId as keyof typeof categories] || categories['all'];
    this.categoryName = categoryData.name;
    this.categoryDescription = categoryData.description;
    this.categoryImage = categoryData.image;
  }

  /* loadProducts() {
    this.isLoading = true;
    
    let sort = '';
    if (this.currentSort === 'popular') {
      sort = '-rating.average';
    } else if (this.currentSort === 'newest') {
      sort = '-createdAt';
    } else if (this.currentSort === 'price-asc') {
      sort = 'price';
    } else if (this.currentSort === 'price-desc') {
      sort = '-price';
    }

    const params = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      sort: sort,
      category: this.categoryId === 'all' ? '' : this.categoryId
    };

    this.storeService.getProducts(params).pipe(
      catchError(error => {
        console.error('Error loading products:', error);
        return of({ products: [], total: 0 });
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(response => {
      this.products = response.products;
      this.totalProducts = response.total;
      this.totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);
      this.updateVisiblePages();
    });
  } */

  loadProducts() {
    this.isLoading = true;
    
    let sort = '';
    if (this.currentSort === 'popular') {
      sort = '-rating.average';
    } else if (this.currentSort === 'newest') {
      sort = '-createdAt';
    } else if (this.currentSort === 'price-asc') {
      sort = 'price';
    } else if (this.currentSort === 'price-desc') {
      sort = '-price';
    }

    // Initialize params object
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      sort: sort
    };

    // Handle special categories differently
    if (this.categoryId === 'featured') {
      params.isFeatured = 'true';
    } else if (this.categoryId === 'new') {
      params.isNewProduct = 'true';
    } else if (this.categoryId !== 'all') {
      params.category = this.categoryId;
    }

    this.storeService.getProducts(params).pipe(
      catchError(error => {
        console.error('Error loading products:', error);
        return of({ products: [], total: 0 });
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(response => {
      this.products = response.products;
      this.totalProducts = response.total;
      this.totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);
      this.updateVisiblePages();
    });
  }

  sortProducts(sortType: string) {
    this.currentSort = sortType;
    this.currentPage = 1;
    this.loadProducts();
  }

  openFilters() {
    // In a real app, you would open a filter dialog here
    console.log('Open filters dialog');
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  updateVisiblePages() {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    this.visiblePages = [];
    for (let i = startPage; i <= endPage; i++) {
      this.visiblePages.push(i);
    }

    this.showEllipsis = endPage < this.totalPages;
  }
}