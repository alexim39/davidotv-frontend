import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../common/services/api.service';

export interface TestimonialInterface {
  _id: string; // Added ID field
  userId: string;
  name: string;
  avatar?: string;
  jobTitle?: string;
  message: string;
  country?: string;
  state?: string;
  status: string;
  likes: number; // Added likes count
  userReaction?: 'like' | 'dislike'; // Added reaction tracking
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class HomeService {
  constructor(private apiService: ApiService) {}

  getTestimonials(userId: string | undefined): Observable<any> {
    return this.apiService.get<TestimonialInterface[]>(`user/testimonial/${userId}`, undefined, undefined, true);
  }

  addReaction(userId: string, testimonialId: string, reaction: 'like' | 'dislike' | null): Observable<any> {
    return this.apiService.post(`user/testimonial/reaction`, { userId, testimonialId, reaction });
  }
}