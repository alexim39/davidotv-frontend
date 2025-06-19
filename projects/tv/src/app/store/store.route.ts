import { Routes } from "@angular/router";
import { ShopHomeComponent } from "./pages/shop-home.component";
import { ProductListComponent } from "./pages/product-list.component";
import { ProductDetailComponent } from "./pages/product-detail.component";
import { CheckoutComponent } from "./pages/checkout.component";
import { CartComponent } from "./pages/cart.component";


export const StoreRoutes: Routes = [
  { path: '', component: ShopHomeComponent },
  { path: 'category/:categoryId', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { 
    path: 'checkout',
    component: CheckoutComponent,
    /* children: [
      { path: 'shipping', component: ShippingStepComponent },
      { path: 'payment', component: PaymentStepComponent },
      { path: 'review', component: ReviewStepComponent },
      { path: '', redirectTo: 'shipping', pathMatch: 'full' }
    ] */
  }
];