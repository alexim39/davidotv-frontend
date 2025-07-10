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
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-shop-category',
  providers: [ProductService],
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
            <span>
              <mat-icon>update</mat-icon>
              Updated daily
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Content -->
    <div class="category-content">
      <!-- Filter/Sort Bar -->
      <mat-toolbar class="filter-bar">
        <mat-chip-listbox class="filter-chips">
          <mat-chip-option selected>All</mat-chip-option>
          <mat-chip-option>Popular</mat-chip-option>
          <mat-chip-option>Newest</mat-chip-option>
          <mat-chip-option>Price: Low to High</mat-chip-option>
          <mat-chip-option>Price: High to Low</mat-chip-option>
        </mat-chip-listbox>
        <span class="spacer"></span>
        <button mat-stroked-button class="filter-btn">
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
  categoryImage: string = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  totalProducts: number = 0;
  products: any[] = [];
  isLoading: boolean = true;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;
  visiblePages: number[] = [];
  showEllipsis: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryId = params['id'];
      this.loadCategoryData();
      this.loadProducts();
    });
  }

  loadCategoryData() {
    // In a real app, you'd fetch this from your API
    const categories: {[key: string]: {name: string, description: string, image: string}} = {
      'all': {
        name: 'All Products',
        description: 'Browse all official Davido merchandise',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
      },
      'clothing': {
        name: 'Apparel & Fashion',
        description: 'Official Davido clothing including t-shirts, hoodies, and more',
        image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
      },
      'accessories': {
        name: 'Accessories',
        description: 'Hats, bags, and other Davido accessories',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
      },
      'merch': {
        name: 'Home & Lifestyle',
        description: 'Davido branded home goods and lifestyle products',
        image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
      },
      'music': {
        name: 'Music & Collectibles',
        description: 'Vinyl records, CDs, and exclusive collectibles',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
      },
      'limited': {
        name: 'Exclusive Items',
        description: 'Limited edition Davido merchandise',
        image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
      }
    };

    const categoryData = categories[this.categoryId as keyof typeof categories] || categories['all'];
    this.categoryName = categoryData.name;
    this.categoryDescription = categoryData.description;
    this.categoryImage = categoryData.image;
  }

  loadProducts() {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.products = this.mockProducts(12, this.categoryId);
      this.totalProducts = this.products.length;
      this.totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);
      this.updateVisiblePages();
      this.isLoading = false;
    }, 1000);
  }

  mockProducts(count: number, categoryId: string): any[] {
    const products = [];
    const categories: {[key: string]: string[]} = {
      'all': ['T-Shirts', 'Hoodies', 'Caps', 'Accessories', 'Posters', 'Vinyl'],
      'clothing': ['T-Shirts', 'Hoodies', 'Jackets', 'Pants'],
      'accessories': ['Caps', 'Bags', 'Watches', 'Jewelry'],
      'merch': ['Posters', 'Mugs', 'Blankets', 'Towels'],
      'music': ['Vinyl', 'CDs', 'Cassettes', 'Collector Boxes'],
      'limited': ['Signed Merch', 'Limited Edition', 'Rare Items']
    };

    const categoryItems = categories[categoryId as keyof typeof categories] || categories['all'];

    for (let i = 1; i <= count; i++) {
      products.push({
        id: `${categoryId}-${i}`,
        name: `Davido ${categoryItems[i % categoryItems.length]} ${i}`,
        price: 29.99 + (i * 5),
        image: this.getRandomProductImage(),
        category: categoryItems[i % categoryItems.length],
        type: ['Standard', 'Premium', 'Exclusive'][i % 3],
        rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
        reviews: Math.floor(Math.random() * 50),
        isNew: i <= 3,
        isLimited: categoryId === 'limited' || i % 5 === 0
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

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateVisiblePages();
    // In a real app, you'd fetch products for the new page
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