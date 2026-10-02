import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// FE-01 final batch migrated: transport via core.
import { ApiService } from '../core/services/api.service';

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

  getTestimonials(): Observable<any> {
    return this.apiService.get<TestimonialInterface[]>(`user/testimonial`, undefined, undefined, true);
  }

  addReaction(userId: string, testimonialId: string, reaction: 'like' | 'dislike' | null): Observable<any> {
    return this.apiService.post(`user/testimonial/reaction`, { userId, testimonialId, reaction });
  }
}