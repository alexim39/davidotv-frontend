import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from '../../common/services/api.service';


export interface ProductInterface {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  images: [{
    url: string;
    altText: string;
    _id: string;
  }];
  categories: string[];
  type: string;
  rating: {
    average: number;
    count: number;
  };
  reviews: number;
  isNewProduct: boolean;
  isLimitedEdition: boolean;
  inventory: {
    stock: number;
    sku: string;
    barcode: string;
  };
  shippingInfo: {
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    weight: number;
    isDigital: boolean;
  };
  isFeatured: boolean;
  tags: string[];
  brand: string;
  artistCollection: string;
  variants: any[]; // You might want to create a specific interface for variants
  relatedProducts: any[]; // You might want to create a specific interface for related products
  releaseDate: string | Date;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  discountPercent?: number; // Optional field for discount percentage
}

@Injectable()
export class StoreService {
  private readonly baseEndpoint = 'store'; // API endpoint for products

  constructor(private apiService: ApiService) {}

  // Get all products (with optional pagination and filters)
  getProducts(params: any = {}): Observable<{ products: ProductInterface[]; total: number }> {
    let httpParams = new HttpParams();
    
    // Add all provided parameters to the request
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    }

    return this.apiService.get<{ data: ProductInterface[]; total: number }>(
      this.baseEndpoint,
      httpParams, undefined, true
    ).pipe(
      map(response => ({
        products: response.data,
        total: response.total
      })),
      catchError(error => {
        console.error('Error fetching products:', error);
        return of({ products: [], total: 0 });
      })
    );
  }

  // Get products by category
  getProductsByCategory(categoryId: string, page: number = 1, limit: number = 12): Observable<{ products: ProductInterface[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('category', categoryId === 'all' ? '' : categoryId);

    return this.getProducts(params);
  }

  // Get featured products
  getFeaturedProducts(limit: number = 4): Observable<ProductInterface[]> {
    const params = new HttpParams()
      .set('isFeatured', 'true')
      .set('limit', limit.toString());

    return this.getProducts(params).pipe(
      map(response => response.products)
    );
  }

  // Get new arrivals
  getNewArrivals(limit: number = 4): Observable<ProductInterface[]> {
    const params = new HttpParams()
      .set('isNewProduct', 'true')
      .set('limit', limit.toString())
      .set('sort', '-createdAt');

    return this.getProducts(params).pipe(
      map(response => response.products)
    );
  }

  // Get limited edition products
  getLimitedEdition(limit: number = 4): Observable<ProductInterface[]> {
    const params = new HttpParams()
      .set('isLimitedEdition', 'true')
      .set('limit', limit.toString())
      .set('sort', '-createdAt');

    return this.getProducts(params).pipe(
      map(response => response.products)
    );
  }

  // Get a single product by ID
  getProductById(id: string): Observable<ProductInterface | null> {
    return this.apiService.get<{ data: ProductInterface }>(
      `${this.baseEndpoint}/${id}`
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error(`Error fetching product with ID ${id}:`, error);
        return of(null);
      })
    );
  }

  // Search products
  searchProducts(query: string): Observable<ProductInterface[]> {
    const params = new HttpParams().set('search', query);
    
    return this.getProducts(params).pipe(
      map(response => response.products)
    );
  }

  // Get related products (for product detail page)
  getRelatedProducts(productId: string, limit: number = 4): Observable<ProductInterface[]> {
    const params = new HttpParams().set('limit', limit.toString());

    return this.apiService.get<{ data: ProductInterface[] }>(
      `${this.baseEndpoint}/${productId}/related`,
      params
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error(`Error fetching related products for ${productId}:`, error);
        return of([]);
      })
    );
  }






  
  
  
  // Get multiple products by IDs
  getProductsByIds(ids: string[]): Observable<ProductInterface[]> {
    return this.apiService.post<{ data: ProductInterface[] }>(`${this.baseEndpoint}/batch`, { ids }  ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching products:', error);
        return of([]);
      })
    );
  }





 /*   // Add to cart
  addToCart(productId: string, userId: string, quantity: number = 1, selectedVariant?: { name: string, option: string }): Observable<any> {
    const payload = { productId, quantity, selectedVariant,  userId  };
    
    return this.apiService.post<any>(`${this.baseEndpoint}/cart/add`, payload)
  }
 */


  // Add to wishlist
  addToWishlist(productId: string, userId: string): Observable<any> {
    return this.apiService.post<any>(`${this.baseEndpoint}/wishlist/add`, { productId, userId })
  }


  // Get user wishlist
  getUserWishlist(userId: string): Observable<ProductInterface[]> {
    return this.apiService.get<{ data: ProductInterface[] }>(`${this.baseEndpoint}/wishlist/${userId}`).pipe(
      map(response => response.data),
    );
  }

  // Remove from wishlist
  removeFromWishlist(productId: string, userId: string): Observable<any> {
    return this.apiService.post<any>(`${this.baseEndpoint}/wishlist/remove`, { productId, userId });
  }

}