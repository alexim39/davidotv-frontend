import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Global error normalisation: 401 -> redirect, 429 -> toast, 5xx -> toast.
 * Keeps feature services lean.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snack = inject(MatSnackBar);

  return next(req).pipe(
    catchError(err => {
      const status = err?.status ?? err?.raw?.status;
      const message = err?.message ?? err?.error?.message ?? 'Unexpected error';

      if (status === 401) {
        // Let auth guard handle, but give feedback
        snack.open('Session expired. Please sign in.', 'Dismiss', { duration: 3000 });
        router.navigate(['/auth']);
      } else if (status === 429) {
        snack.open('Too many requests. Slow down.', 'Dismiss', { duration: 3000 });
      } else if (status >= 500) {
        snack.open('Server error. Please try again.', 'Retry', { duration: 4000 });
        console.error('[API 5xx]', req.url, message);
      }
      return throwError(() => err);
    })
  );
};
