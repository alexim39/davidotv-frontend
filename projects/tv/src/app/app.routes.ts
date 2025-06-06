import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadChildren: () => import('./home/home.route').then(r => r.HomeRoutes) },

];
