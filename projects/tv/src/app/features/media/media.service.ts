import { Injectable, inject, signal } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, tap, shareReplay, BehaviorSubject } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

/**
 * Domain service for media (YouTube cached).
 * Structured caching mirrors BE node-cron pipeline to avoid quota thrash.
 * Signals for zoneless UI (async pipe alternative via signal).
 */
export interface YoutubeVideo {
  _id?: string;
  youtubeVideoId: string;
  title: string;
  description: string;
  channel: string;
  channelId: string;
  publishedAt: string | Date;
  thumbnail: { default: string; medium?: string; high?: string; maxres?: string };
  duration: string;
  durationSeconds?: number;
  isShort?: boolean;
  views?: number;
  likes: number;
  appViews?: number;
  isOfficialContent: boolean;
  url?: string;
  menuTypes: string[];
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly api = inject(ApiService);

  // In-memory cache with TTL (mirrors BE cron daily sync)
  private cache = new Map<string, { data: YoutubeVideo[]; ts: number }>();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 min FE cache (BE is 6h)

  // Loading signals
  readonly trendingLoading = signal(false);
  readonly officialLoading = signal(false);

  private trendingSubject = new BehaviorSubject<YoutubeVideo[]>([]);
  trending$ = this.trendingSubject.asObservable();

  getTrending(limit = 12, page = 0, force = false): Observable<{ data: YoutubeVideo[] }> {
    const key = `trending:${limit}:${page}`;
    const hit = this.cache.get(key);
    if (!force && hit && Date.now() - hit.ts < this.TTL_MS) {
      this.trendingSubject.next(hit.data);
      return new Observable(sub => { sub.next({ data: hit.data }); sub.complete(); });
    }
    this.trendingLoading.set(true);
    const params = new HttpParams()
      .set('menuType', 'trending')
      .set('limit', String(limit))
      .set('page', String(page))
      .set('sort', '-engagementScore,-publishedAt');
    return this.api.get<{ success: boolean; data: YoutubeVideo[] }>('api/v1/youtube/videos', params).pipe(
      tap(res => {
        this.cache.set(key, { data: res.data, ts: Date.now() });
        this.trendingSubject.next(res.data);
        this.trendingLoading.set(false);
      }),
      shareReplay(1)
    ) as any;
  }

  getOfficial(limit = 12, page = 0): Observable<{ data: YoutubeVideo[] }> {
    const params = new HttpParams()
      .set('isOfficialContent', 'true')
      .set('menuType', 'music')
      .set('limit', String(limit))
      .set('page', String(page))
      .set('sort', '-publishedAt');
    this.officialLoading.set(true);
    return this.api.get<{ success: boolean; data: YoutubeVideo[] }>('api/v1/youtube/videos', params).pipe(
      tap(() => this.officialLoading.set(false))
    ) as any;
  }

  getVideos(limit = 12, page = 0, isShort = false): Observable<{ data: YoutubeVideo[] }> {
    const params = new HttpParams()
      .set('isShort', String(isShort))
      .set('menuType', 'videos')
      .set('limit', String(limit))
      .set('page', String(page))
      .set('sort', '-publishedAt');
    return this.api.get<{ success: boolean; data: YoutubeVideo[] }>('api/v1/youtube/videos', params) as any;
  }

  getById(id: string): Observable<{ data: YoutubeVideo }> {
    return this.api.get<{ success: boolean; data: YoutubeVideo }>(`api/v1/youtube/videos/${id}`) as any;
  }

  search(q: string, page = 0, limit = 12): Observable<{ data: YoutubeVideo[]; meta: any }> {
    const params = new HttpParams().set('search', q).set('page', String(page)).set('limit', String(limit));
    return this.api.get<{ success: boolean; data: YoutubeVideo[]; meta: any }>('api/v1/youtube/videos/search', params) as any;
  }

  // API-01: session user is used server-side; userId kept for callers.
  like(videoId: string, userId: string): Observable<any> {
    return this.api.post(`api/v1/youtube/videos/${videoId}/like`, {});
  }
  dislike(videoId: string, userId: string): Observable<any> {
    return this.api.post(`api/v1/youtube/videos/${videoId}/dislike`, {});
  }
}
