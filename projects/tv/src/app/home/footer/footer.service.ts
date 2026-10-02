import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// FE-01 final batch migrated: transport via core.
import { ApiService } from '../../core/services/api.service';

export interface SubscriptionInterface {
  email: string;
}


@Injectable()
export class FooterService {
 constructor(private apiService: ApiService) {}

  /**
   * Submits the user sub data to the backend API.
   * @param formObject The signin data to be submitted.
   * @returns An Observable that emits the API response or an error.
   */
  subscribe(formObject: SubscriptionInterface): Observable<any> {
    return this.apiService.post<SubscriptionInterface>(`email/subscribe`, formObject, undefined, true);
  }


}