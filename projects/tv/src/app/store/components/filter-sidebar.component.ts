import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductFilter } from '../models/product.model';

@Component({
selector: 'app-filter-sidebar',
standalone: true,
imports: [CommonModule, FormsModule],
template: `
<div class="filter-sidebar">
  <div class="filter-section">
    <h3>Price Range</h3>
    <div class="filter-options">
      <label *ngFor="let range of priceRanges">
        <input type="radio" name="priceRange" 
               [value]="range" 
               [(ngModel)]="filters.priceRange"
               (change)="updateFilters()">
        {{ range.label }}
      </label>
    </div>
  </div>
  
  <div class="filter-section">
    <h3>Colors</h3>
    <div class="filter-options">
      <label *ngFor="let color of colors">
        <input type="checkbox" 
               [value]="color"
               [(ngModel)]="filters.colors"
               (change)="updateFilters()">
        {{ color }}
      </label>
    </div>
  </div>
  
  <div class="filter-section">
    <h3>Sizes</h3>
    <div class="filter-options">
      <label *ngFor="let size of sizes">
        <input type="checkbox" 
               [value]="size"
               [(ngModel)]="filters.sizes"
               (change)="updateFilters()">
        {{ size }}
      </label>
    </div>
  </div>
  
  <div class="filter-section">
    <h3>Sort By</h3>
    <select class="sort-select" 
            [(ngModel)]="filters.sortBy"
            (change)="updateFilters()">
      <option *ngFor="let option of sortOptions" [value]="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
  
  <button class="clear-filters" (click)="clearFilters()">
    Clear All Filters
  </button>
</div>
`,
styles: [`
.filter-sidebar {
  width: 250px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  
  .filter-section {
    margin-bottom: 25px;
    
    h3 {
      font-size: 16px;
      margin: 0 0 15px;
      color: #333;
    }
  }
  
  .filter-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #555;
      cursor: pointer;
      
      input {
        margin: 0;
      }
    }
  }
  
  .sort-select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .clear-filters {
    width: 100%;
    padding: 8px;
    background: #f5f5f5;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease;
    
    &:hover {
      background: #eee;
    }
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 20px;
  }
}
    `]
})
export class FilterSidebarComponent {
  @Output() filterChange = new EventEmitter<ProductFilter>();
  
  priceRanges = [
    { label: 'Under $20', min: 0, max: 20 },
    { label: '$20 to $50', min: 20, max: 50 },
    { label: '$50 to $100', min: 50, max: 100 },
    { label: 'Over $100', min: 100, max: Infinity }
  ];
  
  colors = ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow'];
  sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  sortOptions = [
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'popular', label: 'Most Popular' }
  ];
  
  filters: ProductFilter = {};
  
  updateFilters() {
    this.filterChange.emit(this.filters);
  }
  
  clearFilters() {
    this.filters = {};
    this.updateFilters();
  }
}