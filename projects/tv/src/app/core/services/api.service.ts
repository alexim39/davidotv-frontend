import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError, retry, catchError, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Centralized HTTP wrapper for DavidO TV.
 *
 * Architecture choice: singleton in `core` so interceptors/guards can depend on it
 * without circular imports. All feature services MUST inject this instead of HttpClient
 * directly to guarantee consistent baseUrl, timeout, retry and error normalisation.
 *
 * Zoneless-ready: pure observable pipeline, no Zone reliance.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = (environment?.apiUrl ?? 'http://localhost:3000').replace(/\/$/, '');

  getBaseUrl(): string {
    return this.baseUrl;
  }

  get<T>(endpoint: string, params?: HttpParams, headers?: HttpHeaders, withCredentials = true): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint.replace(/^\//, '')}`, { params, headers, withCredentials })
      .pipe(timeout(15000), retry({ count: 1, delay: 300 }), catchError(this.handleError));
  }

  post<T>(endpoint: string, body: unknown, headers?: HttpHeaders, withCredentials = true): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint.replace(/^\//, '')}`, body, { headers, withCredentials })
      .pipe(timeout(15000), retry({ count: 1, delay: 300 }), catchError(this.handleError));
  }

  put<T>(endpoint: string, body: unknown, headers?: HttpHeaders, withCredentials = true): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}/${endpoint.replace(/^\//, '')}`, body, { headers, withCredentials })
      .pipe(catchError(this.handleError));
  }

  patch<T>(endpoint: string, body: unknown, headers?: HttpHeaders, withCredentials = true): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}/${endpoint.replace(/^\//, '')}`, body, { headers, withCredentials })
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, params?: HttpParams, headers?: HttpHeaders, withCredentials = true): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}/${endpoint.replace(/^\//, '')}`, { params, headers, withCredentials })
      .pipe(catchError(this.handleError));
  }

  /** Upload multipart (talent hub) */
  upload<T>(endpoint: string, formData: FormData, withCredentials = true): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint.replace(/^\//, '')}`, formData, { withCredentials })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.error?.message ?? error.message ?? 'Unknown server error';
    // Let Winston on BE handle persistence; FE just normalises
    return throwError(() => ({ status: error.status, message, raw: error }));
  }
}
