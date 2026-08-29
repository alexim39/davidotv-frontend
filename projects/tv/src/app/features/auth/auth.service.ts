import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';

export interface SignInPayload { email: string; password: string; }
export interface SignUpPayload { email: string; password: string; name: string; lastname: string; username: string; }

/**
 * Feature-scoped auth facade delegating to core AuthState.
 * Keeps HTTP contracts isolated per feature.
 */
@Injectable({ providedIn: 'root' })
export class AuthFeatureService {
  private readonly api = inject(ApiService);

  signIn(payload: SignInPayload): Observable<any> {
    return this.api.post('auth/signin', payload, undefined, true);
  }
  signUp(payload: SignUpPayload): Observable<any> {
    return this.api.post('auth/signup', payload, undefined, true);
  }
  googleSignIn(idToken: string): Observable<any> {
    return this.api.post('auth/google-signin', { idToken }, undefined, true);
  }
  requestPasswordReset(email: string): Observable<any> {
    return this.api.post('auth/forgot-password', { email }, undefined, true);
  }
  resetPassword(token: string, password: string): Observable<any> {
    return this.api.post('auth/reset-password', { token, password }, undefined, true);
  }
}
