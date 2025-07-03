import { Injectable } from '@angular/core';
import { Event } from './event.model'
import { ApiService } from '../common/services/api.service';
import { Observable } from 'rxjs';
@Injectable()
export class EventService {
  constructor(private apiService: ApiService) {}
  
  getEventsByCategory(category: string){
    // In a real app, this would be an HTTP request
     return this.apiService.get<any>(`event/${category}`, undefined, undefined, true);
  }
  
  getFeaturedEvents(): Observable<any>{
    return this.apiService.get<any>(`event/active`, undefined, undefined, true);
  }

  getAllEvents(): Observable<any>{
    return this.apiService.get<any>('event', undefined, undefined, true);
  }

  getTrendingEvents(): Observable<any>{
    return this.apiService.get<any>('event/trending', undefined, undefined, true);
  }

  getInterestedEvents(userId: string): Observable<any>{
    return this.apiService.get<any>(`event/interested/${userId}`, undefined, undefined, true);
  }
  
  markInterest(formObject: {eventId: string, userId: string}): Observable<any> {
    //console.log('Marking interest for event:', formObject);
    return this.apiService.post<any>(`event/interested`, formObject, undefined, true);
  }
}