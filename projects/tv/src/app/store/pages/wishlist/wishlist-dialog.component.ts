import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wishlist-move-to-cart-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Move to Cart</h2>
    <mat-dialog-content>
      <p>Move {{ data.count }} {{ data.count === 1 ? 'item' : 'items' }} from your wishlist to cart?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="'move'">Move to Cart</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 16px 24px;
    }
    
    mat-dialog-actions {
      padding: 16px 24px;
      gap: 8px;
    }
  `]
})
export class WishlistMoveToCartDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<WishlistMoveToCartDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { count: number }
  ) {}
}