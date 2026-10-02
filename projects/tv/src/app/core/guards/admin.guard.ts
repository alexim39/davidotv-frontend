import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Restricts Davido Curated Feed / Call-Up admin actions.
 * Requires role === 'admin'.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);
  const snack = inject(MatSnackBar);

  if (auth.isAdmin()) return true;
  snack.open('Admin access required', 'Dismiss', { duration: 2500 });
  router.navigate(['/forbidden']);
  return false;
};
