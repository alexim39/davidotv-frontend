// social-feed.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface SocialPost {
  id: string;
  platform: 'Instagram' | 'Twitter' | 'TikTok';
  platformIcon: string;
  text: string;
  mediaType: 'image' | 'video' | 'none';
  mediaUrl: string;
  likes: number;
  commentsCount: number;
  isLiked: boolean;
  time: Date;
  commentsList?: Array<{
    id: string;
    text: string;
    user: {
      id: string;
      name: string;
      avatar: string;
    };
    time: Date;
  }>;
}

@Injectable()
export class SocialFeedService {
  private mockPosts: SocialPost[] = [
    // Sample Instagram post
    {
      id: '1',
      platform: 'Instagram',
      platformIcon: 'assets/icons/instagram.png',
      text: 'Just dropped a new single! Check it out on all platforms #NewMusic #Davido',
      mediaType: 'image',
      mediaUrl: 'https://example.com/davido-new-single.jpg',
      likes: 125000,
      commentsCount: 8400,
      isLiked: false,
      time: new Date(Date.now() - 3600000 * 2),
      commentsList: [
        {
          id: '101',
          text: 'This is fire! 🔥',
          user: {
            id: 'user1',
            name: 'Fan1',
            avatar: 'assets/icons/user-avatar.png'
          },
          time: new Date(Date.now() - 3600000 * 1)
        },
        {
          id: '102',
          text: 'When is the video dropping?',
          user: {
            id: 'user2',
            name: 'Fan2',
            avatar: 'assets/icons/user-avatar.png'
          },
          time: new Date(Date.now() - 1800000)
        }
      ]
    },
    // Sample Twitter post
    {
      id: '2',
      platform: 'Twitter',
      platformIcon: 'assets/icons/twitter.png',
      text: 'Excited to announce my upcoming tour! Tickets go on sale tomorrow at 10am. Who\'s coming?',
      mediaType: 'image',
      mediaUrl: 'https://example.com/davido-tour.jpg',
      likes: 89000,
      commentsCount: 5600,
      isLiked: true,
      time: new Date(Date.now() - 3600000 * 5),
      commentsList: [
        {
          id: '201',
          text: 'I\'ll be there!',
          user: {
            id: 'user3',
            name: 'Fan3',
            avatar: 'assets/icons/user-avatar.png'
          },
          time: new Date(Date.now() - 3600000 * 4)
        }
      ]
    },
    // Sample TikTok post
    {
      id: '3',
      platform: 'TikTok',
      platformIcon: 'assets/icons/tiktok.png',
      text: 'Behind the scenes at my latest video shoot',
      mediaType: 'video',
      mediaUrl: 'https://example.com/davido-bts.mp4',
      likes: 450000,
      commentsCount: 12000,
      isLiked: false,
      time: new Date(Date.now() - 3600000 * 8),
      commentsList: [
        {
          id: '301',
          text: 'Looking good!',
          user: {
            id: 'user4',
            name: 'Fan4',
            avatar: 'assets/icons/user-avatar.png'
          },
          time: new Date(Date.now() - 3600000 * 7)
        },
        {
          id: '302',
          text: 'Can\'t wait for this!',
          user: {
            id: 'user5',
            name: 'Fan5',
            avatar: 'assets/icons/user-avatar.png'
          },
          time: new Date(Date.now() - 3600000 * 6)
        },
        {
          id: '303',
          text: '🔥🔥🔥',
          user: {
            id: 'user6',
            name: 'Fan6',
            avatar: 'assets/icons/user-avatar.png'
          },
          time: new Date(Date.now() - 3600000 * 5)
        }
      ]
    }
  ];

  getPosts(filter: 'all' | 'instagram' | 'twitter' | 'tiktok' = 'all'): Observable<SocialPost[]> {
    let posts = [...this.mockPosts];
    
    if (filter !== 'all') {
      posts = posts.filter(post => post.platform.toLowerCase() === filter);
    }
    
    return of(posts).pipe(delay(800)); // Simulate network delay
  }

  loadMorePosts(filter: 'all' | 'instagram' | 'twitter' | 'tiktok' = 'all'): Observable<SocialPost[]> {
    // In a real app, this would fetch more posts from an API with pagination
    return of([]).pipe(delay(800));
  }

  likePost(postId: string): Observable<{ likes: number; isLiked: boolean }> {
    // Simulate API call to like a post
    const post = this.mockPosts.find(p => p.id === postId);
    if (post) {
      if (post.isLiked) {
        post.likes--;
      } else {
        post.likes++;
      }
      post.isLiked = !post.isLiked;
      return of({ likes: post.likes, isLiked: post.isLiked }).pipe(delay(300));
    }
    return of({ likes: 0, isLiked: false });
  }

  addComment(postId: string, text: string): Observable<{ 
    commentsList: any[]; 
    commentsCount: number 
  }> {
    // Simulate API call to add a comment
    const post = this.mockPosts.find(p => p.id === postId);
    if (post) {
      const newComment = {
        id: Date.now().toString(),
        text,
        user: {
          id: 'current-user',
          name: 'You',
          avatar: 'assets/icons/user-avatar.png'
        },
        time: new Date()
      };
      
      // Update the mock data
      post.commentsList = [...(post.commentsList || []), newComment];
      post.commentsCount = (post.commentsCount || 0) + 1;
      
      return of({
        commentsList: post.commentsList,
        commentsCount: post.commentsCount
      }).pipe(delay(500));
    }
    return of({ commentsList: [], commentsCount: 0 });
  }
}