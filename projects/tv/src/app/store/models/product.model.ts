export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images: string[];
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isLimited?: boolean;
  inStock: boolean;
  stockQuantity?: number;
  sku: string;
  colors: ProductColor[];
  sizes: string[];
  categories: string[];
  tags: string[];
  hasAR?: boolean;
}

export interface ProductColor {
  name: string;
  code: string;
  image?: string;
}

export interface ProductFilter {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  colors?: string[];
  sizes?: string[];
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular';

  priceRange?: { label: string; min: number; max: number };

}