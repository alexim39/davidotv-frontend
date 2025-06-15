import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../common/services/api.service';


@Injectable()
export class VideoService {
 constructor(private apiService: ApiService) {}

  /**
   * Get video data from the backend API.
   * @returns An Observable that emits the API response or an error.
   */
 /*  getDavidoVideos(): Observable<any> {
    return this.apiService.get<any>(`youtube/videos`, undefined, undefined, true);
  } */


}


export interface VideoItem {
  /* id: {
    kind: 'youtube#video' | 'youtube#channel' | 'youtube#playlist';
    videoId?: string;
    channelId?: string;
    playlistId?: string;
  };

  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
        width: number;
        height: number;
      };
      medium: {
        url: string;
        width: number;
        height: number;
      };
      high: {
        url: string;
        width: number;
        height: number;
      };
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  }; */

  // Custom properties for your app – optional
  youtubeVideoId: string;
  channelTitle?: string;
  channelId?: string;
  title?: string;
  thumbnail?: string;
  channel?: string;
  channelIcon?: string;
  views?: string;
  likes?: number;
  dislikes?: number;
  duration?: number;
  publishedAt: string;
  comment?: any;
}
