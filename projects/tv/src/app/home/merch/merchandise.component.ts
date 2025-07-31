import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CurrencyPipe } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { QuickViewComponent } from '../../common/component/quick-view.component';
import { ProductInterface, StoreService } from '../../store/services/store.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'async-merchandise',
  standalone: true,
  providers: [StoreService],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    CurrencyPipe,
    MatChipsModule,
    MatDialogModule
  ],
  animations: [
    trigger('slideFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('scaleFade', [
      state('void', style({ opacity: 0, transform: 'scale(0.95)' })),
      transition('void <=> *', animate('300ms ease-out'))
    ])
  ],
  template: `
<section class="premium-merch-section" [@scaleFade]>
  <div class="section-header">
    <div class="header-content">
      <div class="title-container">
        <div class="icon-wrapper">
          <mat-icon class="section-icon" aria-hidden="false" aria-label="Official merchandise">local_mall</mat-icon>
        </div>
        <div class="title-wrapper">
          <h2 class="section-title">Exclusive Davido Merch</h2>
          <p class="section-subtitle">Limited edition collectibles for true fans</p>
        </div>
      </div>
      <a 
        mat-flat-button 
        color="primary" 
        routerLink="/store" 
        class="see-all-btn" 
        aria-label="Browse all merchandise"
      >
        Browse Collection
        <mat-icon>arrow_forward</mat-icon>
      </a>
    </div>
  </div>

  @if (isLoading) {
    <div class="loading-container">
      <mat-spinner diameter="50" strokeWidth="2" color="accent"/>
      <p class="loading-text">Loading featured merch...</p>
    </div>
  }
  @else if (featuredMerch && featuredMerch.length > 0) {
    <div class="carousel-container">
      <button 
        mat-mini-fab 
        class="nav-button prev-button" 
        (click)="previous()" 
        [disabled]="currentIndex === 0"
        aria-label="Previous items"
        matTooltip="Previous"
        [@scaleFade]
      >
        <mat-icon>chevron_left</mat-icon>
      </button>

      <div class="carousel-wrapper">
        <div 
          class="carousel-track" 
          [style.transform]="'translateX(' + (-currentIndex * (100 / itemsPerView)) + '%)'"
        >
          @for (item of featuredMerch; track item._id; let i = $index) {
            <mat-card 
              class="merch-card" 
              [@slideFade] 
              [style.animation-delay]="(i % itemsPerView) * 50 + 'ms'"
              (click)="viewProduct(item._id)"
              (keyup.enter)="viewProduct(item._id)"
              tabindex="0"
              role="button"
            >
              <div class="card-badge-container">
                @if (item.isNewProduct) {
                  <div class="product-badges">
                    <span class="badge new">New</span>
                  </div>
                }
                @if (item.isFeatured) {
                  <div class="product-badges">
                    <span class="badge trending">Trending</span>
                  </div>
                }
                @if (item.isLimitedEdition) {
                  <div class="product-badges">
                    <span class="badge limited">Limited</span>
                  </div>
                }
                @if (item.isLimitedEdition && item.isFeatured) {
                  <div class="product-badges">
                    <span class="badge trending">Trending</span>
                    <span class="badge limited">Limited</span>
                  </div>
                }
              </div>
              
              <div class="card-image-container">
                <img 
                  mat-card-image 
                  [src]="item.images[0].url || './assets/images/placeholder-product.jpg'" 
                  [alt]="item.name + ' product image'" 
                  loading="lazy"
                  class="product-image"
                >
                <div class="quick-view" (click)="openQuickView(item._id); $event.stopPropagation()">
                  <mat-icon>visibility</mat-icon>
                  Quick View
                </div>
              </div>
              
              <mat-card-content class="product-content">
                <h3 class="product-title" [matTooltip]="item.name">{{item.name}}</h3>
                <p class="product-category">{{item.categories[0]}}</p>
                
                <div class="price-container">
                  @if (item.discountedPrice) {
                    <span class="original-price">{{item.price | currency:'NGN':'symbol':'1.2-2'}}</span>
                    <span class="discount-price">{{item.discountedPrice | currency:'NGN':'symbol':'1.2-2'}}</span>
                    @if (item.discountPercent) {
                      <span class="discount-percent">-{{calculateDiscountPercent(item.price, item.discountedPrice)}}%</span>
                    }
                  } @else {
                    <span class="price">{{item.price | currency:'NGN':'symbol':'1.2-2'}}</span>
                  }
                </div>
                
                <div class="rating-container">
                  <div class="stars">
                    @for (star of [1,2,3,4,5]; track star) {
                      <mat-icon [class.filled]="star <= (item?.rating?.average ?? 0)">star</mat-icon>
                    }
                  </div>
                  <span class="review-count">({{item.rating.count || 0}})</span>
                </div>
                
                <!-- <button 
                  mat-stroked-button 
                  color="primary" 
                  class="add-to-cart"
                  (click)="addToCart(item); $event.stopPropagation()"
                  aria-label="Add to cart"
                >
                  <mat-icon>add_shopping_cart</mat-icon>
                  Add to Cart
                </button> -->
                 <button mat-stroked-button color="primary" class="view-details" (click)="viewProduct(item._id)">
              <mat-icon>visibility</mat-icon>
              View Full Details
            </button>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>

      <button 
        mat-mini-fab 
        class="nav-button next-button" 
        (click)="next()" 
        [disabled]="currentIndex >= featuredMerch.length - itemsPerView"
        aria-label="Next items"
        matTooltip="Next"
        [@scaleFade]
      >
        <mat-icon>chevron_right</mat-icon>
      </button>
    </div>

    <div class="carousel-indicators" *ngIf="featuredMerch.length > itemsPerView">
      @for (_ of getIndicatorArray(); track $index) {
        <button 
          [class.active]="$index === currentPage"
          (click)="goToPage($index)"
          [attr.aria-label]="'Go to page ' + ($index + 1)"
          [attr.aria-current]="$index === currentPage ? 'true' : 'false'"
        ></button>
      }
    </div>
  }
  @else if (!isLoading) {
    <div class="no-results" [@scaleFade]>
      <div class="empty-state-icon">
        <mat-icon class="no-results-icon" aria-hidden="false" aria-label="No merchandise found">sentiment_dissatisfied</mat-icon>
      </div>
      <h3>Premium Collection Coming Soon</h3>
      <p>We're preparing something special for true O.B.O fans. Stay tuned!</p>
      <button 
        mat-flat-button 
        color="primary" 
        class="notify-btn"
        (click)="subscribeForUpdates()"
        aria-label="Notify me when available"
      >
        <mat-icon>notifications</mat-icon>
        Notify Me
      </button>
    </div>
  }
</section>
  `,
  styleUrls: ['./merchandise.component.scss']
})
export class MerchandiseComponent implements OnInit {
 featuredMerch: ProductInterface[] = [];
  isLoading = true;
  currentIndex = 0;
  itemsPerView = 5;
  currentPage = 0;

  constructor(
    public router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private storeService: StoreService,
  ) {}

  ngOnInit() {
    this.loadFeaturedProducts();
    this.updateItemsPerView(false);
  }

  loadFeaturedProducts(): void {
    this.isLoading = true;
    this.storeService.getFeaturedProducts().pipe(
      catchError(error => {
        console.error('Error loading featured products:', error);
        return of([]);
      }),
      finalize(() => {
        // Move this into setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isLoading = false;
          this.updateItemsPerView();
          this.cdr.detectChanges();
        });
      })
    ).subscribe(products => {
      // Also wrap this in setTimeout for safety
      setTimeout(() => {
        this.featuredMerch = products;
        this.cdr.detectChanges();
      });
    });
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateItemsPerView();
  }

  subscribeForUpdates() {
    // Implement notification subscription
    console.log('Subscribed for updates');
  }

  getIndicatorArray() {
    return Array(Math.ceil(this.featuredMerch.length / this.itemsPerView)).fill(0);
  }

  updateItemsPerView(shouldDetectChanges = true) {
    if (window.innerWidth >= 1920) {
      this.itemsPerView = 5;
    } else if (window.innerWidth >= 1600) {
      this.itemsPerView = 4;
    } else if (window.innerWidth >= 1200) {
      this.itemsPerView = 3;
    } else if (window.innerWidth >= 900) {
      this.itemsPerView = 2;
    } else {
      this.itemsPerView = 1;
    }
    
    if (this.featuredMerch && this.featuredMerch.length > 0) {
      this.currentIndex = Math.min(this.currentIndex, Math.max(0, this.featuredMerch.length - this.itemsPerView));
      this.currentPage = Math.floor(this.currentIndex / this.itemsPerView);
    }
    
    if (shouldDetectChanges) {
      this.cdr.detectChanges();
    }
  }

  next() {
    const nextIndex = this.currentIndex + this.itemsPerView;
    if (nextIndex <= this.featuredMerch.length - this.itemsPerView) {
      this.currentIndex = nextIndex;
      this.currentPage = Math.floor(this.currentIndex / this.itemsPerView);
    } else if (nextIndex < this.featuredMerch.length) {
      this.currentIndex = this.featuredMerch.length - this.itemsPerView;
      this.currentPage = Math.floor(this.currentIndex / this.itemsPerView);
    }
    this.cdr.detectChanges();
  }

  previous() {
    const prevIndex = this.currentIndex - this.itemsPerView;
    this.currentIndex = Math.max(0, prevIndex);
    this.currentPage = Math.floor(this.currentIndex / this.itemsPerView);
    this.cdr.detectChanges();
  }

  goToPage(page: number) {
    this.currentIndex = page * this.itemsPerView;
    this.currentPage = page;
    this.cdr.detectChanges();
  }

  viewProduct(id: string) {
    this.router.navigate(['/store/product', id]);
  }

  openQuickView(productId: string): void {
    const product = this.featuredMerch.find(item => item._id === productId);
    if (!product) return;

    const dialogRef = this.dialog.open(QuickViewComponent, {
      width: '90%',
      maxWidth: '900px',
      panelClass: 'quick-view-dialog-container',
      data: product
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'view_details') {
        this.viewProduct(productId);
      } else if (result === 'added_to_cart') {
        //this.addToCart(product);
      }
    });
  }

  calculateDiscountPercent(originalPrice: number, discountedPrice: number): number {
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  }
}