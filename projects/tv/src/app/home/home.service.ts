import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../common/services/api.service';


@Injectable()
export class HomeService {
 constructor(private apiService: ApiService) {}

  /**
   * Get video data from the backend API.
   * @returns An Observable that emits the API response or an error.
   */
 /*  getDavidoVideos(): Observable<any> {
    return this.apiService.get<any>(`youtube/videos`, undefined, undefined, true);
  } */


}

