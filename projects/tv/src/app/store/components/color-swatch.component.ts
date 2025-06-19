import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductColor } from '../models/product.model';

@Component({
selector: 'app-color-swatch',
standalone: true,
imports: [CommonModule],
template: `
<div class="color-swatches">
  <button *ngFor="let color of colors" 
          class="swatch" 
          [style.background]="color.code"
          [class.selected]="selectedColor === color.name"
          [title]="color.name"
          (click)="selectColor(color.name)">
    <span class="check" *ngIf="selectedColor === color.name">✓</span>
  </button>
</div>
`,
styles: [`
.color-swatches {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  
  .swatch {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid #eee;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    padding: 0;
    
    &:hover {
      transform: scale(1.1);
    }
    
    &.selected {
      border-color: #333;
      
      .check {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-weight: bold;
        text-shadow: 0 0 2px rgba(0,0,0,0.5);
      }
    }
  }
}
    `]
})
export class ColorSwatchComponent {
  @Input() colors: ProductColor[] = [];
  @Output() colorSelected = new EventEmitter<string>();
  
  selectedColor = '';
  
  selectColor(color: string) {
    this.selectedColor = color;
    this.colorSelected.emit(color);
  }
}