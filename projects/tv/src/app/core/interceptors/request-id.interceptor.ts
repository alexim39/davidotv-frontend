import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * OBS-01: correlation IDs.
 * Attaches `x-request-id` (crypto.randomUUID, per request) so BE logs and
 * error bodies echo the same id. On failure the id is surfaced on the
 * normalized error for support reports. Skips external CDN/thumbnail hosts.
 */
export const requestIdInterceptor: HttpInterceptorFn = (req, next) => {
  const isExternal =
    /^https?:\/\//.test(req.url) &&
    !req.url.includes('/api') &&
    !req.url.includes('localhost') &&
    !req.url.includes('davidotv');

  const outgoing = isExternal || req.headers.has('x-request-id')
    ? req
    : req.clone({ setHeaders: { 'x-request-id': crypto.randomUUID() } });

  return next(outgoing).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const requestId =
          (err.error as { requestId?: string } | null)?.requestId ??
          err.headers.get('x-request-id');
        return throwError(() => ({ ...err, requestId }));
      }
      return throwError(() => err);
    })
  );
};
