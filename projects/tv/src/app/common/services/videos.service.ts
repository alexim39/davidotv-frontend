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

  updateWatchHistory(videoData: any) {
    return this.apiService.post<any>(`user/history/save`, videoData, undefined, true);
  }

  getWatchHistory(userId: string): Observable<any> {
    return this.apiService.get<any>(`user/history/video/${userId}`, undefined, undefined, true);
  }

  removeFromHistory(watchedVideoId: string, userId: string): Observable<any> {
    return this.apiService.delete<any>(`user/history/remove/${watchedVideoId}/${userId}`, undefined, undefined, true);
  }

  clearHistory(userId: string): Observable<any> {
    return this.apiService.delete<any>(`user/history/clear/${userId}`, undefined, undefined, true);
  }

   // Like a video
  likeVideo(videoId: string, userId: string) {
    return this.apiService.post<any>(`youtube/videos/like`, { userId, videoId });
  }

  // Dislike a video
  dislikeVideo(videoId: string, userId: string) {
    return this.apiService.post<any>(`youtube/videos/dislike`, { userId, videoId });
  }

}