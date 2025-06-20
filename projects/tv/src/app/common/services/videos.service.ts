import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class VideoService {
  constructor(private apiService: ApiService) {}



  saveVideoToLibrary(userId: string, videoData: any) {
    const formData = {userId, videoData}
    return this.apiService.post<any>(`user/library/save`, formData, undefined, true);
  }

  getSavedVideos(userId: string): Observable<any> {
    return this.apiService.get<any>(`user/library/${userId}`, undefined, undefined, true);
  }

  removeVideoFromLibrary(userId: string, youtubeVideoId: string): Observable<any> {
    return this.apiService.delete<any>(`user/library/remove/${userId}/${youtubeVideoId}`, undefined, undefined, true);
  }












  

  getWatchHistory(): Observable<any> {
    return this.apiService.get<any>(``, undefined, undefined, true);
  }

  clearHistory(): Observable<any> {
    return this.apiService.get<any>(``, undefined, undefined, true);
  }

 

  removeFromHistory(videoId: string): Observable<any> {
    return this.apiService.get<any>(``, undefined, undefined, true);
  }

  
   updateWatchHistory(userId: string, videoData: any) {
    const formData = {userId, videoData}
    return this.apiService.post<any>(`user/library/save`, formData, undefined, true);
  }


}