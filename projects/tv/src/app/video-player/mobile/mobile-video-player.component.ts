import { 
  Component, 
  ElementRef, 
  OnInit, 
  ViewChild, 
  OnDestroy, 
  NgZone, 
  ChangeDetectorRef, 
  Renderer2, 
  AfterViewInit,
  HostListener,
  signal,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Subscription, Subject, fromEvent } from 'rxjs';
import { takeUntil, throttleTime, debounceTime } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger, state } from '@angular/animations';

// Import your existing services (adjust paths as needed)
import { UserInterface, UserService } from '../../common/services/user.service';
import { YoutubeService, YoutubeVideoInterface } from '../../common/services/youtube.service';
import { VideoService } from '../../common/services/videos.service';
import { PlaylistService } from '../playlist.service';
import { VideoInfoSheetComponent } from './video-info-sheet.component';
import { VideoCommentService } from '../video-comments.service';
import { CommentsBottomSheetComponent } from './video-comments/comments-bottom-sheet.component';

@Component({
  selector: 'async-mobile-video-player',
  standalone: true,
  providers: [PlaylistService, VideoCommentService],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CommonModule
  ],
  templateUrl: './mobile-video-player.component.html',
  styleUrls: ['./mobile-video-player.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)' }))
      ])
    ]),
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition('void => *', [
        style({ opacity: 0 }),
        animate(300)
      ]),
      transition('* => void', [
        animate(300, style({ opacity: 0 }))
      ])
    ]),
    trigger('scaleAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    trigger('heartBeat', [
      transition('* => liked', [
        animate('0.3s ease-in-out', style({ transform: 'scale(1.2)' })),
        animate('0.2s ease-in-out', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class MobileVideoPlayerComponent implements OnInit, OnDestroy, AfterViewInit {
  // Inject services using modern Angular approach
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private playlistService = inject(PlaylistService);
  private youtubeService = inject(YoutubeService);
  private userService = inject(UserService);
  private videoService = inject(VideoService);
  private videoCommentService = inject(VideoCommentService);
  private cdr = inject(ChangeDetectorRef);
  private bottomSheet = inject(MatBottomSheet);
  private renderer = inject(Renderer2);

  @ViewChild('videoContainer', { static: true }) videoContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('videoFrame') videoFrame!: ElementRef<HTMLIFrameElement>;

  // Reactive state using signals
  currentVideoId = signal<string>('');
  isLoading = signal(false);
  // Removed isLoadingNext signal because it's no longer needed.
  // We will now use a single isLoading signal for all loading states.
  isPlaying = signal(false);
  isMuted = signal(false);
  showControls = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  liked = signal(false);
  saved = signal(false);
  appLikes = signal(0);
  commentsCount = signal(0);
  isFollowing = signal(false);
  showFullDescription = signal(false);
  
  // Computed properties
  progressPercentage = computed(() => {
    const time = this.currentTime();
    const dur = this.duration();
    return dur > 0 ? (time / dur) * 100 : 0;
  });

  formattedCurrentTime = computed(() => this.formatTime(this.currentTime()));
  formattedDuration = computed(() => this.formatTime(this.duration()));
  formattedLikes = computed(() => this.formatViewCount(this.appLikes()));
  formattedComments = computed(() => this.formatViewCount(this.commentsCount()));

  // Traditional properties for complex objects
  safeUrl: SafeResourceUrl | null = null;
  currentVideo!: YoutubeVideoInterface;
  recommendedVideos: YoutubeVideoInterface[] = [];
  comments: Comment[] = [];
  user: UserInterface | null = null;
  
  // Player management
  player: any;
  playerReady = false;
  // Fail-safe timeout for loading
  private loadingTimeout: any; 
  
  // Touch/Swipe handling
  private touchStartY = 0;
  private touchStartX = 0;
  private touchStartTime = 0;
  private isDragging = false;
  private isVerticalSwipe = false;
  
  // Control timer
  private controlsTimeout: any;
  private progressInterval: any;
  
  // Subscription management
  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  // Preloading for smooth transitions
  private preloadedVideos = new Map<string, SafeResourceUrl>();
  private maxPreloadCount = 3;

  ngOnInit() {
    this.setupRouteSubscription();
    this.setupUserSubscription();
    this.initializeYouTubeAPI();
    this.loadRecommendedVideos();
    this.setupKeyboardControls();
  }

  ngAfterViewInit() {
    this.setupTouchGestures();
    this.setupIntersectionObserver();
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  // --- Start of Fix: Loading State Management ---

  private setupRouteSubscription() {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const videoId = params.get('id');
        if (videoId && videoId !== this.currentVideoId()) {
          this.loadVideo(videoId);
        }
      });
  }

  // The fix is applied to the loadVideo method
  loadVideo(videoId: string) {
    this.currentVideoId.set(videoId);
    
    // Use NgZone.run to ensure the signal change is within Angular's zone.
    // The setTimeout with a 0ms delay defers the state change to the next
    // change detection cycle, preventing the ExpressionChangedAfterItHasBeenCheckedError.
    this.ngZone.run(() => {
      this.isLoading.set(true);
    });

    this.playerReady = false;
    this.currentTime.set(0);
    this.duration.set(0);

    this.clearLoadingTimeout();
    this.loadingTimeout = setTimeout(() => {
      this.ngZone.run(() => {
        if (this.isLoading()) {
          this.isLoading.set(false);
          this.snackBar.open('Video took too long to load. Please try again.', '', { duration: 3000 });
        }
      });
    }, 10000); // 10 seconds timeout

    if (this.preloadedVideos.has(videoId)) {
      this.safeUrl = this.preloadedVideos.get(videoId)!;
    } else {
      const url = this.buildVideoUrl(videoId);
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    if (this.player?.loadVideoById) {
      this.player.loadVideoById({
        videoId: videoId,
        suggestedQuality: 'hd720'
      });
    } else if (this.videoFrame?.nativeElement) {
      this.createPlayer();
    }

    this.loadVideoData(videoId);
  }

  private onPlayerReady(event: any) {
    this.playerReady = true;
    this.clearLoadingTimeout();
    
    // Also use a setTimeout here to avoid the same error
    setTimeout(() => {
      this.ngZone.run(() => {
        this.isLoading.set(false);
      });
    }, 0);

    this.duration.set(this.player.getDuration());
    this.player.unMute();
    this.isMuted.set(false);
    this.startProgressTracking();
    this.playVideo();
    this.preloadNextVideos();
  }

  private onPlayerError(event: any) {
    console.error('YouTube player error:', event.data);
    this.clearLoadingTimeout(); // Clear the fail-safe timeout on error
    this.isLoading.set(false); // Turn off the loader on error
    this.snackBar.open('Video playback error. Loading next video...', '', { duration: 3000 });
    setTimeout(() => this.playNextVideo(), 2000);
  }

  private clearLoadingTimeout() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
  }

  // Navigation methods updated to use the single loading state
  playNextVideo() {
    const nextVideo = this.getNextVideo();
    if (nextVideo) {
      // You've already correctly updated this to use the single isLoading state
      this.isLoading.set(true); 
      this.router.navigate(['/watch', nextVideo.youtubeVideoId]);
    }
  }

  playPreviousVideo() {
    const prevVideo = this.getPreviousVideo();
    if (prevVideo) {
      this.isLoading.set(true); // Now uses the single loading state
      this.router.navigate(['/watch', prevVideo.youtubeVideoId]);
    }
  }

  // --- End of Fix: Loading State Management ---

  // All other methods remain the same as the previous version.
  // The rest of the component is unchanged.

  private setupUserSubscription() {
    this.userService.getCurrentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        this.updateUserSpecificStates();
      });
  }

  private setupKeyboardControls() {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        takeUntil(this.destroy$),
        throttleTime(100)
      )
      .subscribe(event => {
        if (!this.playerReady) return;
        
        switch (event.code) {
          case 'Space':
            event.preventDefault();
            this.togglePlayPause();
            break;
          case 'ArrowUp':
            event.preventDefault();
            this.playPreviousVideo();
            break;
          case 'ArrowDown':
            event.preventDefault();
            this.playNextVideo();
            break;
          case 'KeyM':
            this.toggleMute();
            break;
          case 'KeyL':
            this.handleLikeAction();
            break;
        }
      });
  }

  private setupTouchGestures() {
    const container = this.videoContainer.nativeElement;
    
    this.renderer.listen(container, 'touchstart', (e: TouchEvent) => {
      this.handleTouchStart(e);
    });

    this.renderer.listen(container, 'touchmove', (e: TouchEvent) => {
      this.handleTouchMove(e);
    });

    this.renderer.listen(container, 'touchend', (e: TouchEvent) => {
      this.handleTouchEnd(e);
    });

    // Double tap to like
    let lastTap = 0;
    this.renderer.listen(container, 'touchend', (e: TouchEvent) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 500 && tapLength > 0) {
        e.preventDefault();
        this.handleDoubleTap(e);
      }
      lastTap = currentTime;
    });
  }

  private handleTouchStart(e: TouchEvent) {
    this.touchStartY = e.touches[0].clientY;
    this.touchStartX = e.touches[0].clientX;
    this.touchStartTime = Date.now();
    this.isDragging = false;
    this.isVerticalSwipe = false;
  }

  private handleTouchMove(e: TouchEvent) {
    if (!this.isDragging) {
      const deltaY = Math.abs(e.touches[0].clientY - this.touchStartY);
      const deltaX = Math.abs(e.touches[0].clientX - this.touchStartX);
      
      if (deltaY > 10 || deltaX > 10) {
        this.isDragging = true;
        this.isVerticalSwipe = deltaY > deltaX;
      }
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - this.touchStartTime;
    
    if (!this.isDragging && touchDuration < 200) {
      // Single tap - toggle controls
      this.toggleControls();
      return;
    }

    if (this.isDragging) {
      const deltaY = e.changedTouches[0].clientY - this.touchStartY;
      const deltaX = e.changedTouches[0].clientX - this.touchStartX;
      
      if (this.isVerticalSwipe && Math.abs(deltaY) > 100) {
        if (deltaY < 0) {
          // Swipe up - next video
          this.playNextVideo();
        } else {
          // Swipe down - previous video
          this.playPreviousVideo();
        }
      } else if (!this.isVerticalSwipe && Math.abs(deltaX) > 100) {
        if (deltaX > 0) {
          // Swipe right - seek backward
          this.seekRelative(-10);
        } else {
          // Swipe left - seek forward
          this.seekRelative(10);
        }
      }
    }
  }

  private handleDoubleTap(e: TouchEvent) {
    this.handleLikeAction();
    // Show heart animation
    this.showHeartAnimation(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
  }

  private showHeartAnimation(x: number, y: number) {
    const heart = this.renderer.createElement('div');
    this.renderer.addClass(heart, 'floating-heart');
    this.renderer.setStyle(heart, 'left', `${x}px`);
    this.renderer.setStyle(heart, 'top', `${y}px`);
    heart.innerHTML = '❤️';
    
    this.renderer.appendChild(this.videoContainer.nativeElement, heart);
    
    setTimeout(() => {
      this.renderer.removeChild(this.videoContainer.nativeElement, heart);
    }, 1000);
  }

  private setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.playVideo();
          } else {
            this.pauseVideo();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(this.videoContainer.nativeElement);
  }

  private initializeYouTubeAPI() {
    if (!(window as any).YT || typeof (window as any).YT.Player === 'undefined') {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      (window as any).onYouTubeIframeAPIReady = () => {
        this.ngZone.run(() => this.onYouTubeIframeAPIReady());
      };
    } else {
      this.ngZone.run(() => this.onYouTubeIframeAPIReady());
    }
  }

  private onYouTubeIframeAPIReady() {
    if (!this.videoFrame?.nativeElement || !this.currentVideoId()) return;
    
    this.createPlayer();
  }

  private createPlayer() {
    if (this.player?.destroy) {
      this.player.destroy();
    }

    this.player = new (window as any).YT.Player(this.videoFrame.nativeElement, {
      videoId: this.currentVideoId(),
      playerVars: {
        enablejsapi: 1,
        rel: 0,
        modestbranding: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        playsinline: 1,
        origin: window.location.origin,
        autoplay: 1,
        mute: 0,
        iv_load_policy: 3,
        cc_load_policy: 0
      },
      events: {
        'onReady': (event: any) => this.ngZone.run(() => this.onPlayerReady(event)),
        'onStateChange': (event: any) => this.ngZone.run(() => this.onPlayerStateChange(event)),
        'onError': (event: any) => this.ngZone.run(() => this.onPlayerError(event))
      }
    });
  }

  private onPlayerStateChange(event: any) {
    const YT = (window as any).YT;
    
    switch (event.data) {
      case YT.PlayerState.ENDED:
        this.onVideoEnded(); // This is the method that triggers the next video.
        break;
      case YT.PlayerState.PLAYING:
        this.isPlaying.set(true);
        this.resetControlsTimer();
        break;
      case YT.PlayerState.PAUSED:
        this.isPlaying.set(false);
        this.showControls.set(true);
        break;
      case YT.PlayerState.BUFFERING:
        this.isLoading.set(true);
        break;
    }
  }

  private startProgressTracking() {
    this.progressInterval = setInterval(() => {
      if (this.playerReady && this.isPlaying()) {
        this.currentTime.set(this.player.getCurrentTime());
      }
    }, 1000);
  }

  private buildVideoUrl(videoId: string): string {
    const params = new URLSearchParams({
      enablejsapi: '1',
      rel: '0',
      modestbranding: '1',
      controls: '0',
      disablekb: '1',
      fs: '0',
      playsinline: '1',
      origin: window.location.origin,
      autoplay: '1',
      mute: '0',
      iv_load_policy: '3',
      cc_load_policy: '0'
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  private loadVideoData(videoId: string) {
    this.youtubeService.getVideoById(videoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.currentVideo = response.data;
          this.comments = this.currentVideo.comments || [];
          this.commentsCount.set(this.comments.length);
          this.updateUserSpecificStates();
        },
        error: (error) => {
          console.error('Error loading video data:', error);
          this.snackBar.open('Failed to load video data', '', { duration: 2000 });
        }
      });
  }

  private loadRecommendedVideos() {
    this.playlistService.getPlaylistVideos(1, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.recommendedVideos = response.data;
          this.preloadNextVideos();
        },
        error: (err) => {
          console.error('Error loading recommended videos:', err);
        }
      });
  }

  private preloadNextVideos() {
    if (this.recommendedVideos.length === 0) return;

    const currentIndex = this.recommendedVideos.findIndex(v => v.youtubeVideoId === this.currentVideoId());
    const nextVideos = this.recommendedVideos
      .slice(currentIndex + 1, currentIndex + 1 + this.maxPreloadCount);

    nextVideos.forEach(video => {
      if (!this.preloadedVideos.has(video.youtubeVideoId)) {
        const url = this.buildVideoUrl(video.youtubeVideoId);
        const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.preloadedVideos.set(video.youtubeVideoId, safeUrl);
      }
    });
  }

  private updateUserSpecificStates() {
    if (this.user && this.currentVideo) {
      this.liked.set(this.currentVideo.likedBy?.includes(this.user._id) || false);
      this.saved.set(this.currentVideo.savedBy?.includes(this.user._id) || false);
      this.appLikes.set(this.currentVideo.appLikes || 0);
      // Check if user is following the creator (you'll need to implement this logic)
      this.isFollowing.set(false); // Placeholder - implement based on your follow system
    }
  }

  // Player control methods
  playVideo() {
    if (this.playerReady) {
      this.player.playVideo();
      this.isPlaying.set(true);
      this.resetControlsTimer();
    }
  }

  pauseVideo() {
    if (this.playerReady) {
      this.player.pauseVideo();
      this.isPlaying.set(false);
      this.showControls.set(true);
      clearTimeout(this.controlsTimeout);
    }
  }

  togglePlayPause() {
    if (this.isPlaying()) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  toggleMute() {
    if (!this.playerReady) return;

    if (this.isMuted()) {
      this.player.unMute();
      this.isMuted.set(false);
    } else {
      this.player.mute();
      this.isMuted.set(true);
    }
    this.resetControlsTimer();
  }

  seekRelative(seconds: number) {
    if (!this.playerReady) return;
    
    const newTime = Math.max(0, Math.min(this.duration(), this.currentTime() + seconds));
    this.player.seekTo(newTime);
    this.currentTime.set(newTime);
    
    // Show seek feedback
    const direction = seconds > 0 ? 'forward' : 'backward';
    this.showSeekFeedback(Math.abs(seconds), direction);
  }

  private showSeekFeedback(seconds: number, direction: 'forward' | 'backward') {
    const feedback = this.renderer.createElement('div');
    this.renderer.addClass(feedback, 'seek-feedback');
    this.renderer.addClass(feedback, direction);
    feedback.innerHTML = `${direction === 'forward' ? '+' : '-'}${seconds}s`;
    
    this.renderer.appendChild(this.videoContainer.nativeElement, feedback);
    
    setTimeout(() => {
      this.renderer.removeChild(this.videoContainer.nativeElement, feedback);
    }, 1000);
  }

  toggleControls() {
    this.showControls.update(show => !show);
    if (this.showControls()) {
      this.resetControlsTimer();
    }
  }

  private resetControlsTimer() {
    clearTimeout(this.controlsTimeout);
    this.showControls.set(true);
    
    this.controlsTimeout = setTimeout(() => {
      this.ngZone.run(() => {
        if (this.isPlaying()) {
          this.showControls.set(false);
        }
      });
    }, 3000);
  }

  // Navigation methods
  private onVideoEnded() {
    this.playNextVideo();
  }

  private getNextVideo(): YoutubeVideoInterface | null {
    if (this.recommendedVideos.length === 0) return null;
    
    const currentIndex = this.recommendedVideos.findIndex(v => v.youtubeVideoId === this.currentVideoId());
    return currentIndex >= this.recommendedVideos.length - 1 
      ? this.recommendedVideos[0] 
      : this.recommendedVideos[currentIndex + 1];
  }

  private getPreviousVideo(): YoutubeVideoInterface | null {
    if (this.recommendedVideos.length === 0) return null;
    
    const currentIndex = this.recommendedVideos.findIndex(v => v.youtubeVideoId === this.currentVideoId());
    return currentIndex <= 0 
      ? this.recommendedVideos[this.recommendedVideos.length - 1]
      : this.recommendedVideos[currentIndex - 1];
  }

  // Action methods
  handleLikeAction() {
    if (!this.user) {
      this.snackBar.open('Please login to like videos', '', { duration: 2000 });
      return;
    }

    this.videoService.likeVideo(this.currentVideoId(), this.user._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.appLikes.set(response.appLikes);
          this.liked.set(response.liked);
        },
        error: () => {
          this.snackBar.open('Failed to like video', '', { duration: 2000 });
        }
      });
  }

  openCreatorProfile() {
    if (this.currentVideo?.channel) {
      // Navigate to creator profile or open creator info
      this.router.navigate(['/creator', this.currentVideo.channel]);
    }
  }

  toggleDescription(event: Event) {
    event.stopPropagation();
    this.showFullDescription.update(show => !show);
  }

  saveVideo() {
    if (!this.user) {
      this.snackBar.open('Please login to save videos', '', { duration: 2000 });
      return;
    }

    const videoData = {
      youtubeVideoId: this.currentVideoId(),
      title: this.currentVideo.title,
      channel: this.currentVideo.channel,
      thumbnail: `https://i.ytimg.com/vi/${this.currentVideoId()}/mqdefault.jpg`,
      duration: this.currentVideo.duration,
      publishedAt: this.currentVideo.publishedAt
    };

    if (!this.saved()) {
      this.videoService.saveVideoToLibrary(this.user._id, videoData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.saved.set(true);
            this.snackBar.open('Video saved to library', '', { duration: 2000 });
          },
          error: () => {
            this.snackBar.open('Failed to save video', '', { duration: 2000 });
          }
        });
    } else {
      this.videoService.removeVideoFromLibrary(this.user._id, this.currentVideoId())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.saved.set(false);
            this.snackBar.open('Video removed from library', '', { duration: 2000 });
          },
          error: () => {
            this.snackBar.open('Failed to remove video', '', { duration: 2000 });
          }
        });
    }
  }

  shareVideo() {
    if (navigator.share) {
      navigator.share({
        title: this.currentVideo.title,
        text: `Check out this Davido video on DavidoTV!`,
        url: window.location.href
      }).catch(() => {
        this.copyToClipboard();
      });
    } else {
      this.copyToClipboard();
    }
  }

  private copyToClipboard() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        this.snackBar.open('Link copied to clipboard!', '', { duration: 2000 });
      })
      .catch(() => {
        this.snackBar.open('Failed to copy link', '', { duration: 2000 });
      });
  }

  openComments() {
    const bottomSheetRef = this.bottomSheet.open(CommentsBottomSheetComponent, {
      data: {
        comments: this.comments,
        videoId: this.currentVideoId(),
        user: this.user
      },
      panelClass: 'comments-bottom-sheet',
      backdropClass: 'comments-backdrop'
    });

    bottomSheetRef.afterDismissed().subscribe(result => {
      if (result?.newCommentsCount) {
        this.commentsCount.set(result.newCommentsCount);
      }
    });
  }

  openVideoInfo() {
    this.bottomSheet.open(VideoInfoSheetComponent, {
      data: {
        video: this.currentVideo,
        user: this.user,
        isLiked: this.liked(),
        isSaved: this.saved(),
        appLikes: this.appLikes()
      },
      panelClass: 'video-info-sheet'
    });
  }

  // Utility methods
  formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatViewCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return count.toString();
  }

  @HostListener('window:beforeunload')
  onBeforeUnload() {
    this.pauseVideo();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.player?.destroy) {
      this.player.destroy();
    }
    
    clearTimeout(this.controlsTimeout);
    clearInterval(this.progressInterval);
    this.clearLoadingTimeout(); // Ensure the timeout is cleared on destroy
    
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Clean up preloaded videos
    this.preloadedVideos.clear();
  }
}