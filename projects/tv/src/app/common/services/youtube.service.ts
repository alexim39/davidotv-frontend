import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject, mergeMap, scan, takeWhile } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class YoutubeService {
  private apiKey = 'AIzaSyCnqQosiJ2hFLBMQM691p61f2mkkpg6Q7Y';
  private apiUrl = 'https://www.googleapis.com/youtube/v3/search';

  constructor(private http: HttpClient) {}

  /**
   * Fetch Davido videos from YouTube with flexible options.
   * @param order 'viewCount' for trending, 'date' for latest, 'relevance' for general
   * @param maxResults Number of results to fetch per page
   * @param pageToken Token for pagination
   */
  fetchDavidoVideos(
    order: 'viewCount' | 'date' | 'relevance' = 'relevance',
    maxResults = 12,
    pageToken: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('part', 'snippet')
      .set('q', 'Davido')
      .set('type', 'video')
      .set('maxResults', maxResults.toString())
      .set('order', order)
      .set('regionCode', 'NG')
      .set('key', this.apiKey);

    if (pageToken) {
      params = params.set('pageToken', pageToken);
    }

    return this.http.get(this.apiUrl, { params });
  }

  /**
   * Create a paginated observable for infinite scrolling
   * @param order Sorting order
   * @param pageSize Number of items per page
   */
  createPaginatedObservable(order: 'viewCount' | 'date' | 'relevance', pageSize = 12) {
    const loadMore$ = new Subject<string>();
    let nextPageToken = '';

    return loadMore$.pipe(
      mergeMap((token) => 
        this.fetchDavidoVideos(order, pageSize, token).pipe(
          takeWhile(response => {
            nextPageToken = response.nextPageToken || '';
            return !!response.nextPageToken;
          })
        )
      ),
      scan((acc: any, current: any) => {
        return {
          ...current,
          items: [...acc.items, ...current.items]
        };
      }, { items: [] }),
      // Start with initial load
      mergeMap(() => this.fetchDavidoVideos(order, pageSize, ''))
    );
  }

  /**
   * Convenience method for trending videos
   */
  getTrendingVideos(maxResults = 12, pageToken = '') {
    return this.fetchDavidoVideos('viewCount', maxResults, pageToken);
  }

  /**
   * Convenience method for all videos (latest)
   */
  getAllVideos(maxResults = 12, pageToken = '') {
    return this.fetchDavidoVideos('date', maxResults, pageToken);
  }
}