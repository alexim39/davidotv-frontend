// src/app/common/services/comment.service.ts
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from '../../common/services/api.service';

export interface Comment {
  _id?: string;
  videoId: string;
  userId: string;
  userAvatar: string;
  username: string;
  text: string;
  likes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class VideoCommentService {

   constructor(private apiService: ApiService) {}



  addComment(videoId: string, userId: string, text: string) {
    const comment = { userId, videoId, text };
    return this.apiService.patch(`youtube/comment/add`, comment, undefined, true);
  }

  likeComment(videoId: string, commentId: string, userId: string) {
    return this.apiService.patch(`youtube/${videoId}/comments/${commentId}/like`, 
      { userId },
      undefined, true
    );
  }

  addReply(videoId: string, parentId: string, userId: string, userAvatar: string, username: string, text: string) {
    return this.apiService.patch(`youtube/${videoId}/comments/${parentId}/replies`, {
      userId,
      userAvatar,
      username,
      text
    }, undefined, true);
  }
}