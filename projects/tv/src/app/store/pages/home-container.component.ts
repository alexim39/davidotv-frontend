import { Component} from '@angular/core';
import { ShopHomeComponent } from './home.component';


@Component({
selector: 'async-home-container',
template: `
  <app-shop-home/>`,
imports: [ShopHomeComponent],
})
export class ShopHomeContainerComponent {}
