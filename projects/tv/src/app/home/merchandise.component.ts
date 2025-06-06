import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
selector: 'async-merchandise',
imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
],
template: `


<section class="merch-section">
  <div class="section-header">
    <mat-icon class="section-icon">storefront</mat-icon>
    <h2>Official Merchandise</h2>
    <button mat-button class="see-all" routerLink="/store">Visit Store</button>
  </div>

  <div class="merch-grid">
    <mat-card *ngFor="let item of featuredMerch" class="merch-card">
      <img mat-card-image [src]="item.image" [alt]="item.name" loading="lazy">
      <mat-card-content>
        <h3>{{ item.name }}</h3>
        <p class="price">{{ item.price | currency }}</p>
        <button mat-stroked-button color="primary" (click)="viewProduct(item.id)">
          View Details
        </button>
      </mat-card-content>
    </mat-card>
  </div>
</section>



`,
styles: [`


.merch-grid {
  display: grid;
  gap: 16px;
  padding: 0 16px;
  margin-bottom: 32px;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    padding: 0 8px;
    gap: 12px;
  }
}

.merch-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .price {
    font-weight: bold;
    color: #8f0045;
    margin: 8px 0;
    font-size: 16px;
  }

  button {
    width: 100%;
  }

  @media (max-width: 600px) {
    &:hover {
      transform: none;
    }
  }
}

.section-header {
  display: flex;
  align-items: center;
  margin: 24px 16px 16px;

  .section-icon {
    margin-right: 8px;
    color: #8f0045;
  }

  h2 {
    margin: 0;
    flex: 1;
    font-size: clamp(1rem, 2vw, 1.25rem);
    font-weight: 500;
  }

  .see-all {
    color: #8f0045;
  }

  @media (max-width: 600px) {
    margin: 16px 8px 12px;
  }
}


`]
})
export class MerchandiseComponent {

    @Input() featuredMerch: any[] = [];

    viewProduct(id: string) {
        // Implement or emit event if needed
        console.log('View product ID:', id);
    }
}