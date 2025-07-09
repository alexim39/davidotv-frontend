import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../common/services/api.service';

export interface PlaylistInterface {
  _id?: string;
  title: string;
  visibility: 'public' | 'private';
  description?: string;
  userId: string;
  isPublic?: boolean;
  tags?: any;
  thumbnailUrl?: string;
  updatedAt?: Date;
  videos?: any;
  videoCount?: number;
  previewVideos?: any
}



@Injectable()
export class LibraryService {
  constructor(private apiService: ApiService) {}

  // Create playlist
  createPlaylist(payload: PlaylistInterface): Observable<any> {
    return this.apiService.post<PlaylistInterface>('playlist/new', payload,  undefined, true);
  }

  // Get all playlist
  getPlaylists(userId: string): Observable<any> {;
    return this.apiService.get<any>(`playlist/${userId}`, undefined, undefined, true);
  }

  // get by id
  getPlaylistById(playlistId: string): Observable<any> {
    return this.apiService.get<any>(`playlist/details/${playlistId}`, undefined, undefined, true);
  }

  // delete by id
  deletePlaylist(playlistId: string, userId: string): Observable<any> {
    return this.apiService.delete<any>(`playlist/delete/${playlistId}/${userId}`, undefined, undefined, true);
  }

  // remove video from playlist
  removeVideoFromPlaylist(videoId: string, userId: string, playlistId: string): Observable<any> {
    return this.apiService.delete<any>(`playlist/video/delete/${videoId}/${userId}/${playlistId}`, undefined, undefined, true);
  }

  addVideoToPlaylist(payload: {playlistId: string; userId: string; videoId: string}): Observable<any> {
    return this.apiService.post<PlaylistInterface>('playlist/add-video', payload,  undefined, true);
  }

  // edit playlist
  editPlaylist(payload: PlaylistInterface): Observable<any> {
    return this.apiService.put<PlaylistInterface>('playlist/edit', payload,  undefined, true);
  }

}