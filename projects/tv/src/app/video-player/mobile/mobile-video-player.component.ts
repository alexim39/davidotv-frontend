import { Component, ElementRef, OnInit, ViewChild, HostListener, OnDestroy, NgZone, ChangeDetectorRef, Renderer2, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Subscription } from 'rxjs';
import { UserInterface, UserService } from '../../common/services/user.service';
import { YoutubeService, YoutubeVideoInterface } from '../../common/services/youtube.service';
import { VideoService } from '../../common/services/videos.service';
import { PlaylistService } from '../playlist.service';
import { VideoCommentService, Comment } from '../desktop/video-comments/video-comments.service';
import { CommentsBottomSheetComponent } from '../desktop/video-comments/comments-bottom-sheet.component';
import { VideoInfoSheetComponent } from './video-info-sheet.component';
import { SwipeService } from './swipe.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'async-mobile-video-player',
  standalone: true,
  providers: [SwipeService, PlaylistService, VideoCommentService ],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CommonModule
  ],
  templateUrl: './mobile-video-player.component.html',
  styleUrls: ['./mobile-video-player.component.scss'],
})
export class MobileVideoPlayerComponent implements OnInit, OnDestroy, AfterViewInit  {
  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('videoFrame') videoFrame!: ElementRef<HTMLIFrameElement>;

  safeUrl: SafeResourceUrl | null = null;
  isLoading = false;
  showOverlay = false;
  showControls = false;
  controlsTimeout: any;

  // Video stats
  liked = false;
  disliked = false;
  saved = false;

  // Player state
  currentVideoId: string = '';
  isPlaying = false;
  player: any;
  playerReady = false;
  isMuted = false; // Default unmuted for mobile
  currentTime = 0;
  duration = 0;

  // Video data
  currentVideo!: YoutubeVideoInterface;
  appLikes = 0;
  appDislikes = 0;

  // Playlist management
  recommendedVideos: any[] = [];
  currentVideoIndex = 0;

  // Comments
  comments: Comment[] = [];
  commentsCount = 0;

  // Swipe detection
  private touchStartY = 0;
  private touchStartX = 0;
  private isSwiping = false;

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private swipeSubscription!: Subscription;
  user: UserInterface | null = null;

  private trackProgressInterval: any;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private router: Router,
    private ngZone: NgZone,
    private playlistService: PlaylistService,
    private youtubeService: YoutubeService,
    private userService: UserService,
    private videoService: VideoService,
    private videoCommentService: VideoCommentService,
    private cdr: ChangeDetectorRef,
    private bottomSheet: MatBottomSheet,
    private renderer: Renderer2,
    private swipeService: SwipeService
  ) {}

  
ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const videoId = params.get('id');
      if (videoId && videoId !== this.currentVideoId) {
        this.currentVideoId = videoId;
        this.loadVideo(videoId);
        this.getCurrentVideoData(videoId);
        // Add detectChanges() here to ensure any parent component sees the change immediately
        this.cdr.detectChanges();
      }
    });

    this.loadRecommendedVideos();

    window.onYouTubeIframeAPIReady = () => this.ngZone.run(() => this.onYouTubeIframeAPIReady());
    this.loadYouTubeAPI();

    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe(user => {
        this.user = user;
        // Also detect changes for user-related properties
        this.initializeLikeDislikeStates();
        this.cdr.detectChanges();
      })
    );

    this.setupSwipeGestures();
  }

  ngAfterViewInit() {
    this.getSwipeService();
    // Use setTimeout to defer the check to the next change detection cycle
    setTimeout(() => {
        this.cdr.detectChanges();
    }, 0);
  }


  private getSwipeService() {
    if (!this.videoContainer) {
      console.error('Video container not available for swipe service setup.');
      return;
    }
    this.swipeService.setup(this.videoContainer.nativeElement);
    
    this.swipeSubscription = this.swipeService.swipe$.subscribe(direction => {
        if (direction === 'left') {
        this.playNextRecommendedVideo();
        } else if (direction === 'right') {
        this.playPreviousVideo();
        } else if (direction === 'up') {
        // Handle up swipe (e.g., show more info)
        } else if (direction === 'down') {
        // Handle down swipe (e.g., close video)
        }
        // Force change detection after a swipe
        this.cdr.detectChanges();
    });
  }

  private setupSwipeGestures() {
    const container = this.videoContainer?.nativeElement;
    if (!container) return;

    // The event listeners themselves are fine, but the actions inside might need change detection
    this.renderer.listen(container, 'touchstart', (e: TouchEvent) => {
      this.touchStartY = e.touches[0].clientY;
      this.touchStartX = e.touches[0].clientX;
      this.isSwiping = false;
      this.cdr.detectChanges();
    });

    this.renderer.listen(container, 'touchmove', (e: TouchEvent) => {
      if (!this.isSwiping) {
        const yDiff = Math.abs(e.touches[0].clientY - this.touchStartY);
        const xDiff = Math.abs(e.touches[0].clientX - this.touchStartX);
        
        if (xDiff > yDiff && xDiff > 10) {
          this.isSwiping = true;
          this.cdr.detectChanges();
        }
      }
    });

    this.renderer.listen(container, 'touchend', (e: TouchEvent) => {
      if (!this.isSwiping) {
        this.toggleControls();
        this.cdr.detectChanges(); // Ensure controls toggle is detected
        return;
      }

      const endX = e.changedTouches[0].clientX;
      const diffX = endX - this.touchStartX;

      if (Math.abs(diffX) > 50) { // Minimum swipe distance
        if (diffX > 0) {
          // Swiped right - previous video
          this.playPreviousVideo();
        } else {
          // Swiped left - next video
          this.playNextRecommendedVideo();
        }
      }
      this.cdr.detectChanges(); // Important to detect changes after a swipe action
    });
  }

  loadYouTubeAPI() {
    if (!(window as any).YT || typeof (window as any).YT.Player === 'undefined') {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else {
      this.ngZone.run(() => this.onYouTubeIframeAPIReady());
    }
  }

  onYouTubeIframeAPIReady() {
    if (!this.videoFrame || !this.videoFrame.nativeElement) {
      setTimeout(() => this.onYouTubeIframeAPIReady(), 100);
      return;
    }

    if (!this.player || typeof this.player.getPlayerState !== 'function') {
      if (this.player && typeof this.player.destroy === 'function') {
        this.player.destroy();
      }

      this.player = new (window as any).YT.Player(this.videoFrame.nativeElement, {
        videoId: this.currentVideoId,
        playerVars: {
          enablejsapi: 1,
          rel: 0,
          modestbranding: 1,
          controls: 0,
          disablekb: 1,
          fs: 0, // Disable fullscreen button
          playsinline: 1, // Play inline on iOS
          origin: window.location.origin,
          autoplay: 1, // Autoplay by default
          mute: 1 // Start muted
        },
        events: {
          'onReady': (event: any) => this.ngZone.run(() => this.onPlayerReady(event)),
          'onStateChange': (event: any) => this.ngZone.run(() => this.onPlayerStateChange(event))
        }
      });
    } else {
      this.player.loadVideoById(this.currentVideoId);
    }
  }
    
  onPlayerReady(event: any) {
    this.playerReady = true;
    this.isLoading = false;
    this.duration = this.player.getDuration();
    this.currentTime = this.player.getCurrentTime();
    
    this.cdr.detectChanges();

    this.player.mute();
    this.isMuted = true;

    this.playVideo();
  }

  onPlayerStateChange(event: any) {
    const YT = (window as any).YT;
    switch (event.data) {
      case YT.PlayerState.ENDED:
        this.handleVideoEnded();
        break;
      case YT.PlayerState.PLAYING:
        this.isPlaying = true;
        this.showOverlay = false;
        this.resetControlsTimer();
        break;
      case YT.PlayerState.PAUSED:
        this.isPlaying = false;
        // Do not call detectChanges here, it's already in a zone.run()
        break;
    }
    this.cdr.detectChanges();
  }


  loadVideo(videoId: string) {
    this.currentVideoId = videoId;
    this.isLoading = true;
    this.showOverlay = true;
    this.isPlaying = false;
    this.playerReady = false;
    this.duration = 0;
    this.currentTime = 0;

    const url = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&controls=0&disablekb=1&fs=0&playsinline=1&origin=${window.location.origin}`;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    if (this.player && typeof this.player.loadVideoById === 'function') {
      this.player.loadVideoById({
        videoId: videoId,
        suggestedQuality: 'default'
      });
    }

    this.getCurrentVideoData(videoId);
    this.cdr.detectChanges();
  }

  getCurrentVideoData(videoId: string) {
    this.subscriptions.push(
      this.youtubeService.getVideoById(videoId).subscribe({
        next: (response: any) => {
          this.currentVideo = response.data;
          this.comments = this.currentVideo.comments || [];
          this.commentsCount = this.comments.length;
          this.initializeLikeDislikeStates();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading video data:', error);
          this.cdr.detectChanges();
        }
      })
    );
  }

  loadRecommendedVideos() {
    this.subscriptions.push(
      this.playlistService.getPlaylistVideos(1, 10).subscribe({
        next: (response) => {
          this.recommendedVideos = response.data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading recommended videos:', err);
          this.cdr.detectChanges();
        }
      })
    );
  }

  playVideo() {
    if (this.playerReady) {
      this.player.playVideo();
      this.isPlaying = true;
      this.showOverlay = false;
      this.resetControlsTimer();
    }
    this.cdr.detectChanges();
  }

  pauseVideo() {
    if (this.playerReady) {
      this.player.pauseVideo();
    }
    this.isPlaying = false;
    this.showControls = true;
    clearTimeout(this.controlsTimeout);
    this.cdr.detectChanges();
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  toggleControls() {
    this.showControls = !this.showControls;
    if (this.showControls) {
      this.resetControlsTimer();
    }
    this.cdr.detectChanges();
  }

  resetControlsTimer() {
    clearTimeout(this.controlsTimeout);
    this.showControls = true;
    this.controlsTimeout = setTimeout(() => {
      this.ngZone.run(() => {
        if (this.isPlaying) {
          this.showControls = false;
        }
        this.cdr.detectChanges();
      });
    }, 3000);
  }

  handleVideoEnded() {
    this.playNextRecommendedVideo();
  }

  playNextRecommendedVideo() {
    if (this.recommendedVideos.length === 0) return;

    const currentIndex = this.recommendedVideos.findIndex(v => v.youtubeVideoId === this.currentVideoId);
    let nextVideo;

    if (currentIndex === -1 || currentIndex >= this.recommendedVideos.length - 1) {
      nextVideo = this.recommendedVideos[0];
    } else {
      nextVideo = this.recommendedVideos[currentIndex + 1];
    }

    if (nextVideo) {
      this.router.navigate(['/watch', nextVideo.youtubeVideoId]);
    }
  }

  playPreviousVideo() {
    if (this.recommendedVideos.length === 0) return;

    const currentIndex = this.recommendedVideos.findIndex(v => v.youtubeVideoId === this.currentVideoId);
    let prevVideo;

    if (currentIndex <= 0) {
      prevVideo = this.recommendedVideos[this.recommendedVideos.length - 1];
    } else {
      prevVideo = this.recommendedVideos[currentIndex - 1];
    }

    if (prevVideo) {
      this.router.navigate(['/watch', prevVideo.youtubeVideoId]);
    }
  }

  likeVideo() {
    if (!this.user) {
      this.snackBar.open('Please login to like videos', '', { duration: 2000 });
      return;
    }

    this.subscriptions.push(
      this.videoService.likeVideo(this.currentVideoId, this.user._id).subscribe({
        next: (response) => {
          this.appLikes = response.appLikes;
          this.appDislikes = response.appDislikes;
          this.liked = response.liked;
          this.disliked = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.snackBar.open('Failed to like video', '', { duration: 2000 });
          this.cdr.detectChanges();
        }
      })
    );
  }

  dislikeVideo() {
    if (!this.user) {
      this.snackBar.open('Please login to dislike videos', '', { duration: 2000 });
      return;
    }

    this.subscriptions.push(
      this.videoService.dislikeVideo(this.currentVideoId, this.user._id).subscribe({
        next: (response) => {
          this.appLikes = response.appLikes;
          this.appDislikes = response.appDislikes;
          this.disliked = response.disliked;
          this.liked = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.snackBar.open('Failed to dislike video', '', { duration: 2000 });
          this.cdr.detectChanges();
        }
      })
    );
  }

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

      this.subscriptions.push(
        this.videoService.saveVideoToLibrary(this.user._id, videoData).subscribe({
          next: () => {
            this.snackBar.open('Video saved to library', '', { duration: 2000 });
          },
          error: (error) => {
            this.saved = false;
            this.snackBar.open('Failed to save video', '', { duration: 2000 });
          }
        })
      );
    } else {
      this.videoService.removeVideoFromLibrary(this.user._id, this.currentVideoId).subscribe({
        next: () => {
          this.snackBar.open('Video removed from library', '', { duration: 2000 });
        },
        error: (error) => {
          this.saved = true;
          this.snackBar.open('Failed to remove video', '', { duration: 2000 });
        }
      });
    }
  }

  shareVideo() {
    if (navigator.share) {
      navigator.share({
        title: this.currentVideo.title,
        text: 'Check out this Davido video!',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.snackBar.open('Link copied to clipboard!', '', { duration: 2000 });
    }
  }

  openComments() {
    this.bottomSheet.open(CommentsBottomSheetComponent, {
      data: {
        comments: this.comments,
        videoId: this.currentVideoId,
        user: this.user
      },
      panelClass: 'comments-bottom-sheet'
    });
  }

  openVideoInfo() {
    this.bottomSheet.open(VideoInfoSheetComponent, {
      data: {
        video: this.currentVideo,
        user: this.user,
        isLiked: this.liked,
        isDisliked: this.disliked,
        isSaved: this.saved,
        appLikes: this.appLikes,
        appDislikes: this.appDislikes
      }
    }).afterDismissed().subscribe(result => {
      if (result) {
        if (result.action === 'like') {
          this.likeVideo();
        } else if (result.action === 'dislike') {
          this.dislikeVideo();
        } else if (result.action === 'save') {
          this.saveVideo();
        } else if (result.action === 'share') {
          this.shareVideo();
        }
      }
    });
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  formatViewCount(views: number): string {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  }

  private initializeLikeDislikeStates() {
    if (this.user && this.currentVideo) {
      this.liked = this.currentVideo.likedBy?.includes(this.user._id) || false;
      this.disliked = this.currentVideo.dislikedBy?.includes(this.user._id) || false;
      this.appLikes = this.currentVideo.appLikes || 0;
      this.appDislikes = this.currentVideo.appDislikes || 0;
    }
  }

  ngOnDestroy() {
    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy();
    }
    clearTimeout(this.controlsTimeout);
    if (window.onYouTubeIframeAPIReady === this.onYouTubeIframeAPIReady) {
      (window as any).onYouTubeIframeAPIReady = undefined;
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());

    this.swipeService.cleanup(this.videoContainer.nativeElement);
    this.swipeSubscription?.unsubscribe();

    
    if (this.trackProgressInterval) {
        clearInterval(this.trackProgressInterval);
      }

  }
}