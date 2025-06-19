import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Event } from './event.model'
@Injectable({
  providedIn: 'root'
})
export class EventService {
  getEventsByCategory(category: string){
    // In a real app, this would be an HTTP request
    //return of(this.generateMockEvents().filter(e => e.category === category));
  }
  
  getFeaturedEvents(){
    //return of(this.generateMockEvents().slice(0, 5));
  }
  
 getEvents() {}
}