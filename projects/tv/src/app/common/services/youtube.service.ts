import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class YoutubeService {
  private apiKey = 'AIzaSyCnqQosiJ2hFLBMQM691p61f2mkkpg6Q7Y';
  private apiUrl = 'https://www.googleapis.com/youtube/v3/search';

  constructor(private http: HttpClient) {}

  getTrendingDavidoVideos(maxResults = 15) {
    const params = {
      part: 'snippet',
      q: 'Davido',
      type: 'video',
      maxResults: maxResults,
      order: 'viewCount',
      regionCode: 'NG',
      key: this.apiKey
    };

    return this.http.get(this.apiUrl, { params });
  }
}
