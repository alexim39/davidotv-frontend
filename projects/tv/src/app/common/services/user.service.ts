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
  role?: string;
  profileImage?: string;
  createdAt?: Date;
  notification?: boolean;
  darkMode?: boolean;
  avater?: string;
  preferences: {
    autoplay: boolean;
    notification: boolean;
    playbackQuality: string;
    theme: string;
  }
  testimonial?: {
    message?: string;
  };
  dob?: Date;
  isActive?: boolean;
  personalInfo: {
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
    }
    email: string;
    phone: string;
    dob: Date;
    bio: string;
    jobTitle: string;
    educationBackground?: string;
  };
  professionalInfo: {
    skills: string[];
    experience: {
      company: string;
      startDate: Date;
      endDate: Date;
      description: string;
      current: boolean;
    };
    education: {
      institution: string;
      degree: string;
      fieldOfStudy: string;
      startDate: Date;
      endDate: Date;
      description: string;
    };
  };
  interests: {
    hobbies: string[];
    favoriteTopics: string[];
  };
 
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private apiService: ApiService) {}


  /**
   * Get user data from the backend API.
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