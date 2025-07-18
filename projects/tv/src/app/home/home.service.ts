import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../common/services/api.service';

export interface TestimonialInterface {
  userId: string;
  name: string;
  avatar?: string;
  jobTitle?: string;
  message: string;
  country?: string;
  state?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class HomeService {
 constructor(private apiService: ApiService) {}

  /**
   * Get video data from the backend API.
   * @returns An Observable that emits the API response or an error.
   */
 getTestimonials(): Observable<any> {
    return this.apiService.get<any>(`user/testimonials`, undefined, undefined, true);
  }


}

