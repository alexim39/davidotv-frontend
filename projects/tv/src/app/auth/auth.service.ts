import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../common/services/api.service';

export interface SignInInterface {
  email: string;
  password: string;
}
export interface SignUpInterface {
  email: string;
  password: string;
  name: string;
  lastname: string;
}

@Injectable()
export class AuthService {
 constructor(private apiService: ApiService) {}

  /**
   * Submits the user signin data to the backend API.
   * @param formObject The signin data to be submitted.
   * @returns An Observable that emits the API response or an error.
   */
  signIn(formObject: SignInInterface): Observable<any> {
    return this.apiService.post<SignInInterface>(`auth/signin`, formObject, undefined, true);
  }

   /**
   * Submits the user signInWithGoogle data to the backend API.
   * @param formObject The signin data to be submitted.
   * @returns An Observable that emits the API response or an error.
   */
  signInWithGoogle(googleUser: any): Observable<any> {
    return this.apiService.post<SignInInterface>(`auth/google-signin`, googleUser, undefined, true);
  }

  /**
   * Submits the user sing up data to the backend API.
   * @param formObject The sing up data to be submitted.
   * @returns An Observable that emits the API response or an error.
   */
  signUp(formObject: SignUpInterface): Observable<any> {
    return this.apiService.post<SignUpInterface>(`auth/signup`, formObject, undefined, true);
  }

  /**
   * Submits the user sign out data to the backend API.
   * @param formObject The sign out data to be submitted.
   * @returns An Observable that emits the API response or an error.
   */
  signOut(formObject: {}): Observable<any> {
    return this.apiService.post<any>('auth/signout', formObject, undefined, true);
  }

  /**
   * Submits the user change password data to the backend API.
   * @param formObject The change password data to be submitted.
   * @returns An Observable that emits the API response or an error.
   */
  requestPasswordChange(formObject: any): Observable<any> {
    return this.apiService.post<any>('auth/forgot-password', formObject, undefined, true);
  }

  /**
   * Submits the user reset password data to the backend API.
   * @param formObject The reset password data to be submitted.
   * @returns An Observable that emits the API response or an error.
   */
  resetPassword(formObject: any): Observable<any> {
    return this.apiService.post<any>('auth/reset-password', formObject, undefined, true);
  }
}