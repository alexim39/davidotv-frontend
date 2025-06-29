import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../common/services/api.service';

export interface Thread {
  _id: string;
  title: string;
  content: string;
  author: User;
  createdAt: Date;
  tags: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  likeCount: number;
  replies: Comment[];
  isLiked?: boolean;
  replyCount?: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  constructor(private apiService: ApiService) {}

  // Thread Operations
  // This method creates a new thread in the forum
  createThread(thread: { title: string; content: string; tags: string[], authorId: string }): Observable<Thread> {
    return this.apiService.post<Thread>('forum/threads/new', thread,  undefined, true);
  }

  // Get all threads
  // This method fetches all threads from the forum
  getThreads(){;
    return this.apiService.get<any>('forum/threads', undefined, undefined, true);
  }

  // Get a perticular thread by ID
  getThreadById(id: string): Observable<any> {
    return this.apiService.get<any>(`forum/thread/${id}`, undefined, undefined, true);
  }


  // Comment Operations - Used to get all comments for a thread
  getThreadComments(threadId: string): Observable<any> {
    console.log('Fetching comments for thread:', threadId);
    return this.apiService.get<any>(`forum/thread/comments/${threadId}`, undefined, undefined, true);
  }

  // This method adds a new comment to a thread
  addComment(threadId: string, content: string, authorId: string): Observable<any> {
    return this.apiService.post<Comment>(`forum/thread/comment/new`, { content, threadId, authorId }, undefined, true);
  }







  getThreadsByTag(tag: string): Observable<any> {
    return this.apiService.get<Thread[]>(`forum/threads/tags/${tag}`, undefined, undefined, true);
  }

  toggleLikeThread(threadId: string): Observable<Thread> {
    return this.apiService.post<Thread>(`forum/threads/like`, {threadId}, undefined, true);
  }

  incrementViewCount(threadId: string): Observable<Thread> {
    return this.apiService.post<Thread>(`forum/threads/view`, {threadId}, undefined, true);
  }



 

  addReply(commentId: string, content: string): Observable<Comment> {
    return this.apiService.post<Comment>(`forum/comments/${commentId}/replies`, { content }, undefined,  true);
  }

  toggleLikeComment(commentId: string): Observable<Comment> {
    return this.apiService.post<Comment>(`forum/comments/like`, {commentId}, undefined,  true);
  }

  deleteComment(commentId: string): Observable<{ success: boolean }> {
    return this.apiService.delete<{ success: boolean }>(`forum/comments/${commentId}`, undefined, undefined, true);
  }
}