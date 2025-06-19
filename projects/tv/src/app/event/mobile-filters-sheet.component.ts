import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

interface FilterSheetData {
  categories: string[];
  selectedCategory: string | null;
}

@Component({
  selector: 'app-mobile-filters-sheet',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule, 
    MatButtonModule, 
    MatIconModule
  ],
  template: `
    <div class="mobile-filters-sheet">
      <header class="sheet-header">
        <h2 class="sheet-title">Filter Events</h2>
        <button mat-icon-button 
                aria-label="Close filters" 
                (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </header>
      
      <mat-selection-list>
        <mat-list-option 
          *ngFor="let category of categories" 
          [selected]="category === selectedCategory"
          (click)="applyFilter(category)">
          <div class="category-option">
            <mat-icon class="category-icon" *ngIf="category === selectedCategory">
              check_circle
            </mat-icon>
            <span class="category-label">{{category}}</span>
          </div>
        </mat-list-option>
      </mat-selection-list>

      <div class="sheet-actions">
        <button mat-stroked-button (click)="clearFilters()">
          Clear All
        </button>
        <button mat-flat-button 
                color="primary" 
                (click)="applyFilters()">
          Apply Filters
        </button>
      </div>
    </div>
  `,
  styles: [`
    .mobile-filters-sheet {
      padding: 16px;
      display: flex;
      flex-direction: column;
      min-height: 60vh;
      
      .sheet-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        .sheet-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 500;
          color: #3f51b5; /* Primary color */
        }
      }
      
      mat-selection-list {
        flex: 1;
        padding: 0;
        overflow-y: auto;
        
        mat-list-option {
          height: 56px;
          padding: 0 16px;
          
          .category-option {
            display: flex;
            align-items: center;
            width: 100%;
            
            .category-icon {
              margin-right: 16px;
              color: #3f51b5;
            }
            
            .category-label {
              flex: 1;
            }
          }
        }
      }
      
      .sheet-actions {
        display: flex;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.12);
        
        button {
          flex: 1;
        }
      }
    }
  `]
})
export class MobileFiltersSheetComponent {
  categories = [
    'All Events',
    'Concerts',
    'Meet & Greets', 
    'Fan Parties',
    'Online Events',
    'Viewing Parties',
    'Charity Events'
  ];
  
  selectedCategory: string | null = 'All Events';

  constructor(
    private bottomSheetRef: MatBottomSheetRef<MobileFiltersSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: FilterSheetData
  ) {
    if (data?.categories) {
      this.categories = data.categories;
    }
    if (data?.selectedCategory) {
      this.selectedCategory = data.selectedCategory;
    }
  }

  applyFilter(category: string): void {
    this.selectedCategory = category;
  }

  applyFilters(): void {
    this.bottomSheetRef.dismiss(this.selectedCategory);
  }

  clearFilters(): void {
    this.selectedCategory = null;
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }
}