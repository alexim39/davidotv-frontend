import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';

/**
 * Attaches JWT + withCredentials for cookie auth.
 * Skips external YouTube thumbnail requests.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStateService);
  const user = auth.user();
  const token = user?.token;

  // Don't attach to image CDN or absolute external URLs not matching api
  const isExternal = /^https?:\/\//.test(req.url) && !req.url.includes('/api') && !req.url.includes('localhost') && !req.url.includes('davidotv');

  if (token && !isExternal && !req.headers.has('Authorization')) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    return next(cloned);
  }
  // Always ensure withCredentials for same-origin auth
  if (!isExternal && !req.headers.has('Authorization')) {
    return next(req.clone({ withCredentials: true }));
  }
  return next(req);
};
