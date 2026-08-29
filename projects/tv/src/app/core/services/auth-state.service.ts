import { Injectable, computed, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { tap, catchError, of } from 'rxjs';

export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  name: string;
  lastname: string;
  avatar?: string;
  role: 'user' | 'admin';
  token?: string;
}

/**
 * Zoneless auth state using Angular 20 signals.
 * All components MUST use computed signals + async pipe alternative (signal binding)
 * to avoid zone.js change detection churn on 60fps scroll.
 */
@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly api = inject(ApiService);

  private readonly _user = signal<AuthUser | null>(this.hydrate());
  private readonly _loading = signal(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly avatar = computed(() => this._user()?.avatar ?? 'img/avatar.png');

  login(credentials: { email: string; password: string }) {
    this._loading.set(true);
    return this.api.post<{ user: AuthUser; token: string }>('auth/signin', credentials, undefined, true).pipe(
      tap(res => this.persist(res.user, res.token)),
      catchError(err => { this._loading.set(false); throw err; }),
      tap(() => this._loading.set(false))
    );
  }

  loginWithGoogle(idToken: string) {
    this._loading.set(true);
    return this.api.post<{ user: AuthUser; token: string }>('auth/google-signin', { idToken }, undefined, true).pipe(
      tap(res => this.persist(res.user, res.token)),
      tap(() => this._loading.set(false))
    );
  }

  signup(payload: { email: string; password: string; name: string; lastname: string; username: string }) {
    this._loading.set(true);
    return this.api.post<{ user: AuthUser; token: string }>('auth/signup', payload, undefined, true).pipe(
      tap(res => this.persist(res.user, res.token)),
      tap(() => this._loading.set(false))
    );
  }

  logout() {
    return this.api.post('auth/signout', {}, undefined, true).pipe(
      tap(() => this.clear()),
      catchError(() => { this.clear(); return of(null); })
    );
  }

  hydrateUserFromStorage(): AuthUser | null {
    return this.hydrate();
  }

  private persist(user: AuthUser, token: string) {
    const withToken = { ...user, token };
    localStorage.setItem('davidotv_auth', JSON.stringify(withToken));
    this._user.set(withToken);
  }

  private hydrate(): AuthUser | null {
    try {
      const raw = localStorage.getItem('davidotv_auth');
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch { return null; }
  }

  private clear() {
    localStorage.removeItem('davidotv_auth');
    this._user.set(null);
  }
}
