import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface YoutubeVideo {
  _id?: string;
  youtubeVideoId: string;
  title: string;
  description: string;
  channel: string;
  channelId: string;
  publishedAt: Date;
  thumbnail: {
    default: string;
    medium?: string;
    high?: string;
    standard?: string;
    maxres?: string;
  };
  duration: string;
  views: number;
  likes: number;
  dislikes: number;
  commentCount: number;
  isOfficialContent: boolean;
  url: string;
  menuTypes: string[];
  
}

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  // Cache for better performance
  private trendingCache = new BehaviorSubject<YoutubeVideo[]>([]);
  private musicCache = new BehaviorSubject<YoutubeVideo[]>([]);
  private videosCache = new BehaviorSubject<YoutubeVideo[]>([]);

   constructor(private apiService: ApiService) {}

  /**
   * Get trending Davido-related videos
   * @param limit Number of videos to return
   * @param forceRefresh Bypass cache and force refresh
   */
getTrendingVideos(limit: number = 12, forceRefresh: boolean = false): Observable<YoutubeVideo[]> {
    if (!forceRefresh && this.trendingCache.value.length > 0) {
        return this.trendingCache.asObservable().pipe(
            map(videos => videos.slice(0, limit))
        );
    }

    const params = new HttpParams()
        .set('menuType', 'trending')
        .set('limit', limit.toString());

    return this.apiService.get<YoutubeVideo[]>(`youtube/videos`, params).pipe(
        tap(videos => {
            this.trendingCache.next(videos);
        }),
        catchError(this.handleError)
    );
}

  /**
   * Get official Davido music videos
   * @param limit Number of videos to return
   * @param forceRefresh Bypass cache and force refresh
   */
getMusicVideos(limit: number = 12, forceRefresh: boolean = false): Observable<YoutubeVideo[]> {
    if (!forceRefresh && this.musicCache.value.length > 0) {
        return this.musicCache.asObservable().pipe(
            map(videos => videos.slice(0, limit))
        );
    }

    const params = new HttpParams()
        .set('menuType', 'music')
        .set('isOfficialContent', 'true')
        .set('limit', limit.toString());

    return this.apiService.get<YoutubeVideo[]>(`youtube/videos`, params).pipe(
        tap(videos => {
            this.musicCache.next(videos);
        }),
        catchError(this.handleError)
    );
}

  /**
   * Get all Davido-related videos (excluding official music)
   * @param limit Number of videos to return
   * @param forceRefresh Bypass cache and force refresh
   */
  getAllVideos(limit: number = 12, forceRefresh: boolean = false): Observable<YoutubeVideo[]> {
    if (!forceRefresh && this.videosCache.value.length > 0) {
      return this.videosCache.asObservable().pipe(
        map(videos => videos.slice(0, limit))
      );
    }

    const params = new HttpParams()
      .set('menuType', 'videos')
      .set('limit', limit.toString())
      .set('sort', '-publishedAt');

    return this.apiService.get<YoutubeVideo[]>(`youtube/videos`, params ).pipe(
      tap(videos => {
        this.videosCache.next(videos);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Search for Davido-related videos
   * @param query Search query
   * @param limit Number of results to return
   */
  searchVideos(query: string, limit: number = 12): Observable<YoutubeVideo[]> {
    const params = new HttpParams()
      .set('search', query)
      .set('limit', limit.toString());

    return this.apiService.get<YoutubeVideo[]>(`youtube/videos/search`, params ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get video by ID
   * @param videoId YouTube video ID
   */
  getVideoById(videoId: string): Observable<YoutubeVideo> {
    return this.apiService.get<YoutubeVideo>(`youtube/videos/${videoId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Format duration from ISO 8601 to human readable format
   * @param duration ISO 8601 duration string
   */
  formatDuration(duration: string): string {
    if (!duration) return '0:00';
    
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!matches) return '0:00';
    
    const hours = matches[1] ? parseInt(matches[1]) : 0;
    const minutes = matches[2] ? parseInt(matches[2]) : 0;
    const seconds = matches[3] ? parseInt(matches[3]) : 0;
    
    let timeStr = '';
    if (hours > 0) {
      timeStr += hours + ':';
      timeStr += minutes.toString().padStart(2, '0') + ':';
    } else {
      timeStr += minutes + ':';
    }
    timeStr += seconds.toString().padStart(2, '0');
    
    return timeStr;
  }

  /**
   * Format view count to human readable format
   * @param count Number of views
   */
  formatViewCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  /**
   * Format published date to relative time
   * @param date Published date
   */
  formatPublishedDate(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }
    
    return 'Just now';
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}