import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';

/**
 * Protects private routes (library, upload, settings).
 * Zoneless-compatible: pure function, no subscriptions.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigate(['/auth'], { queryParams: { redirect: router.url } });
  return false;
};
