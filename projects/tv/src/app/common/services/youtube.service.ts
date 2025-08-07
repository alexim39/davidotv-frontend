import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface YoutubeVideoInterface {
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
  comments?: any;
  appViews: number;
  likedBy?: string;
  dislikedBy?: string;
  appLikes?: number;
  appDislikes?: number;
  isShort?: boolean;
  durationSeconds?: number; // Duration in seconds
  
}

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  // Cache for better performance
  private trendingCache = new BehaviorSubject<YoutubeVideoInterface[]>([]);
  private musicCache = new BehaviorSubject<YoutubeVideoInterface[]>([]);
  private videosCache = new BehaviorSubject<YoutubeVideoInterface[]>([]);

   constructor(private apiService: ApiService) {}

  /**
 * Get trending Davido-related videos with infinite scroll support
 * @param limit Number of videos to return
 * @param page Page number for pagination
 * @param forceRefresh Bypass cache and force refresh
 */
getTrendingVideos(limit: number = 12, page: number = 0, forceRefresh: boolean = false): Observable<YoutubeVideoInterface[]> {
  // Always get current cache value safely
  const currentCache = this.trendingCache.value || [];

  if (!forceRefresh && page === 0 && currentCache.length > 0) {
    return this.trendingCache.asObservable().pipe(
      map(videos => videos.slice(0, limit))
    );
  }

  const params = new HttpParams()
    .set('menuType', 'trending')
    .set('limit', limit.toString())
    .set('page', page.toString())
    .set('sort', '-engagementScore,-publishedAt');

  return this.apiService.get<YoutubeVideoInterface[]>(`youtube/videos`, params).pipe(
    tap(videos => {
      // Ensure videos is an array
      const newVideos = Array.isArray(videos) ? videos : [];
      
      if (page === 0) {
        // First page - replace cache
        this.trendingCache.next(newVideos);
      } else {
        // Subsequent pages - append to cache
        this.trendingCache.next([...currentCache, ...newVideos]);
      }
    }),
    catchError(this.handleError)
  );
}


  /**
 * Get official Davido music videos with infinite scroll support
 * @param limit Number of videos to return
 * @param page Page number for pagination
 * @param forceRefresh Bypass cache and force refresh
 */
getOfficialVideos(limit: number = 12, page: number = 0, forceRefresh: boolean = false): Observable<YoutubeVideoInterface[]> {
  // Always get current cache value safely
  const currentCache = this.musicCache.value || [];

  if (!forceRefresh && page === 0 && currentCache.length > 0) {
    return this.musicCache.asObservable().pipe(
      map(videos => videos.slice(0, limit))
    );
  }

  const params = new HttpParams()
    .set('isOfficialContent', 'true')
    .set('menuType', 'music')
    .set('limit', limit.toString())
    .set('page', page.toString())
    .set('sort', '-publishedAt');

  return this.apiService.get<YoutubeVideoInterface[]>(`youtube/videos`, params).pipe(
    tap(videos => {
      // Ensure videos is an array
      const newVideos = Array.isArray(videos) ? videos : [];
      
      if (page === 0) {
        // First page - replace cache
        this.musicCache.next(newVideos);
      } else {
        // Subsequent pages - append to cache
        this.musicCache.next([...currentCache, ...newVideos]);
      }
    }),
    catchError(this.handleError)
  );
}

/**
 * Get all Davido-related videos (excluding official music)
 * @param limit Number of videos to return
 * @param forceRefresh Bypass cache and force refresh
 */
getAllFullVideos(limit: number = 12, page: number = 0, forceRefresh: boolean = false): Observable<any> {
  // Always get current cache value safely
  const currentCache = this.videosCache.value || [];

  if (!forceRefresh && page === 0 && currentCache.length > 0) {
    return this.videosCache.asObservable().pipe(
      map(videos => videos.slice(0, limit))
    );
  }

  const params = new HttpParams()
    .set('isShort', 'false') 
    .set('menuType', 'videos')
    .set('limit', limit.toString())
    .set('page', page.toString())
    .set('sort', '-publishedAt');

  return this.apiService.get<YoutubeVideoInterface[]>(`youtube/videos`, params).pipe(
    tap(videos => {
      // Ensure videos is an array
      const newVideos = Array.isArray(videos) ? videos : [];
      
      if (page === 0) {
        // First page - replace cache
        this.videosCache.next(newVideos);
      } else {
        // Subsequent pages - append to cache
        this.videosCache.next([...currentCache, ...newVideos]);
      }
    }),
    catchError(this.handleError)
  );
}


/**
 * Get all Davido-related videos (excluding official music)
 * @param limit Number of videos to return
 * @param forceRefresh Bypass cache and force refresh
 */
getAllShortVideos(limit: number = 12, page: number = 0, forceRefresh: boolean = false): Observable<any> {
  // Always get current cache value safely
  const currentCache = this.videosCache.value || [];

  if (!forceRefresh && page === 0 && currentCache.length > 0) {
    return this.videosCache.asObservable().pipe(
      map(videos => videos.slice(0, limit))
    );
  }

  const params = new HttpParams()
    .set('isShort', 'true')
    .set('menuType', 'videos')
    .set('limit', limit.toString())
    .set('page', page.toString())
    .set('sort', '-publishedAt');

  return this.apiService.get<YoutubeVideoInterface[]>(`youtube/videos`, params).pipe(
    tap(videos => {
      // Ensure videos is an array
      const newVideos = Array.isArray(videos) ? videos : [];
      
      if (page === 0) {
        // First page - replace cache
        this.videosCache.next(newVideos);
      } else {
        // Subsequent pages - append to cache
        this.videosCache.next([...currentCache, ...newVideos]);
      }
    }),
    catchError(this.handleError)
  );
}

  /**
   * Search for Davido-related videos
   * @param query Search query
   * @param page Page number (1-based)
   * @param limit Number of results to return
   */
  searchVideos(query: string, page: number = 1, limit: number = 12): Observable<{ data: YoutubeVideoInterface[], meta: { total: number } }> {
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.apiService.get<{ data: YoutubeVideoInterface[], meta: { total: number } }>(`youtube/videos/search`, params).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get video by ID
   * @param videoId YouTube video ID
   */
  getVideoById(videoId: string): Observable<YoutubeVideoInterface> {
    return this.apiService.get<YoutubeVideoInterface>(`youtube/videos/${videoId}`).pipe(
      catchError(this.handleError)
    );
  }


  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}