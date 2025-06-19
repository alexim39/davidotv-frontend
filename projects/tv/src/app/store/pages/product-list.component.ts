import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import { ProductFilter } from '../models/product.model';
import { ProductGridComponent } from '../components/product-grid.component';
import { FilterSidebarComponent } from '../components/filter-sidebar.component';

@Component({
selector: 'app-product-list',
standalone: true,
imports: [CommonModule, ProductGridComponent, FilterSidebarComponent],
template: `
<div class="product-list-container">
  <app-filter-sidebar (filterChange)="onFilterChange($event)"></app-filter-sidebar>
  
  <div class="product-list-content">
    <div class="list-header">
      <h2>Davido Merchandise</h2>
      <div class="product-count">{{ products.length }} products</div>
    </div>
    
    <app-product-grid [products]="products"></app-product-grid>
  </div>
</div>
`,
styles: [`
.product-list-container {
  display: flex;
  gap: 30px;
  padding: 20px 0;
  
  .product-list-content {
    flex: 1;
    
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      h2 {
        margin: 0;
        font-size: 24px;
        color: #333;
      }
      
      .product-count {
        color: #666;
        font-size: 14px;
      }
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
}
`]
})
export class ProductListComponent {
  currentFilters: ProductFilter = {};
  
  products: any[] = [];

  constructor(private productService: ProductService) {
    this.products = this.productService.getProducts();
  }

  onFilterChange(filters: ProductFilter) {
    this.currentFilters = filters;
    this.products = this.productService.getProducts(filters);
  }
}