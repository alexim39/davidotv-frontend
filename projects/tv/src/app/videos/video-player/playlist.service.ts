import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, tap } from 'rxjs';
import { ApiService } from '../../common/services/api.service';
import { HttpParams } from '@angular/common/http';

interface PlaylistResponse {
  data: any[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
  };
}

@Injectable()
export class PlaylistService {
  constructor(private apiService: ApiService) {}

  getPlaylistVideos(
    page: number = 1,
    pageSize: number = 10,
    menuType?: string
  ): Observable<PlaylistResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (menuType) {
      params = params.set('menuType', menuType);
    }

    return this.apiService.get<PlaylistResponse>(`youtube/videos/playlist`, params).pipe(
      tap((response: PlaylistResponse) => console.log('API Response:', response)),
      catchError((error: any) => {
        console.error('API Error:', error);
        return throwError(() => new Error('Failed to load videos'));
      })
    );
  }
}