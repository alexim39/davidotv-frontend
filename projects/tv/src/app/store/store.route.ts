import { Routes } from "@angular/router";
import { ShopIndexComponent } from "./pages/index.component";
import { ShopCategoryComponent } from "./pages/category/category.component";
import { ProductDetailComponent } from "./pages/product/product-detail";
import { CartPageComponent } from "./pages/cart/cart.component";
import { CheckoutPageComponent } from "./pages/cart/checkout.component";
import { ShopHomeContainerComponent } from "./pages/home-container.component";

export const StoreRoutes: Routes = [
  { 
    path: '', 
    component: ShopIndexComponent, 
    children: [
      {
        path: '', 
        component: ShopHomeContainerComponent, 
      },
      {
        path: 'category/:id',
        component: ShopCategoryComponent
      },
      {
        path: 'product/:id',
        component: ProductDetailComponent
      },
      {
        path: 'cart',
        component: CartPageComponent
      },
      {
        path: 'checkout',
        component: CheckoutPageComponent
      }
    ]
  },
];