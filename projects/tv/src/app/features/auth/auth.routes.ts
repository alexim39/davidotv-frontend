import { Routes } from '@angular/router';

export const AuthRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./signin/signin.component').then(m => m.SigninComponent),
    title: 'Sign in — DavidoTV'
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup.component').then(m => m.SignupComponent),
    title: 'Create account — DavidoTV'
  }
];
