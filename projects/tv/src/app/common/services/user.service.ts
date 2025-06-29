import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, } from 'rxjs';
import { ApiService } from './api.service';

export interface UserInterface {
  _id: string;
  status: boolean;
  name: string;
  lastname: string;
  email: string;
  username: string;
  bio?: string;
  address?: string;
  role?: string;
  profileImage?: string;
  createdAt?: Date;
  notification?: boolean;
  darkMode?: boolean;
 
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private apiService: ApiService) {}


  /**
   * Get user data to the backend API.
   * @returns An Observable that emits the API response or an error.
   */
  getUser(): Observable<any> {
    return this.apiService.get<UserInterface>(`auth`, undefined, undefined, true);
  }

  private userSubject = new BehaviorSubject<UserInterface | null>(null);
  getCurrentUser$ = this.userSubject.asObservable();
  setCurrentUser(user: UserInterface) {
    this.userSubject.next(user);
  }
}