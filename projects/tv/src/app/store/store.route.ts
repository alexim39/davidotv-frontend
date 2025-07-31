import { Routes } from "@angular/router";
import { ShopIndexComponent } from "./pages/index.component";
import { ShopCategoryComponent } from "./pages/category/category.component";
import { ProductDetailComponent } from "./pages/product/product-detail";
import { CartPageComponent } from "./pages/cart/cart.component";
import { CheckoutPageComponent } from "./pages/cart/checkout.component";
import { ShopHomeComponent } from "./pages/home.component";
import { WishlistComponent } from "./pages/wishlist/wishlist.component";

export const StoreRoutes: Routes = [
  { 
    path: '', 
    component: ShopIndexComponent, 
    children: [
      {
        path: '', 
        component: ShopHomeComponent, 
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
      },
      {
        path: 'wishlist',
        component: WishlistComponent
      }
    ]
  },
];