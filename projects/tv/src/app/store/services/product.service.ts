import { Injectable } from '@angular/core';
import { Product, ProductFilter } from '../models/product.model';
import { mockProducts } from './../product.mock-data';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = mockProducts;

  getProducts(filter?: ProductFilter): Product[] {
    let result = [...this.products];
    
    if (filter) {
      if (filter.category) {
        result = result.filter(p => p.categories.includes(filter.category!));
      }
      
      if (filter.priceMin) {
        result = result.filter(p => p.price >= filter.priceMin!);
      }
      
      if (filter.priceMax) {
        result = result.filter(p => p.price <= filter.priceMax!);
      }
      
      if (filter.colors?.length) {
        result = result.filter(p => 
          p.colors.some(c => filter.colors!.includes(c.name))
        );
      }
      
      if (filter.sizes?.length) {
        result = result.filter(p => 
          p.sizes.some(s => filter.sizes!.includes(s))
        );
      }
      
      if (filter.sortBy) {
        switch (filter.sortBy) {
          case 'price-asc':
            result.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            result.sort((a, b) => b.price - a.price);
            break;
          case 'newest':
            // Assuming newer products have higher IDs
            result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
            break;
          case 'popular':
            result.sort((a, b) => b.rating - a.rating);
            break;
        }
      }
    }
    
    return result;
  }

  getProductById(id: string): Product {
    const product = this.products.find(p => p.id === id);
    if (!product) throw new Error(`Product with ID ${id} not found`);
    return product;
  }

  getFeaturedProducts(): Product[] {
    return this.products.filter(p => p.isFeatured).slice(0, 8);
  }

  getNewArrivals(): Product[] {
    return this.products.filter(p => p.isNew).slice(0, 8);
  }

  getRelatedProducts(productId: string): Product[] {
    const product = this.getProductById(productId);
    return this.products
      .filter(p => 
        p.id !== productId && 
        p.categories.some(c => product.categories.includes(c))
      )
      .slice(0, 4);
  }
}