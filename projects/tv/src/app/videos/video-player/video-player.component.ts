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
import { YoutubeService } from '../../common/services/youtube.service';

// Declare YT for TypeScript to recognize the global YouTube API object
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any; // YouTube API type
  }
}

@Component({
  selector: 'async-video-player',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSliderModule,
    MatSlideToggleModule
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
            <button mat-button class="subscribe-btn">
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
            <div class="video-meta">
              <div class="video-stats">
                <span class="views">{{ views | number }} views</span>
                <span class="upload-date">Premiered {{ uploadDate | date }}</span>
              </div>
              <div class="video-actions">
                <button mat-button (click)="likeVideo()" [class.active]="liked" aria-label="Like video">
                  <mat-icon>{{ liked ? 'thumb_up' : 'thumb_up_off_alt' }}</mat-icon>
                  {{ likes | number }}
                </button>
                <button mat-button (click)="dislikeVideo()" [class.active]="disliked" aria-label="Dislike video">
                  <mat-icon>{{ disliked ? 'thumb_down' : 'thumb_down_off_alt' }}</mat-icon>
                  {{ dislikes | number }}
                </button>
                <button mat-button (click)="shareVideo()" aria-label="Share video">
                  <mat-icon>share</mat-icon>
                  Share
                </button>
                <button mat-button (click)="saveVideo()" [class.active]="saved" aria-label="Save video">
                  <mat-icon>{{ saved ? 'bookmark' : 'bookmark_border' }}</mat-icon>
                  Save
                </button>
                <button mat-button (click)="toggleRepeatMode()" [class.active]="repeatMode !== 'none'" aria-label="Repeat">
                  <mat-icon>
                    {{ repeatMode === 'one' ? 'repeat_one' : repeatMode === 'all' ? 'repeat' : 'repeat' }}
                  </mat-icon>
                  Repeat {{ repeatMode !== 'none' ? '(' + repeatMode + ')' : '' }}
                </button>
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

          <div class="comments-section" *ngIf="!isLoading">
            <div class="comments-header">
              <h3>{{ comments.length }} Comments</h3>
              <div class="sort-comments">
                <mat-icon>sort</mat-icon>
                <span>Sort by</span>
              </div>
            </div>

            <div class="add-comment">
              <img [src]="currentUserAvatar" alt="Your profile" class="user-avatar">
              <div class="comment-form">
                <form (submit)="addComment($event)">
                  <input 
                    type="text" 
                    [(ngModel)]="newComment" 
                    name="comment" 
                    placeholder="Add a public comment..."
                    aria-label="Add a comment"
                    required
                  >
                  <div class="comment-actions" *ngIf="newComment">
                    <button mat-button type="button" (click)="cancelComment()">CANCEL</button>
                    <button mat-raised-button color="primary" type="submit" [disabled]="!newComment.trim()">COMMENT</button>
                  </div>
                </form>
              </div>
            </div>

            <div class="comments-list">
              <div class="comment" *ngFor="let comment of comments">
                <img [src]="comment.avatar" alt="{{ comment.user }}" class="comment-avatar">
                <div class="comment-content">
                  <div class="comment-header">
                    <h4>{{ comment.user }}</h4>
                    <span class="comment-time">{{ comment.time }}</span>
                  </div>
                  <p class="comment-text">{{ comment.text }}</p>
                  <div class="comment-actions">
                    <button mat-icon-button>
                      <mat-icon>thumb_up_off_alt</mat-icon>
                    </button>
                    <span class="likes-count">{{ comment.likes }}</span>
                    <button mat-icon-button>
                      <mat-icon>thumb_down_off_alt</mat-icon>
                    </button>
                    <button mat-button>REPLY</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside class="recommendations-sidebar" *ngIf="!isLoading">
          <div class="sidebar-header">
            <h3>Up Next</h3>
            <div class="autoplay-toggle">
              <span>Autoplay</span>
              <mat-slide-toggle [(ngModel)]="autoplay"></mat-slide-toggle>
            </div>
          </div>
          <div class="recommendation-list">
            <div class="recommendation-item" *ngFor="let video of recommendedVideos" (click)="navigateToVideo(video.id)">
              <div class="thumbnail-container">
                <img [src]="video.thumbnail" alt="{{ video.title }}" class="thumbnail">
                <span class="duration">{{ video.duration }}</span>
              </div>
              <div class="video-details">
                <h4>{{ video.title }}</h4>
                <p class="creator">Davido</p>
                <p class="views">{{ video.views }} views • {{ video.date }}</p>
              </div>
            </div>
          </div>
        </aside>
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
  views = 12547893;
  uploadDate = new Date('2023-05-15');
  likes = 542310;
  liked = false;
  dislikes = 3245;
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
  //davidoVideos: any = [];
  davidoVideos = [
    { id: 'NnWe5Lhi0G8', title: 'Davido - Fall', duration: '4:25', thumbnail: 'https://i.ytimg.com/vi/NnWe5Lhi0G8/mqdefault.jpg', views: '245M views', date: '5 years ago' },
    { id: 'helEv0kGHd4', title: 'Davido - IF', duration: '3:32', thumbnail: 'https://i.ytimg.com/vi/helEv0kGHd4/mqdefault.jpg', views: '187M views', date: '4 years ago' },
    { id: 'l6QMJniQWxQ', title: 'Davido - Assurance', duration: '4:12', thumbnail: 'https://i.ytimg.com/vi/l6QMJniQWxQ/mqdefault.jpg', views: '98M views', date: '3 years ago' }
  ];
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


  constructor(
    private route: ActivatedRoute, 
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private router: Router,
    private ngZone: NgZone, // Inject NgZone
    private youtubeService: PlaylistService
  ) {}

  ngOnInit() {
    const videoId = this.route.snapshot.paramMap.get('id');
    if (videoId) {
      this.currentVideoId = videoId;
      this.currentVideoIndex = this.davidoVideos.findIndex((v: any) => v.id === videoId);
      this.loadVideo(videoId);
    }

      
  this.youtubeService.getDavidoVideos().subscribe(videos => {
    this.davidoVideos = videos;
    this.recommendedVideos = videos;

    /* const videoId = this.route.snapshot.paramMap.get('id') || videos[0]?.id;
    if (videoId) {
      this.currentVideoId = videoId;
      this.currentVideoIndex = this.davidoVideos.findIndex((v: any) => v.id === videoId);
      this.loadVideo(videoId);
    } */
  });


    // Assign onYouTubeIframeAPIReady to a global function and ensure it runs in Angular's zone
    window.onYouTubeIframeAPIReady = () => this.ngZone.run(() => this.onYouTubeIframeAPIReady());
    this.loadYouTubeAPI();

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
    // Only create a new player if it doesn't exist or if it's been destroyed
    // Checking `getPlayerState` is a way to see if it's a valid player object
    if (!this.player || typeof this.player.getPlayerState !== 'function') {
      // Destroy existing player if it somehow persisted but is not functional
      if (this.player && typeof this.player.destroy === 'function') {
        this.player.destroy();
      }

      this.player = new window.YT.Player(this.videoFrame.nativeElement, {
        videoId: this.currentVideoId,
        playerVars: {
          enablejsapi: 1,
          rel: 0,
          modestbranding: 1,
          controls: 0, // Custom controls handled by app
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
      // If player already exists and is functional, just load the new video
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

      this.duration = this.player.getDuration();
      this.startUpdateLoop();

      if (this.pendingAutoPlay) {
        this.playVideo();
        this.pendingAutoPlay = false;
      }
      
      // Get initial duration
      this.player.getDuration().then((duration: number) => {
        this.duration = duration;
      }).catch(() => {
        // If we can't get duration immediately, it will be polled later
        this.duration = 0;
      });

      // Get initial current time
      this.player.getCurrentTime().then((time: number) => {
        this.currentTime = time;
      }).catch(() => {
        this.currentTime = 0;
      });

      this.startPlayerStatePolling();
      
      if (this.autoplay) {
        this.playVideo();
      }
    });
  }

  onPlayerStateChange(event: any) {
    // Ensure all state updates happen within Angular's zone
    this.ngZone.run(() => {
      const state = event.data; // YouTube player states: -1, 0, 1, 2, 3, 5
      
      if (state === window.YT.PlayerState.PLAYING) {
        this.isPlaying = true;
        this.showOverlay = false;
        // If duration wasn't correctly fetched onReady, try again when video starts playing
        if (this.duration === 0 || isNaN(this.duration)) {
          this.getDuration(); 
        }
      } else if (state === window.YT.PlayerState.PAUSED || state === window.YT.PlayerState.ENDED) {
        this.isPlaying = false;
      }
      
      if (state === window.YT.PlayerState.ENDED) { // Video ended
        this.handleVideoEnded();
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
          // Get current time
          this.player.getCurrentTime().then((time: number) => {
            this.ngZone.run(() => {
              this.currentTime = time;
            });
          }).catch(() => {});

          // Refresh duration periodically (in case it wasn't available initially)
          if (this.duration <= 0 || isNaN(this.duration)) {
            this.player.getDuration().then((duration: number) => {
              this.ngZone.run(() => {
                this.duration = duration;
              });
            }).catch(() => {});
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
  } 


  updateVideoInfo(videoId: string) {
    const video = this.davidoVideos.find((v: any) => v.id === videoId);
    if (video) {
      this.videoTitle = video.title;
      this.uploadDate = new Date();
      this.uploadDate.setFullYear(this.uploadDate.getFullYear() - Math.floor(Math.random() * 5));
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
      this.router.navigate(['/watch', nextVideo.id]);
      this.loadVideo(nextVideo.id, true);
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
      this.router.navigate(['/watch', prevVideo.id]);
      this.loadVideo(prevVideo.id, true);
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
      this.likes++;
      if (this.disliked) {
        this.disliked = false;
        this.dislikes--;
      }
    } else {
      this.liked = false;
      this.likes--;
    }
  }

  dislikeVideo() {
    if (!this.disliked) {
      this.disliked = true;
      this.dislikes++;
      if (this.liked) {
        this.liked = false;
        this.likes--;
      }
    } else {
      this.disliked = false;
      this.dislikes--;
    }
  }

  saveVideo() {
    this.saved = !this.saved;
    this.snackBar.open(this.saved ? 'Video saved!' : 'Video removed from saved.', '', { duration: 2000 });
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
    this.loadVideo(videoId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}