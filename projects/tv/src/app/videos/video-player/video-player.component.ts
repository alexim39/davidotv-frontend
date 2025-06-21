import { Component, ElementRef, OnInit, ViewChild, HostListener, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PlaylistService } from './playlist.service';
import { YoutubeService, YoutubeVideoInterface } from '../../common/services/youtube.service';
import { timeAgo as timeAgoUtil, formatDuration as videoDuration, formatViewCount as viewFormat } from '../../common/utils/time.util';
import { Subscription, timer } from 'rxjs';
import { UserInterface, UserService } from '../../common/services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { VideoService } from '../../common/services/videos.service';
import { VideoCommentsComponent } from './video-comments/video-comments.component';
import { RecommendationsSidebarComponent } from './recommendations-sidebar/recommendations-sidebar.component';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

@Component({
  selector: 'async-video-player',
  providers: [PlaylistService],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSliderModule,
    MatSlideToggleModule,
    VideoCommentsComponent,
    RecommendationsSidebarComponent
  ],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <div class="logo-container">
            <img src="./img/logo2.PNG" alt="DavidoTv Logo" class="logo">
            <h1>DavidoTV</h1>
          </div>
          <div class="header-actions">
            <button mat-raised-button class="subscribe-btn">
              <mat-icon>notifications</mat-icon>
              Subscribe
            </button>
            <button mat-raised-button color="primary" class="premium-btn">
              Go Premium
            </button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <section class="video-section">
          <div class="video-container" *ngIf="safeUrl; else loadingTpl">
            <div class="video-wrapper">
              <iframe
                #videoFrame
                [src]="safeUrl"
                [class.hidden]="isLoading"
                width="100%"
                height="100%"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                title="{{ videoTitle }}"
                (load)="onVideoLoad()"
                aria-label="Davido video player"
                tabindex="0"
              ></iframe>
            </div>

            <div class="repeat-indicator" *ngIf="repeatMode !== 'none'">
              Repeat {{ repeatMode === 'one' ? '1' : 'All' }}
            </div>

            <div class="video-controls" *ngIf="!isLoading" [class.hidden]="!showControls && isPlaying">
              <div class="controls-container">
                <div class="left-controls">
                  <button mat-icon-button (click)="togglePlayPause()" aria-label="Play/Pause">
                    <mat-icon>{{ isPlaying ? 'pause' : 'play_arrow' }}</mat-icon>
                  </button>
                  <button mat-icon-button (click)="playPreviousVideo()" aria-label="Previous video">
                    <mat-icon>skip_previous</mat-icon>
                  </button>
                  <button mat-icon-button (click)="playNextVideo()" aria-label="Next video">
                    <mat-icon>skip_next</mat-icon>
                  </button>
                  <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
                </div>
                <div class="right-controls">
                  <button mat-icon-button (click)="toggleMute()" aria-label="Toggle mute">
                    <mat-icon>{{ isMuted ? 'volume_off' : 'volume_up' }}</mat-icon>
                  </button>
                  <button mat-icon-button (click)="toggleFullscreen()" aria-label="Toggle fullscreen">
                    <mat-icon>{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
                  </button>
                </div>
              </div>

              <div class="progress-bar">
                <mat-slider 
                  min="0" 
                  [max]="duration" 
                  (input)="seekVideo($event)"
                  step="1"
                  aria-label="Video progress"
                >
                  <input matSliderThumb [value]="currentTime">
                </mat-slider>
              </div>
            </div>
          </div>

          <ng-template #loadingTpl>
            <div class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
              <p class="loading-text">Loading Davido's content...</p>
            </div>
          </ng-template>

          <div class="video-info-container" *ngIf="!isLoading">
            <div class="video-meta-container">
              <div class="music-title">
                <h2 class="song-title">{{ currentVideo.title }}</h2>
                <div class="artist-info">
                  <span class="artist-name">- {{currentVideo.channel}}</span>
                </div>
              </div>

              <div class="video-meta">
                <div class="youtube-stats">
                  <div class="youtube-badge">
                    <mat-icon class="youtube-icon">smart_display</mat-icon>
                    <span class="youtube-label">YouTube</span>
                  </div>
                  <div class="youtube-metrics">
                    <span class="youtube-metric" matTooltip="Views">
                      {{ formatViewCount(currentVideo.views)  }} views
                    </span>
                    •
                    <span class="youtube-metric" matTooltip="Likes">
                      {{ currentVideo.likes  }} likes
                    </span>
                    •
                    <span class="youtube-metric" matTooltip="Dislikes">
                      {{ currentVideo.dislikes  }} dislikes
                    </span>
                    •
                    <span class="youtube-metric" matTooltip="Published">
                      {{ timeAgo(currentVideo.publishedAt) }}
                    </span>
                  </div>
                </div>

                <div class="app-engagement">
                  <div class="reaction-buttons">
                    <button class="reaction-btn like-btn" (click)="likeVideo()" [class.active]="liked">
                      <mat-icon>{{ liked ? 'thumb_up' : 'thumb_up_off_alt' }}</mat-icon>
                      <span class="count">{{ appLikes | number }}</span>
                    </button>
                    
                    <button class="reaction-btn dislike-btn" (click)="dislikeVideo()" [class.active]="disliked">
                      <mat-icon>{{ disliked ? 'thumb_down' : 'thumb_down_off_alt' }}</mat-icon>
                      <span class="count">{{ appDislikes | number }}</span>
                    </button>
                  </div>
                  
                  <div class="action-buttons">
                    <button mat-mini-fab class="action-btn" (click)="shareVideo()" matTooltip="Share">
                      <mat-icon>share</mat-icon>
                    </button>
                    
                    <button mat-mini-fab class="action-btn" (click)="saveVideo()" [class.active]="saved" matTooltip="Save">
                      <mat-icon>{{ saved ? 'bookmark' : 'bookmark_border' }}</mat-icon>
                    </button>
                    
                    <button mat-mini-fab class="action-btn" (click)="toggleRepeatMode()" [class.active]="repeatMode !== 'none'" matTooltip="Repeat">
                      <mat-icon>{{ repeatMode === 'one' ? 'repeat_one' : 'repeat' }}</mat-icon>
                    </button>
                    
                    <div class="view-count" matTooltip="App Views">
                      <mat-icon>visibility</mat-icon>
                      <span>{{ formatViewCount(appViews) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="video-description">
              <h2>{{ videoTitle }}</h2>
              <div class="creator-info">
                <img [src]="creatorAvatar" alt="Davido" class="creator-avatar">
                <div class="creator-details">
                  <h3>Davido</h3>
                  <p>12.5M subscribers</p>
                </div>
                <button mat-raised-button color="warn" class="subscribe-btn">
                  SUBSCRIBE
                </button>
              </div>
              <div class="description-text" [class.expanded]="descriptionExpanded">
                <p>{{ videoDescription }}</p>
                <button mat-button (click)="descriptionExpanded = !descriptionExpanded" class="show-more-btn">
                  Show {{ descriptionExpanded ? 'less' : 'more' }}
                </button>
              </div>
            </div>
          </div>

          <async-video-comments 
            [comments]="comments"
            [currentUserAvatar]="currentUserAvatar"
            (commentAdded)="onCommentAdded($event)"
          ></async-video-comments>
        </section>

        <section class="recommendations-section">
          <async-recommendations-sidebar 
          [recommendedVideos]="recommendedVideos"
          [isLoading]="isLoading"
          [autoplay]="autoplay"
          (navigateToVideo)="navigateToVideo($event)"
          (autoplayChanged)="autoplay = $event"
        ></async-recommendations-sidebar>
        </section>
      </main>
    </div>
  `,
  styleUrls: ['./video-player.component.scss'],
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  safeUrl: SafeResourceUrl | null = null;
  videoTitle = 'Davido - New Hit Single (Official Video)';
  videoDescription = `Official music video for Davido's latest hit single. 
  
  Directed by Director X
  Produced by Speroach Beatz
  Lyrics by Davido
  
  Follow Davido:
  Instagram: @davido
  Twitter: @davido
  Facebook: /davidoofficial
  
  #Davido #NewSingle #Afrobeats`;
  isLoading = true;
  showOverlay = true;
  descriptionExpanded = false;
  showControls = true;
  controlsTimeout: any;

  // Video stats
  liked = false;
  disliked = false;
  saved = false;

  // Player state
  currentVideoId: string = '';
  isPlaying = false;
  player: any; // Type as 'any' for YouTube player object
  playerReady = false;
  isMuted = false;
  isFullscreen = false;
  currentTime = 0;
  duration = 0;

  pendingAutoPlay: boolean = false;

  // Playlist management
  davidoVideos: any[] = [];

  // Playlist management
  /* davidoVideos = [
    { youtubeVideoId: 'NnWe5Lhi0G8', title: 'Davido - Fall', duration: '4:25', thumbnail: 'https://i.ytimg.com/vi/NnWe5Lhi0G8/mqdefault.jpg', views: '245M views', publishedAt: '5 years ago' },
    { youtubeVideoId: 'helEv0kGHd4', title: 'Davido - IF', duration: '3:32', thumbnail: 'https://i.ytimg.com/vi/helEv0kGHd4/mqdefault.jpg', views: '187M views', publishedAt: '4 years ago' },
    { youtubeVideoId: 'l6QMJniQWxQ', title: 'Davido - Assurance', duration: '4:12', thumbnail: 'https://i.ytimg.com/vi/l6QMJniQWxQ/mqdefault.jpg', views: '98M views', publishedAt: '3 years ago' },
    { youtubeVideoId: '8ORvJcpe2Oc', title: 'Davido - Assurance', duration: '4:12', thumbnail: 'https://i.ytimg.com/vi/8ORvJcpe2Oc/mqdefault.jpg', views: '98M views', publishedAt: '3 years ago' },
    { youtubeVideoId: 'oiHh2-6jmnU', title: 'Davido - Assurance', duration: '4:12', thumbnail: 'https://i.ytimg.com/vi/oiHh2-6jmnU/mqdefault.jpg', views: '98M views', publishedAt: '3 years ago' },
    { youtubeVideoId: '3Iyuym-Gci0', title: 'Davido - Fall', duration: '4:12', thumbnail: 'https://i.ytimg.com/vi/3Iyuym-Gci0/mqdefault.jpg', views: '98M views', publishedAt: '3 years ago' },
    { youtubeVideoId: 'QGrxqOcZpZU', title: 'Davido - Fall', duration: '4:12', thumbnail: 'https://i.ytimg.com/vi/QGrxqOcZpZU/mqdefault.jpg', views: '98M views', publishedAt: '3 years ago' },
    { youtubeVideoId: 'dAD73UeU6Dw', title: 'Davido - Fall', duration: '4:12', thumbnail: 'https://i.ytimg.com/vi/dAD73UeU6Dw/mqdefault.jpg', views: '98M views', publishedAt: '3 years ago' },
  ]; */
  currentVideoIndex = 0;

  // Repeat mode
  repeatMode: 'none' | 'one' | 'all' = 'none';
  
  // Comments
  comments = [
    { 
      user: 'SuperFan', 
      text: 'Davido never disappoints! This song is fire 🔥🔥', 
      likes: 1245,
      time: '2 days ago',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    { 
      user: 'MusicLover', 
      text: 'The production on this track is insane. That beat drop at 1:23 gives me chills every time!', 
      likes: 892,
      time: '1 week ago',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    }
  ];
  newComment = '';

  // Recommended videos
  recommendedVideos = this.davidoVideos;
  autoplay = false;

  // User data
  currentUserAvatar = 'https://randomuser.me/api/portraits/men/1.jpg';
  creatorAvatar = 'https://randomuser.me/api/portraits/men/0.jpg';

  @ViewChild('videoFrame') videoFrame!: ElementRef<HTMLIFrameElement>;

  private playerStateInterval: any;
  private updateInterval: any = null;
  currentVideo!: YoutubeVideoInterface;
  appViews = 0; 
  appLikes = 0; 
  appDislikes = 0; 

  subscriptions: Subscription[] = [];
  user: UserInterface | null = null;

  // Add these properties to your component
  private watchHistoryInterval = 10; // Update every 10 seconds
  private watchHistorySubscription: Subscription | null = null;

   onCommentAdded(commentText: string) {
    this.comments.unshift({
      user: 'You',
      text: commentText,
      likes: 0,
      time: 'Just now',
      avatar: this.currentUserAvatar
    });
  }

  constructor(
    private route: ActivatedRoute, 
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private router: Router,
    private ngZone: NgZone, // Inject NgZone
    private playlistService: PlaylistService,
    private youtubeService: YoutubeService,
    private userService: UserService,
    private videoService: VideoService
  ) {}

  ngOnInit() {
   const videoId = this.route.snapshot.paramMap.get('id');
    if (videoId) {
      this.currentVideoId = videoId;
      this.currentVideoIndex = this.davidoVideos.findIndex((v: any) => v.id === videoId);
      this.loadVideo(videoId);

      this.getCurrentVideoData(videoId)
    }

      
    this.playlistService.getPlaylistVideos().subscribe({
      next: (response) => {
        console.log('playlist video response ',response)
        this.davidoVideos = response.data;
        this.recommendedVideos = response.data;;
      }
    }); 


    // Assign onYouTubeIframeAPIReady to a global function and ensure it runs in Angular's zone
    window.onYouTubeIframeAPIReady = () => this.ngZone.run(() => this.onYouTubeIframeAPIReady());
    this.loadYouTubeAPI();

     this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
          console.log('current user ',this.user)
        }
      })
    )

  }

  private getCurrentVideoData(videoId: string) {
     // Get current video details
      this.youtubeService.getVideoById(videoId).subscribe({
        next: (response: any) => {
          console.log('single video response ',response)
          this.currentVideo = response.data;
        }
      });
  }


  ngOnDestroy() {
    // Clear the interval to prevent memory leaks
    if (this.playerStateInterval) {
      clearInterval(this.playerStateInterval);
    }
    // Destroy the YouTube player instance
    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy();
    }
    clearTimeout(this.controlsTimeout);
    // Remove the global onYouTubeIframeAPIReady reference to prevent issues on component re-creation
    if (window.onYouTubeIframeAPIReady === this.onYouTubeIframeAPIReady) {
      (window as any).onYouTubeIframeAPIReady = undefined; 
    }

    // destroy the subscription for user
    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    this.stopWatchHistoryTracking();
  }

  loadYouTubeAPI() {
    // Check if the YouTube API script is already loaded
    if (!(window as any).YT || typeof (window as any).YT.Player === 'undefined') {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api'; // Official YouTube Iframe API script URL
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else {
      // If API is already loaded (e.g., navigating back to component, or hot module reload)
      // Call the ready function directly within Angular's zone
      this.ngZone.run(() => this.onYouTubeIframeAPIReady());
    }
  }

    onYouTubeIframeAPIReady() {
      // If the ViewChild is not yet available, retry after a short delay
      if (!this.videoFrame || !this.videoFrame.nativeElement) {
        setTimeout(() => this.onYouTubeIframeAPIReady(), 100);
        return;
      }

      // ...existing code...
      if (!this.player || typeof this.player.getPlayerState !== 'function') {
        if (this.player && typeof this.player.destroy === 'function') {
          this.player.destroy();
        }

        this.player = new window.YT.Player(this.videoFrame.nativeElement, {
          videoId: this.currentVideoId,
          playerVars: {
            enablejsapi: 1,
            rel: 0,
            modestbranding: 1,
            controls: 0,
            disablekb: 1,
            fs: 1,
            iv_load_policy: 3,
            origin: window.location.origin,
            autoplay: this.autoplay ? 1 : 0
          },
          events: {
            'onReady': this.onPlayerReady.bind(this),
            'onStateChange': this.onPlayerStateChange.bind(this)
          }
        });
      } else {
        this.player.loadVideoById(this.currentVideoId);
        if (this.autoplay) {
          this.player.playVideo();
        }
      }
    }

    onPlayerReady(event: any) {
      this.ngZone.run(() => {
        this.playerReady = true;
        this.isLoading = false;

        // Synchronous call
        const duration = this.player.getDuration();
        this.duration = isNaN(duration) ? 0 : duration;

        this.startUpdateLoop();

        if (this.pendingAutoPlay) {
          this.playVideo();
          this.pendingAutoPlay = false;
        }

        // Synchronous call
        const time = this.player.getCurrentTime();
        this.currentTime = isNaN(time) ? 0 : time;

        this.startPlayerStatePolling();

        if (this.autoplay) {
          this.playVideo();
        }
      });
    }


    onPlayerStateChange(event: any) {
  this.ngZone.run(() => {
    const state = event.data;
    
    if (state === window.YT.PlayerState.PLAYING) {
      this.isPlaying = true;
      this.showOverlay = false;
      
      // Start tracking watch progress
      this.startWatchHistoryTracking();
      
      if (this.duration === 0 || isNaN(this.duration)) {
        this.getDuration();
      }
    } else if (state === window.YT.PlayerState.PAUSED || state === window.YT.PlayerState.ENDED) {
      this.isPlaying = false;
      this.stopWatchHistoryTracking();
      
      if (state === window.YT.PlayerState.ENDED) {
        this.handleVideoEnded();
      }
    }
    
    this.resetControlsTimer();
  });
}

  startPlayerStatePolling() {
    // Clear any existing interval to prevent multiple polls running
    if (this.playerStateInterval) {
      clearInterval(this.playerStateInterval);
    }
    
    // Set up a new interval to poll current time and duration
    this.playerStateInterval = setInterval(() => {
      if (this.playerReady && this.player) {
        try {
          // Get current time (synchronous)
          const time = this.player.getCurrentTime();
          if (!isNaN(time)) {
            this.ngZone.run(() => {
              this.currentTime = time;
            });
          }

          // Refresh duration periodically (in case it wasn't available initially)
          if (this.duration <= 0 || isNaN(this.duration)) {
            const duration = this.player.getDuration();
            if (!isNaN(duration) && duration > 0) {
              this.ngZone.run(() => {
                this.duration = duration;
              });
            }
          }
        } catch (error) {
          console.error('Error polling player state:', error);
        }
      }
    }, 1000); // Poll every second
  }

 loadVideo(videoId: string, autoPlay: boolean = false) {
    this.currentVideoId = videoId;
    // Correct YouTube iframe URL format
    const url = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&controls=0&disablekb=1&fs=1&iv_load_policy=3&origin=${window.location.origin}`;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    
    this.showOverlay = true;
    this.isPlaying = false;
    this.isLoading = true; // Indicate loading state for the new video
    this.duration = 0; // Reset duration
    this.currentTime = 0; // Reset current time to 0 for the new video
    this.playerReady = false; // Reset player ready state for the new load

    this.updateVideoInfo(videoId);
    
    // If the player object already exists and is functional, load the new video via API
    // This handles navigating between videos without full component re-initialization
    if (this.player && typeof this.player.loadVideoById === 'function') {
      this.player.loadVideoById(videoId);
    }

    
 this.playerReady = false;
 this.pendingAutoPlay = autoPlay; // new flag
    // If the player is ready, we can play immediately
    if (this.playerReady && autoPlay) {
      this.playVideo();
    } else {
      // Otherwise, wait for onPlayerReady to handle autoplay
      this.pendingAutoPlay = autoPlay;
    }
    
    // Update current video index based on the new video ID
    this.currentVideoIndex = this.davidoVideos.findIndex((v: any) => v.id === videoId);
    // load video data
    this.getCurrentVideoData(videoId)
  } 


  updateVideoInfo(videoId: string) {
    const video = this.davidoVideos.find((v: any) => v.id === videoId);
    if (video) {
      this.videoTitle = video.title;
      //this.uploadDate = new Date();
      //this.uploadDate.setFullYear(this.uploadDate.getFullYear() - Math.floor(Math.random() * 5));
    }
  }

  onVideoLoad() {
    // This event signifies the iframe itself has loaded. The YouTube player inside still needs to be ready.
    // The actual video loading state and player readiness is managed by onPlayerReady from YouTube API.
    // No specific action needed here that isn't covered by onPlayerReady.
  }

  private startUpdateLoop() {
    this.stopUpdateLoop();
    this.updateInterval = setInterval(() => {
      if (this.playerReady && this.player && typeof this.player.getCurrentTime === 'function') {
        const time = this.player.getCurrentTime();
        if (!isNaN(time)) {
          this.ngZone.run(() => {
            this.currentTime = time;
          });
        }
      }
    }, 1000);
  }

  private stopUpdateLoop() {
  if (this.updateInterval) {
    clearInterval(this.updateInterval);
    this.updateInterval = null;
  }
}

  // Player control methods
  playVideo() {
    if (this.playerReady) {
      this.ngZone.run(() => {
        this.player.playVideo();
        this.isPlaying = true;
        this.showOverlay = false;
      });
    }
    this.resetControlsTimer();
  }

  pauseVideo() {
    if (this.playerReady) {
      this.ngZone.run(() => {
        this.player.pauseVideo();
      });
    }
    this.isPlaying = false;
    this.showControls = true;
    clearTimeout(this.controlsTimeout);
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

 seekVideo(event: any) {
    // Handle both MatSlider events and direct number inputs
    const time = typeof event === 'number' ? event : event.value;
    
    this.ngZone.run(() => {
      this.currentTime = time; // Update current time immediately for smooth slider movement
      
      if (this.playerReady) {
        this.player.seekTo(time, true); // Seek with immediate playback
        if (!this.isPlaying) {
          this.player.playVideo(); // Start playing after seek if it was paused
          this.isPlaying = true;
        }
      }
    });
    
    this.resetControlsTimer();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.playerReady) {
      if (this.isMuted) {
        this.player.mute();
      } else {
        this.player.unMute();
      }
    }
    this.resetControlsTimer();
  }

  toggleFullscreen() {
    const iframe = this.videoFrame.nativeElement;
    
    if (!document.fullscreenElement) {
      iframe.requestFullscreen?.().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
      this.isFullscreen = true;
    } else {
      document.exitFullscreen?.();
      this.isFullscreen = false;
    }
    this.resetControlsTimer();
  }

 getDuration() {
    if (this.playerReady && this.player) {
      this.player.getDuration().then((duration: number) => {
        this.ngZone.run(() => {
          if (!isNaN(duration) && duration > 0) {
            this.duration = duration;
          } else {
            // If we get an invalid duration, try again later
            setTimeout(() => this.getDuration(), 1000);
          }
        });
      }).catch((error: any) => {
        console.error('Error getting duration:', error);
        // Retry after a delay
        setTimeout(() => this.getDuration(), 1000);
      });
    }
  }

 formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  @HostListener('mousemove')
  @HostListener('keydown')
  @HostListener('touchstart')
  onUserActivity() {
    this.resetControlsTimer();
  }

  resetControlsTimer() {
    this.showControls = true;
    clearTimeout(this.controlsTimeout);
    this.controlsTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.showControls = false;
      }
    }, 3000);
  }

  handleVideoEnded() {
    switch (this.repeatMode) {
      case 'one':
        this.seekVideo({ value: 0 }); // Seek to the beginning of the current video
        this.playVideo(); // Play the current video again
        break;
      case 'all':
        this.playNextVideo(true); // Play the next video, and loop to the first if at end
        break;
      default:
        this.isPlaying = false;
        this.showOverlay = true;
        this.showControls = true;
    }
  }

  playNextVideo(loop: boolean = false) {
    if (this.davidoVideos.length > 0) {
      let nextIndex = this.currentVideoIndex + 1;
      if (nextIndex >= this.davidoVideos.length) {
        if (loop) {
          nextIndex = 0; // Loop back to the first video
        } else {
          // If not looping, stop playback and reset state
          this.isPlaying = false;
          this.showOverlay = true;
          this.showControls = true;
          return;
        }
      }
      const nextVideo = this.davidoVideos[nextIndex];
      this.currentVideoIndex = nextIndex;
      this.router.navigate(['/watch', nextVideo.youtubeVideoId]);
      this.loadVideo(nextVideo.youtubeVideoId, true);
      this.playVideo(); // Automatically play the next video
    }
  }

  playPreviousVideo() {
    if (this.davidoVideos.length > 0) {
      let prevIndex = this.currentVideoIndex - 1;
      if (prevIndex < 0) {
        prevIndex = this.davidoVideos.length - 1; // Loop to the last video
      }
      const prevVideo = this.davidoVideos[prevIndex];
      this.currentVideoIndex = prevIndex;
      this.router.navigate(['/watch', prevVideo.youtubeVideoId]);
      this.loadVideo(prevVideo.youtubeVideoId, true);
      this.playVideo(); // Automatically play the previous video
    }
  }

  toggleRepeatMode() {
    if (this.repeatMode === 'none') {
      this.repeatMode = 'one';
      this.snackBar.open('Repeat One', '', { duration: 1000 });
    } else if (this.repeatMode === 'one') {
      this.repeatMode = 'all';
      this.snackBar.open('Repeat All', '', { duration: 1000 });
    } else {
      this.repeatMode = 'none';
      this.snackBar.open('Repeat Off', '', { duration: 1000 });
    }
  }

  likeVideo() {
    if (!this.liked) {
      this.liked = true;
      this.appLikes++;
      if (this.disliked) {
        this.disliked = false;
        this.appDislikes--;
      }
    } else {
      this.liked = false;
      this.appLikes--;
    }
  }

  dislikeVideo() {
    if (!this.disliked) {
      this.disliked = true;
      this.appDislikes++;
      if (this.liked) {
        this.liked = false;
        this.appLikes--;
      }
    } else {
      this.disliked = false;
      this.appDislikes--;
    }
  }

 /*  saveVideo() {
    this.saved = !this.saved;
    this.snackBar.open(this.saved ? 'Video saved!' : 'Video removed from saved.', '', { duration: 2000 });
  } */

  saveVideo() {
  if (!this.user) {
    this.snackBar.open('Please login to save videos', '', { duration: 2000 });
    return;
  }

  this.saved = !this.saved;
  
  if (this.saved) {
    const videoData = {
      youtubeVideoId: this.currentVideoId,
      title: this.currentVideo.title,
      channel: this.currentVideo.channel,
      thumbnail: `https://i.ytimg.com/vi/${this.currentVideoId}/mqdefault.jpg`,
      duration: this.currentVideo.duration,
      publishedAt: this.currentVideo.publishedAt
    };

    this.videoService.saveVideoToLibrary(this.user._id, videoData).subscribe({
      next: (response: any) => {
        this.snackBar.open(response.message, '', { duration: 2000 });
      },
      error: (error: HttpErrorResponse) => {
        this.saved = false;
        //this.snackBar.open('Failed to save video', '', { duration: 2000 });
        //console.error('Error saving video:', error);

          let errorMessage = 'Server error occurred, please try again.'; // default error message.
          if (error.error && error.error.message) {
            errorMessage = error.error.message; // Use backend's error message if available.
          }  
          this.snackBar.open(errorMessage, 'Ok',{duration: 2000});

      }
    });
  } else {
    this.videoService.removeVideoFromLibrary(this.user._id, this.currentVideoId).subscribe({
      next: () => {
        this.snackBar.open('Video removed from library', '', { duration: 2000 });
      },
      error: (error: HttpErrorResponse) => {
        this.saved = true;
        this.snackBar.open('Failed to remove video', '', { duration: 2000 });
        //console.error('Error removing video:', error);
      }
    });
  }
}

  shareVideo() {
    if (navigator.share) {
      navigator.share({
        title: this.videoTitle,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.snackBar.open('Link copied to clipboard!', '', { duration: 2000 });
    }
  }

  addComment(event: Event) {
    event.preventDefault();
    if (this.newComment.trim()) {
      this.comments.unshift({
        user: 'You',
        text: this.newComment,
        likes: 0,
        time: 'Just now',
        avatar: this.currentUserAvatar
      });
      this.newComment = '';
    }
  }

  cancelComment() {
    this.newComment = '';
  }

  navigateToVideo(videoId: string) {
    this.router.navigate(['/watch', videoId]);
    this.loadVideo(videoId, true);
    this.playVideo(); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }

  formatDuration(duration: string): string {
      return videoDuration(duration)
  }

  formatViewCount(views: number | 0): string {
    return viewFormat(views);
  }

  // Add these new methods
  private startWatchHistoryTracking() {
    if (!this.user) return;
    
    // Clear any existing interval
    this.stopWatchHistoryTracking();
    
    // Initial update
    this.updateWatchHistory();
    
    // Set up periodic updates
    this.watchHistorySubscription = timer(this.watchHistoryInterval * 1000, this.watchHistoryInterval * 1000)
      .subscribe(() => this.updateWatchHistory());
  }

  private stopWatchHistoryTracking() {
    if (this.watchHistorySubscription) {
      this.watchHistorySubscription.unsubscribe();
      this.watchHistorySubscription = null;
    }
  }

  private updateWatchHistory() {
    if (!this.user || !this.playerReady || !this.isPlaying) return;
    
    const progress = (this.currentTime / this.duration) * 100;
    
    const videoData = {
      youtubeVideoId: this.currentVideoId,
      title: this.currentVideo.title,
      channel: this.currentVideo.channel,
      thumbnail: `https://i.ytimg.com/vi/${this.currentVideoId}/mqdefault.jpg`,
      duration: this.currentVideo.duration,
      publishedAt: this.currentVideo.publishedAt
    };
    
    this.videoService.updateWatchHistory(this.currentVideoId, videoData).subscribe({
      error: (err) => console.error('Error updating watch history:', err)
    });
  }
}