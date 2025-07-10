import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, tap } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  type: string;
  rating: number;
  reviews: number;
  isNew: boolean;
  isLimited: boolean;
  stock: number;
  createdAt: Date;
}

@Injectable()
export class ProductService {
  private products: Product[] = [];
  private apiUrl = 'api/products'; // In a real app, this would be your backend API endpoint

  constructor(private http: HttpClient) {
    this.initializeMockData();
  }

  // Initialize mock data for demonstration
  private initializeMockData() {
    const categories = [
      { id: 'clothing', name: 'Apparel & Fashion' },
      { id: 'accessories', name: 'Accessories' },
      { id: 'merch', name: 'Home & Lifestyle' },
      { id: 'music', name: 'Music & Collectibles' },
      { id: 'limited', name: 'Exclusive' }
    ];

    const types = ['Standard', 'Premium', 'Exclusive', 'Limited Edition'];

    // Generate mock products
    for (let i = 1; i <= 50; i++) {
      const category = categories[i % categories.length];
      const isNew = i <= 10;
      const isLimited = category.id === 'limited' || i % 7 === 0;
      
      this.products.push({
        id: `${category.id}-${i}`,
        name: `Davido ${category.name.split(' ')[0]} ${i}`,
        description: `Official Davido ${category.name.toLowerCase()} product. ${isLimited ? 'Limited availability!' : ''}`,
        price: 19.99 + (i * 3) + (isLimited ? 20 : 0),
        image: this.getRandomProductImage(),
        category: category.id,
        type: types[i % types.length],
        rating: Math.floor(Math.random() * 2) + 3, // 3-5 stars
        reviews: Math.floor(Math.random() * 50),
        isNew,
        isLimited,
        stock: isLimited ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 100) + 20,
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)) // Staggered dates
      });
    }
  }

  private getRandomProductImage(): string {
    const images = [
      'https://m.media-amazon.com/images/I/61-jBuhtgZL._AC_UY1100_.jpg',
      'https://i.ebayimg.com/images/g/9~AAAOSwPc9V2H6~/s-l1600.jpg',
      'https://i5.walmartimages.com/asr/9a9f8f3f-5a5e-4f9b-8b8e-5e8f5b5e5e5e_1.3b9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c.jpeg',
      'https://static-01.daraz.com.np/p/7a9a9a9a9a9a9a9a9a9a9a9a9a9a9a9a.jpg',
      'https://example.com/path/to/product-image-1.jpg',
      'https://example.com/path/to/product-image-2.jpg',
      'https://example.com/path/to/product-image-3.jpg'
    ];
    return images[Math.floor(Math.random() * images.length)];
  }

  // Get all products (with optional pagination)
  getProducts(page: number = 1, limit: number = 12): Observable<{ products: Product[]; total: number }> {
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProducts = this.products.slice(start, end);
    
    // Simulate API delay
    return of({
      products: paginatedProducts,
      total: this.products.length
    }).pipe(delay(500));
  }

  // Get products by category
  getProductsByCategory(categoryId: string, page: number = 1, limit: number = 12): Observable<{ products: Product[]; total: number }> {
    let filteredProducts = this.products;
    
    if (categoryId !== 'all') {
      filteredProducts = this.products.filter(p => p.category === categoryId);
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProducts = filteredProducts.slice(start, end);
    
    return of({
      products: paginatedProducts,
      total: filteredProducts.length
    }).pipe(delay(500));
  }

  // Get featured products
  getFeaturedProducts(limit: number = 4): Observable<Product[]> {
    const featured = this.products
      .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
      .slice(0, limit);
    
    return of(featured).pipe(delay(300));
  }

  // Get new arrivals
  getNewArrivals(limit: number = 4): Observable<Product[]> {
    const newArrivals = this.products
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    return of(newArrivals).pipe(delay(300));
  }

  // Get limited edition products
  getLimitedEdition(limit: number = 4): Observable<Product[]> {
    const limited = this.products
      .filter(p => p.isLimited)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    return of(limited).pipe(delay(300));
  }

  // Get a single product by ID
  getProductById(id: string): Observable<Product | undefined> {
    const product = this.products.find(p => p.id === id);
    return of(product).pipe(
      delay(300),
      tap(p => {
        if (!p) {
          console.warn(`Product with ID ${id} not found`);
        }
      })
    );
  }

  // Search products
  searchProducts(query: string): Observable<Product[]> {
    const normalizedQuery = query.toLowerCase();
    const results = this.products.filter(p => 
      p.name.toLowerCase().includes(normalizedQuery) || 
      p.description.toLowerCase().includes(normalizedQuery)
    );
    
    return of(results).pipe(delay(500));
  }

  // Get related products (for product detail page)
  getRelatedProducts(productId: string, limit: number = 4): Observable<Product[]> {
    const product = this.products.find(p => p.id === productId);
    if (!product) return of([]);
    
    const related = this.products
      .filter(p => p.id !== productId && p.category === product.category)
      .sort(() => 0.5 - Math.random()) // Randomize
      .slice(0, limit);
    
    return of(related).pipe(delay(300));
  }
}