import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
selector: 'app-size-selector',
standalone: true,
imports: [CommonModule],
template: `
<div class="size-selector">
  <button *ngFor="let size of sizes" 
          class="size-button" 
          [class.selected]="selectedSize === size"
          [class.unavailable]="!isSizeAvailable(size)"
          (click)="selectSize(size)">
    {{ size }}
  </button>
</div>
`,
styles: [`
    .size-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .size-button {
    min-width: 40px;
    height: 40px;
    padding: 0 10px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover:not(.selected):not(.unavailable) {
      border-color: #999;
    }
    
    &.selected {
      background: #333;
      color: white;
      border-color: #333;
    }
    
    &.unavailable {
      color: #ccc;
      text-decoration: line-through;
      cursor: not-allowed;
    }
  }
}
`]
})
export class SizeSelectorComponent {
  @Input() sizes: string[] = [];
  @Output() sizeSelected = new EventEmitter<string>();
  
  selectedSize = '';
  isSizeAvailable: any;
  
  selectSize(size: string) {
    this.selectedSize = size;
    this.sizeSelected.emit(size);
  }
}