import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
selector: 'async-merch-card',
imports: [MatCardModule, CommonModule],
template: `
   
   


`,
styles: [`

`]
})
export class MerchCardComponent {
    @Input() merch!: any;
}