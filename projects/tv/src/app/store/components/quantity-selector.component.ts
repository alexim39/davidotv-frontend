import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
selector: 'app-quantity-selector',
standalone: true,
imports: [CommonModule],
template: `
<div class="quantity-selector">
  <button class="decrement" (click)="decrement()" [disabled]="value <= min">-</button>
  <!-- <input type="number" 
         [value]="value" 
         [min]="min" 
         [max]="max"
         (change)="setValue($event.target.valueAsNumber)"> -->
  <input type="number" 
         [value]="value" 
         [min]="min" 
         [max]="max"
         >
  <button class="increment" (click)="increment()" [disabled]="value >= max">+</button>
</div>
`,
styles: [`
    .quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  width: fit-content;
  
  button {
    width: 32px;
    height: 32px;
    background: #f5f5f5;
    border: none;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s ease;
    
    &:hover:not(:disabled) {
      background: #eee;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  input {
    width: 40px;
    height: 32px;
    text-align: center;
    border: none;
    border-left: 1px solid #ddd;
    border-right: 1px solid #ddd;
    font-size: 14px;
    -moz-appearance: textfield;
    
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
}
`]
})
export class QuantitySelectorComponent {
  @Input() value = 1;
  @Input() min = 1;
  @Input() max = 10;
  @Output() quantityChange = new EventEmitter<number>();
  
  increment() {
    if (this.value < this.max) {
      this.value++;
      this.quantityChange.emit(this.value);
    }
  }
  
  decrement() {
    if (this.value > this.min) {
      this.value--;
      this.quantityChange.emit(this.value);
    }
  }
  
  setValue(newValue: number) {
    if (newValue >= this.min && newValue <= this.max) {
      this.value = newValue;
      this.quantityChange.emit(this.value);
    }
  }
}