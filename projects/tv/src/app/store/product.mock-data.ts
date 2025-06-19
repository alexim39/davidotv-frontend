import { Product } from "./models/product.model";

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Davido Official Logo T-Shirt',
    description: 'Premium quality cotton t-shirt with Davido official logo print',
    longDescription: 'This premium quality t-shirt features the official Davido logo printed on the front. Made from 100% soft cotton for maximum comfort. Machine washable. Imported.',
    price: 29.99,
    originalPrice: 39.99,
    discountPercentage: 25,
    images: [
      'https://example.com/products/davido-tshirt-1.jpg',
      'https://example.com/products/davido-tshirt-2.jpg',
      'https://example.com/products/davido-tshirt-3.jpg'
    ],
    videoUrl: 'https://example.com/videos/davido-tshirt.mp4',
    rating: 4.8,
    reviewCount: 124,
    isFeatured: true,
    isNew: false,
    isLimited: false,
    inStock: true,
    stockQuantity: 45,
    sku: 'DTS-001-BLK',
    colors: [
      { name: 'Black', code: '#000000' },
      { name: 'White', code: '#FFFFFF' },
      { name: 'Red', code: '#FF0000' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    categories: ['clothing', 'merch'],
    tags: ['t-shirt', 'official', 'logo'],
    hasAR: true
  },
  {
    id: '2',
    name: 'Davido Signature Cap',
    description: 'Official Davido signature snapback cap',
    longDescription: 'Show your support with this official Davido signature snapback cap. Adjustable strap for perfect fit. 100% cotton with embroidered Davido logo. One size fits most.',
    price: 24.99,
    images: [
      'https://example.com/products/davido-cap-1.jpg',
      'https://example.com/products/davido-cap-2.jpg'
    ],
    rating: 4.9,
    reviewCount: 89,
    isFeatured: true,
    isNew: true,
    isLimited: true,
    inStock: true,
    stockQuantity: 12,
    sku: 'DC-001-BLK',
    colors: [
      { name: 'Black', code: '#000000', image: 'https://example.com/products/davido-cap-black.jpg' },
      { name: 'Red', code: '#FF0000', image: 'https://example.com/products/davido-cap-red.jpg' },
      { name: 'Navy Blue', code: '#000080', image: 'https://example.com/products/davido-cap-navy.jpg' }
    ],
    sizes: ['One Size'],
    categories: ['accessories', 'merch'],
    tags: ['cap', 'hat', 'signature'],
    hasAR: true
  },
  {
    id: '3',
    name: 'Davido "Timeless" Hoodie',
    description: 'Limited edition "Timeless" album hoodie',
    longDescription: 'Celebrate Davido\'s "Timeless" album with this limited edition hoodie. Premium heavyweight cotton blend with embroidered album artwork on the back. Ribbed cuffs and waistband for comfort.',
    price: 59.99,
    originalPrice: 69.99,
    images: [
      'https://example.com/products/timeless-hoodie-1.jpg',
      'https://example.com/products/timeless-hoodie-2.jpg',
      'https://example.com/products/timeless-hoodie-3.jpg'
    ],
    rating: 4.7,
    reviewCount: 56,
    isFeatured: false,
    isNew: true,
    isLimited: true,
    inStock: true,
    stockQuantity: 8,
    sku: 'DTH-001-GRY',
    colors: [
      { name: 'Gray', code: '#808080' },
      { name: 'Black', code: '#000000' }
    ],
    sizes: ['M', 'L', 'XL'],
    categories: ['clothing', 'limited'],
    tags: ['hoodie', 'album', 'timeless'],
    hasAR: false
  },
  {
    id: '4',
    name: 'Davido "A Better Time" Mug',
    description: 'Ceramic coffee mug with "A Better Time" album artwork',
    longDescription: 'Start your day with Davido! High-quality ceramic mug featuring "A Better Time" album artwork. Microwave and dishwasher safe. Holds 12oz of your favorite beverage.',
    price: 14.99,
    images: [
      'https://example.com/products/davido-mug-1.jpg',
      'https://example.com/products/davido-mug-2.jpg'
    ],
    rating: 4.5,
    reviewCount: 42,
    isFeatured: false,
    isNew: false,
    isLimited: false,
    inStock: true,
    stockQuantity: 30,
    sku: 'DM-001-WHT',
    colors: [
      { name: 'White', code: '#FFFFFF' }
    ],
    sizes: ['One Size'],
    categories: ['accessories'],
    tags: ['mug', 'album', 'coffee'],
    hasAR: false
  },
  {
    id: '5',
    name: 'Davido "FEM" Lyrics T-Shirt',
    description: 'T-shirt featuring lyrics from the hit song "FEM"',
    longDescription: 'Show off your favorite Davido lyrics with this "FEM" t-shirt. 100% cotton with high-quality screen print. Machine washable. Available in multiple colors.',
    price: 27.99,
    images: [
      'https://example.com/products/fem-tshirt-1.jpg',
      'https://example.com/products/fem-tshirt-2.jpg'
    ],
    rating: 4.6,
    reviewCount: 78,
    isFeatured: true,
    isNew: false,
    isLimited: false,
    inStock: true,
    stockQuantity: 22,
    sku: 'DFT-001-BLK',
    colors: [
      { name: 'Black', code: '#000000' },
      { name: 'White', code: '#FFFFFF' },
      { name: 'Yellow', code: '#FFFF00' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    categories: ['clothing', 'merch'],
    tags: ['t-shirt', 'lyrics', 'fem'],
    hasAR: false
  },
  {
    id: '6',
    name: 'Davido "Assurance" Phone Case',
    description: 'Premium phone case with "Assurance" artwork',
    longDescription: 'Protect your phone in style with this Davido "Assurance" themed case. Compatible with most smartphone models. Durable shock-absorbent material with precise cutouts.',
    price: 19.99,
    originalPrice: 24.99,
    images: [
      'https://example.com/products/assurance-case-1.jpg',
      'https://example.com/products/assurance-case-2.jpg'
    ],
    rating: 4.3,
    reviewCount: 35,
    isFeatured: false,
    isNew: true,
    isLimited: false,
    inStock: true,
    stockQuantity: 15,
    sku: 'DAC-001-BLK',
    colors: [
      { name: 'Black', code: '#000000' },
      { name: 'Clear', code: '#FFFFFF' }
    ],
    sizes: ['iPhone 13', 'iPhone 14', 'Samsung S22', 'Samsung S23'],
    categories: ['accessories'],
    tags: ['phone case', 'assurance'],
    hasAR: false
  },
  {
    id: '7',
    name: 'Davido "OBO" Throw Pillow',
    description: 'Decorative throw pillow with "OBO" logo',
    longDescription: 'Add some Davido flair to your home with this "OBO" throw pillow. High-quality polyester cover with hidden zipper. Removable cover for easy cleaning. 18" x 18".',
    price: 34.99,
    images: [
      'https://example.com/products/obo-pillow-1.jpg',
      'https://example.com/products/obo-pillow-2.jpg'
    ],
    rating: 4.4,
    reviewCount: 28,
    isFeatured: false,
    isNew: false,
    isLimited: false,
    inStock: true,
    stockQuantity: 10,
    sku: 'DTP-001-BLK',
    colors: [
      { name: 'Black', code: '#000000' },
      { name: 'Gold', code: '#FFD700' }
    ],
    sizes: ['18" x 18"'],
    categories: ['merch'],
    tags: ['pillow', 'home', 'decor'],
    hasAR: false
  },
  {
    id: '8',
    name: 'Davido "30BG" Crewneck Sweatshirt',
    description: 'Comfortable crewneck sweatshirt with "30BG" logo',
    longDescription: 'Stay cozy in this premium crewneck sweatshirt featuring the "30BG" logo. 80% cotton, 20% polyester blend for warmth and comfort. Ribbed cuffs and waistband.',
    price: 49.99,
    originalPrice: 59.99,
    images: [
      'https://example.com/products/30bg-sweatshirt-1.jpg',
      'https://example.com/products/30bg-sweatshirt-2.jpg'
    ],
    rating: 4.7,
    reviewCount: 63,
    isFeatured: true,
    isNew: false,
    isLimited: true,
    inStock: true,
    stockQuantity: 5,
    sku: 'DCS-001-GRY',
    colors: [
      { name: 'Gray', code: '#808080' },
      { name: 'Navy', code: '#000080' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    categories: ['clothing', 'limited'],
    tags: ['sweatshirt', 'crewneck', '30bg'],
    hasAR: false
  }
];