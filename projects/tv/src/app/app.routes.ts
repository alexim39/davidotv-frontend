import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadChildren: () => import('./home/home.route').then(r => r.HomeRoutes) },
    { path: 'store', loadChildren: () => import('./store/store.route').then(r => r.StoreRoutes) },
    { path: 'legal', loadChildren: () => import('./legal/legal-routes').then(r => r.legalRoutes) },
    


];
