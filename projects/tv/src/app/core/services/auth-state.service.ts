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

  /**
   * SEC-02: backend returns {success,user,token} on signin/signup/google-signin
   * (legacy returned message-only). Normalizer tolerates {user|data} + optional
   * token (cookie-only sessions have no token in body).
   */
  private normalizeSession(res: any): { user: AuthUser | null; token?: string } {
    const user = res?.user ?? res?.data ?? null;
    const token = res?.token ?? user?.token;
    return { user, token };
  }

  login(credentials: { email: string; password: string }) {
    this._loading.set(true);
    return this.api.post<any>('auth/signin', credentials, undefined, true).pipe(
      tap(res => {
        const { user, token } = this.normalizeSession(res);
        if (user) this.persist(user, token);
      }),
      catchError(err => { this._loading.set(false); throw err; }),
      tap(() => this._loading.set(false))
    );
  }

  loginWithGoogle(idToken: string) {
    this._loading.set(true);
    return this.api.post<any>('auth/google-signin', { idToken }, undefined, true).pipe(
      tap(res => {
        const { user, token } = this.normalizeSession(res);
        if (user) this.persist(user, token);
      }),
      tap(() => this._loading.set(false))
    );
  }

  signup(payload: { email: string; password: string; name: string; lastname: string; username: string }) {
    this._loading.set(true);
    return this.api.post<any>('auth/signup', payload, undefined, true).pipe(
      tap(res => {
        const { user, token } = this.normalizeSession(res);
        if (user) this.persist(user, token);
      }),
      tap(() => this._loading.set(false))
    );
  }

  /** SEC-02 identity check: new /api/identity/me, fallback legacy GET auth. */
  me() {
    return this.api.get<any>('api/identity/me').pipe(
      tap(res => {
        const user = res?.data ?? res?.user ?? null;
        if (user) this.persist(user, user.token ?? this._user()?.token);
      }),
      catchError(() =>
        this.api.get<any>('auth', undefined, undefined, true).pipe(
          tap(res => {
            const user = res?.user ?? res?.data ?? null;
            if (user) this.persist(user, user.token ?? this._user()?.token);
          })
        )
      )
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

  private persist(user: AuthUser, token?: string) {
    const withToken = token ? { ...user, token } : { ...user };
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
