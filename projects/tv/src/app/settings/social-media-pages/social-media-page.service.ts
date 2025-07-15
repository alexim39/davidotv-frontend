import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { ApiService } from '../../common/services/api.service';


@Injectable()
export class SocialPageService {
  constructor(private apiService: ApiService) {}


   /**
   * Submits the form data to the backend.
   * @param formObject The form data.
   * @returns An observable of the submitted form data.
   */
  updateTestimonial(formObject: {message: string; partnerId: string}): Observable<any> {
    //console.log('form record', formObject);
    return this.apiService.post<any>(`partners/testimonial`, formObject);
  }



   
}