import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { ProductGridComponent } from '../components/product-grid.component';
import { CategoryNavComponent } from '../components/category-nav.component';

@Component({
selector: 'app-shop-home',
standalone: true,
imports: [CommonModule, RouterModule, ProductGridComponent, CategoryNavComponent],
template: `
<!-- Category Navigation -->
  <app-category-nav></app-category-nav>

  
<div class="shop-home">
  <!-- Hero Banner -->
  <section class="hero-banner">
    <div class="hero-content">
      <h1>Official Davido Merchandise</h1>
      <p>Shop exclusive Davido branded apparel, accessories and collectibles</p>
      <a routerLink="/shop/category/all" class="shop-now-btn">Shop Now</a>
    </div>
  </section>


  <!-- Featured Products -->
  <section class="featured-section">
    <div class="section-header">
      <h2>Featured Products</h2>
      <a routerLink="/shop/category/featured" class="view-all">View All</a>
    </div>
    <app-product-grid [products]="featuredProducts"></app-product-grid>
  </section>

  <!-- Rest of the template remains the same -->
  <section class="new-arrivals-section">
    <div class="section-header">
      <h2>New Arrivals</h2>
      <a routerLink="/shop/category/new" class="view-all">View All</a>
    </div>
    <app-product-grid [products]="newArrivals"></app-product-grid>
  </section>

  <div class="category-promos">
    <div class="promo-banner clothing-promo">
      <div class="promo-content">
        <h3>Davido Clothing</h3>
        <a routerLink="/shop/category/clothing" class="promo-link">Shop Now</a>
      </div>
    </div>
    <div class="promo-banner accessories-promo">
      <div class="promo-content">
        <h3>Accessories</h3>
        <a routerLink="/shop/category/accessories" class="promo-link">Shop Now</a>
      </div>
    </div>
  </div>

  <section class="limited-section">
    <div class="section-header">
      <h2>Limited Edition</h2>
      <p>Get these exclusive items before they're gone</p>
    </div>
    <app-product-grid [products]="productService.getProducts({ category: 'limited' })"></app-product-grid>
  </section>
</div>

`,
styles: [`
  .shop-home {
  padding-bottom: 40px;
}

.hero-banner {
  //background: linear-gradient(rgba(0, 0, 0, 0.6), url('https://example.com/images/davido-banner.jpg');
  background-size: cover;
  background-position: center;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  margin-bottom: 40px;
  position: relative;

  .hero-content {
    max-width: 800px;
    padding: 0 20px;
    z-index: 1;

    h1 {
      font-size: 3.5rem;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    p {
      font-size: 1.5rem;
      margin-bottom: 30px;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
  }

  .shop-now-btn {
    display: inline-block;
    padding: 12px 30px;
    background: #E91E63;
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
    border-radius: 30px;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      background: #C2185B;
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
  }

  @media (max-width: 768px) {
    height: 400px;

    .hero-content {
      h1 {
        font-size: 2.5rem;
      }

      p {
        font-size: 1.2rem;
      }
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 20px;

  h2 {
    font-size: 2rem;
    color: #333;
    margin: 0;
  }

  p {
    color: #666;
    margin: 10px 0 0;
  }

  .view-all {
    color: #2196F3;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;

    &:hover {
      color: #0d8aee;
      text-decoration: underline;
    }
  }
}

.featured-section, .new-arrivals-section, .limited-section {
  margin-bottom: 50px;
}

.category-promos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin: 40px 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.promo-banner {
  height: 250px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;

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
    }
  }

  .promo-link {
    display: inline-block;
    padding: 8px 20px;
    background: white;
    color: #333;
    text-decoration: none;
    border-radius: 20px;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      background: #f5f5f5;
      transform: scale(1.05);
    }
  }
}

.clothing-promo {
  background-image: url('https://example.com/images/clothing-banner.jpg');
}

.accessories-promo {
  background-image: url('https://example.com/images/accessories-banner.jpg');
}
`]
})
export class ShopHomeComponent {
  featuredProducts: any;
  newArrivals: any;

  constructor(public productService: ProductService) {}

  ngOnInit() {
    this.featuredProducts = this.productService.getFeaturedProducts();
    this.newArrivals = this.productService.getNewArrivals();
  }
}