import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../common/services/api.service';


@Injectable()
export class PlaylistService {
 constructor(private apiService: ApiService) {}

  /**
   * Get video data from the backend API.
   * @returns An Observable that emits the API response or an error.
   */
  getDavidoVideos(): Observable<any> {
    return this.apiService.get<any>(`youtube/videos`, undefined, undefined, true);
  }


}












/* import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private apiKey = 'AIzaSyCnqQosiJ2hFLBMQM691p61f2mkkpg6Q7Y';
  private channelId = 'UCkBV3nBa0iRdxEGc4DUS3xA'; // DavidoVEVO

  constructor(private http: HttpClient) {}

  getDavidoVideos(maxResults = 10) {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${this.apiKey}&channelId=${this.channelId}&part=snippet&type=video&order=date&q=official music video&maxResults=${maxResults}`;

    return this.http.get<any>(url).pipe(
      map(response => response.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        duration: 'N/A', // Optional: fetch from videos endpoint
        views: 'N/A',
        date: new Date(item.snippet.publishedAt).toLocaleDateString()
      })))
    );
  }
}
 */




/* import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private apiKey = 'AIzaSyCnqQosiJ2hFLBMQM691p61f2mkkpg6Q7Y';
  private apiUrl = 'https://www.googleapis.com/youtube/v3/search';
  //private channelId = 'UCkBV3nBa0iRdxEGc4DUS3xA'; // DavidoVEVO

  constructor(private http: HttpClient) {}

  getDavidoVideos(): Observable<any[]> {
    const params = new HttpParams()
      .set('part', 'snippet')
      //.set('channelId', this.channelId)
      .set('q', 'official music video')
      .set('type', 'video')
      .set('maxResults', '30')
      .set('order', 'date')
      .set('key', this.apiKey);

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response =>
        response.items
          .filter((item: any) =>
            item.snippet.title.toLowerCase().includes('davido') &&
            item.snippet.title.toLowerCase().includes('official')
          )
          .map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
            duration: 'N/A', // Optional: fetch from videos endpoint
            views: 'N/A',
            date: new Date(item.snippet.publishedAt).toLocaleDateString()
          }))
      )
    );
  }
} */
