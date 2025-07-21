// src/app/common/services/comment.service.ts
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from '../../common/services/api.service';
import { UserInterface } from '../../common/services/user.service';

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



  addComment(videoId: string, userId: string, text: string): Observable<any> {
    return this.apiService.patch(`youtube/comment/add`, { userId, videoId, text }, undefined, true);
  }

  addReply(videoId: string, parentCommentId: string, userId: string, text: string): Observable<any>  {
    return this.apiService.patch(`youtube/comment/reply/add`, { userId,  videoId,  parentCommentId,  text }, undefined, true);
  }

  // Delete comment by ID
  deleteComment(commentId: string, userId: string, videoId: string): Observable<any> {
    return this.apiService.delete<any>(`youtube/comment/delete/${commentId}/${userId}/${videoId}`, undefined, undefined, true);
  }

  // Delete reply by ID
  deleteReply(parentCommentId: string, replyId: string, userId: string, videoId: string): Observable<any> {
    console.log('values ', parentCommentId, replyId, userId, videoId)
    return this.apiService.delete<any>(`youtube/comment/reply/delete/${parentCommentId}/${replyId}/${userId}/${videoId}`, undefined, undefined, true);
  }

  likeComment(videoId: string, commentId: string, userId: string): Observable<any>  {
    return this.apiService.patch(`youtube/comment/like/${commentId}/${videoId}`, { userId }, undefined, true );
  }

}