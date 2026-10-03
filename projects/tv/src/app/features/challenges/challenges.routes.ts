import { Routes } from '@angular/router';

export const ChallengeRoutes: Routes = [
  { path: '', loadComponent: () => import('./board.component').then(m => m.ChallengeBoardComponent), title: 'Challenges — DavidO TV' },
];
