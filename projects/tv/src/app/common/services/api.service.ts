import { Injectable, inject } from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService as CoreApiService } from '../../core/services/api.service';

/**
 * @deprecated FE-01 — legacy adapter, do not inject in new code.
 * Delegates transport to `core/services/api.service` (single baseUrl, timeout,
 * retry, request-id) but rethrows the RAW HttpErrorResponse so the 60+ legacy
 * call sites reading `error.error.message` keep working unchanged.
 * Migration: inject the core ApiService and read the normalized
 * `{ status, message, requestId }` shape instead. Removal only after every
 * consumer is migrated (tracked in docs/modernization).
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly core = inject(CoreApiService);

  getBaseUrl(): string {
    return this.core.getBaseUrl();
  }

  /** Unwrap core's normalized error back to the raw HttpErrorResponse. */
  private legacyError<T>(source: Observable<T>): Observable<T> {
    return source.pipe(
      catchError((norm: { raw?: unknown }) => throwError(() => norm?.raw ?? norm))
    );
  }

  get<T>(endpoint: string, params?: HttpParams, headers?: HttpHeaders, withCredentials: boolean = false): Observable<T> {
    return this.legacyError(this.core.get<T>(endpoint, params, headers, withCredentials));
  }

  post<T>(endpoint: string, data: any, headers?: HttpHeaders, withCredentials: boolean = false): Observable<T> {
    return this.legacyError(this.core.post<T>(endpoint, data, headers, withCredentials));
  }

  put<T>(endpoint: string, data: any, headers?: HttpHeaders, withCredentials: boolean = false): Observable<T> {
    return this.legacyError(this.core.put<T>(endpoint, data, headers, withCredentials));
  }

  delete<T>(endpoint: string, params?: HttpParams, headers?: HttpHeaders, withCredentials: boolean = false): Observable<T> {
    return this.legacyError(this.core.delete<T>(endpoint, params, headers, withCredentials));
  }

  patch<T>(endpoint: string, data: any, headers?: HttpHeaders, withCredentials: boolean = false): Observable<T> {
    return this.legacyError(this.core.patch<T>(endpoint, data, headers, withCredentials));
  }

  head<T>(endpoint: string, params?: HttpParams, headers?: HttpHeaders, withCredentials: boolean = false): Observable<T> {
    return this.legacyError(this.core.head<T>(endpoint, params, headers, withCredentials));
  }
}
