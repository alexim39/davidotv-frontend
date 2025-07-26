import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CategoryNavComponent } from './nav.component';

@Component({
  selector: 'app-shop-index',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CategoryNavComponent,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  template: `
    <!-- Main Container -->
    <div class="shop-home">
      <!-- Hero Banner -->
      <mat-card class="hero-banner mat-elevation-z0">
        <div class="hero-content">
          <h1>Official Davido Merchandise</h1>
          <div class="animated-text-container">
            <div *ngFor="let message of messages; let i = index" 
                 class="animated-text"
                 [class.active]="currentIndex === i"
                 [class.prev]="currentIndex === (i === 0 ? messages.length - 1 : i - 1)"
                 [class.next]="currentIndex === (i === messages.length - 1 ? 0 : i + 1)">
              {{ message }}
            </div>
          </div>
          <button mat-raised-button color="primary" routerLink="/store/category/all" class="shop-now-btn">
            Shop Now
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>
      </mat-card>

      <!-- Category Navigation -->
      <app-category-nav/> 
      <!-- Router outlet -->  
      <router-outlet/>
    </div>
  `,
  styles: [`
    .shop-home {
      padding: 0 16px 40px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .hero-banner {
      background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
      url('/img/store/shopping.png');
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
      border-radius: 8px !important;
      overflow: hidden;

      .hero-content {
        max-width: 800px;
        padding: 0 20px;
        z-index: 1;

        h1 {
          font-size: 3.5rem;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          font-weight: 700;
        }

        .animated-text-container {
          height: 80px;
          position: relative;
          margin-bottom: 30px;
          perspective: 1000px;
          overflow: hidden;
        }

        .animated-text {
          position: absolute;
          left: 0;
          right: 0;
          margin: 0 auto;
          font-size: 1.5rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          opacity: 0;
          transform: translateY(20px) rotateX(-20deg);
          transition: all 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
        }

        .animated-text.active {
          opacity: 1;
          transform: translateY(0) rotateX(0);
          z-index: 2;
        }

        .animated-text.prev {
          opacity: 0;
          transform: translateY(-20px) rotateX(20deg);
          z-index: 1;
        }

        .animated-text.next {
          opacity: 0;
          transform: translateY(20px) rotateX(-20deg);
          z-index: 1;
        }
      }

      @media (max-width: 768px) {
        height: 400px;

        .hero-content {
          h1 {
            font-size: 2.5rem;
          }

          .animated-text {
            font-size: 1.2rem;
          }

          .animated-text-container {
            height: 60px;
          }
        }
      }
    }
  `]
})
export class ShopIndexComponent implements OnInit, OnDestroy {
  messages = [
    "Own the style. Shop Davido’s exclusive apparel, accessories, and collectibles",
    "Don’t miss out — limited edition merch, only at this store",
    "Wear what Davido wears — shop our premium products.",
    "Rep your 30BG pride — the official fan way",
    "Wear your support for Africa’s biggest star — quality guaranteed"
  ];
  currentIndex = 0;
  private intervalId: number = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.startAutoRotation();
  }

  ngOnDestroy() {
    this.clearAutoRotation();
  }

  startAutoRotation() {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.messages.length;
      this.cdr.detectChanges(); 
    }, 5000);
  }

  clearAutoRotation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}