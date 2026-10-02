// src/app/common/services/comment.service.ts
import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
// FE-01 watch/save batch migrated: transport via core.
import { ApiService } from '../core/services/api.service';

export interface Comment {
  _id?: string;
  videoId: string;
  userId: string;
  avatar?: string;
  name: string;
  text: string;
  likes: number;
  likedBy?: string[];
  replies?: Comment[]; // Array of reply comment IDs
  parentComment?: string; // ID of parent comment if this is a reply
  isEdited?: boolean;
  isPinned?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user?: any;
}
@Injectable()
export class VideoCommentService {

  constructor(private apiService: ApiService) {}

  // API-01: RESTful engagement (session user used server-side; same response
  // keys as legacy — see docs youtube-parity.md).
  addComment(videoId: string, userId: string, text: string): Observable<any> {
    return this.apiService.post(`api/v1/youtube/videos/${videoId}/comments`, { text }, undefined, true);
  }

  addReply(videoId: string, parentCommentId: string, userId: string, text: string): Observable<any>  {
    return this.apiService.post(`api/v1/youtube/videos/${videoId}/comments/${parentCommentId}/replies`, { text }, undefined, true);
  }

  // Delete comment by ID
  deleteComment(commentId: string, userId: string, videoId: string): Observable<any> {
    return this.apiService.delete<any>(`api/v1/youtube/videos/${videoId}/comments/${commentId}`, undefined, undefined, true);
  }

  // Delete reply by ID
  deleteReply(parentCommentId: string, replyId: string, userId: string, videoId: string): Observable<any> {
    return this.apiService.delete<any>(`api/v1/youtube/videos/${videoId}/comments/${parentCommentId}/replies/${replyId}`, undefined, undefined, true);
  }

  likeComment(videoId: string, commentId: string, userId: string): Observable<any>  {
    return this.apiService.post(`api/v1/youtube/videos/${videoId}/comments/${commentId}/like`, {}, undefined, true);
  }

}