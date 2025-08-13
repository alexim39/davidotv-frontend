import { Component, ElementRef, OnInit, ViewChild, HostListener, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule, ViewportScroller } from '@angular/common'; // Import ViewportScroller
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PlaylistService } from '../playlist.service';
import { YoutubeService, YoutubeVideoInterface } from '../../common/services/youtube.service';
import { timeAgo as timeAgoUtil, formatDuration as videoDuration, formatViewCount as viewFormat, formatLikeCount as likeFormat, formatDislikesCount as dislikesFormat } from '../../common/utils/time.util';
import { Subscription, timer } from 'rxjs';
import { UserInterface, UserService } from '../../common/services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { VideoService } from '../../common/services/videos.service';
import { VideoCommentsComponent } from './video-comments/video-comments.component';
import { RecommendationsSidebarComponent } from './recommendations-sidebar/recommendations-sidebar.component';
import { VideoCommentService, Comment } from '../video-comments.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommentsBottomSheetComponent } from '../mobile/video-comments/comments-bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

@Component({
  selector: 'async-video-player',
  providers: [PlaylistService, VideoCommentService],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    VideoCommentsComponent,
    RecommendationsSidebarComponent,
  ],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  safeUrl: SafeResourceUrl | null = null;
  isLoading = false;
  showOverlay = true;
  showControls = true;
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
  isMuted = false;
  isFullscreen = false;
  currentTime = 0;
  duration = 0;

  // Playlist management
  davidoVideos: any[] = [];
  currentVideoIndex = 0;

  // Repeat mode
  repeatMode: 'none' | 'one' = 'none';

  comments: Comment[] = [];

  @ViewChild('videoFrame') videoFrame!: ElementRef<HTMLIFrameElement>;

  private playerStateInterval: any;
  private updateInterval: any = null;
  currentVideo!: YoutubeVideoInterface;
  appLikes = 0;
  appDislikes = 0;

  subscriptions: Subscription[] = [];
  user: UserInterface | null = null;

  // Watch history tracking
  private watchHistoryInterval = 10;
  private watchHistorySubscription: Subscription | null = null;

  // Sidebar videos
  recommendedVideos: any[] = [];
  currentPage = 1;
  pageSize = 10;
  hasMoreVideos = true;
  isLoadingMore = false;

  private routeParamSub!: Subscription;

  // Add to the component class
  isMobile = false;
  breakpointMobile = 768; // Match your $breakpoint-mobile SCSS variable

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
    private viewportScroller: ViewportScroller,
    private breakpointObserver: BreakpointObserver,
    private bottomSheet: MatBottomSheet,
  ) {}

  ngOnInit() {

    this.routeParamSub = this.route.paramMap.subscribe(params => {
      const videoId = params.get('id');
      if (videoId && videoId !== this.currentVideoId) {
        this.currentVideoId = videoId;
        this.currentVideoIndex = this.davidoVideos.findIndex((v: any) => v.id === videoId);
        this.loadVideo(videoId);
        this.getCurrentVideoData(videoId);
      }
    });

    this.loadSideBarVideos();

    window.onYouTubeIframeAPIReady = () => this.ngZone.run(() => this.onYouTubeIframeAPIReady());
    this.loadYouTubeAPI();

    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
        }
      })
    );

    // check for mobile
    this.checkMobileView()
    //this.scrollToTop();
  }

  private checkMobileView() {
    this.isMobile = window.innerWidth <= this.breakpointMobile;
    this.cdr.detectChanges();
    
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= this.breakpointMobile;
      this.cdr.detectChanges();
    });

    //console.log('mobile status ',this.isMobile)
  }

  skipForward(seconds: number = 10) {
    if (this.playerReady) {
      const newTime = Math.min(this.currentTime + seconds, this.duration);
      this.currentTime = newTime;
      this.player.seekTo(newTime, true);
      this.resetControlsTimer();
    }
  }

  skipBackward(seconds: number = 10) {
    if (this.playerReady) {
      const newTime = Math.max(this.currentTime - seconds, 0);
      this.currentTime = newTime;
      this.player.seekTo(newTime, true);
      this.resetControlsTimer();
    }
  }

  loadSideBarVideos() {
    if (this.isLoadingMore || !this.hasMoreVideos) return;

    this.isLoadingMore = true;
    this.subscriptions.push(
      this.playlistService.getPlaylistVideos(this.currentPage, this.pageSize)
        .subscribe({
        next: (response) => {
          this.recommendedVideos = [...this.recommendedVideos, ...response.data];
          this.hasMoreVideos = response.pagination.hasNextPage;
          this.currentPage++;
          this.isLoadingMore = false;
        },
        error: (err) => {
          console.error('Error:', err);
          this.isLoadingMore = false;
        }
      })
    )
  }

  private getCurrentVideoData(videoId: string) {
    this.subscriptions.push(
      this.youtubeService.getVideoById(videoId).subscribe({
        next: (response: any) => {
          this.currentVideo = response.data;
          this.comments = this.currentVideo.comments;
          this.initializeLikeDislikeStates();
        }
      })
    )
  }

  ngOnDestroy() {
    if (this.playerStateInterval) {
      clearInterval(this.playerStateInterval);
    }
    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy();
    }
    clearTimeout(this.controlsTimeout);
    if (window.onYouTubeIframeAPIReady === this.onYouTubeIframeAPIReady) {
      (window as any).onYouTubeIframeAPIReady = undefined;
    }
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.stopWatchHistoryTracking();

    if (this.routeParamSub) this.routeParamSub.unsubscribe();
  }

  loadYouTubeAPI() {
    if (!(window as any).YT || typeof (window as any).YT.Player === 'undefined') {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api'; // Correct YouTube Iframe API URL
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
        },
        events: {
          'onReady': this.onPlayerReady.bind(this),
          'onStateChange': this.onPlayerStateChange.bind(this)
        }
      });
      this.cdr.detectChanges(); // Force update after player initialization
    } else {
      this.player.loadVideoById(this.currentVideoId);
      if (this.user?.preferences?.autoplay) {
        this.player.playVideo();
        this.cdr.detectChanges(); // Force update after player initialization
      }
    }
  }

  onPlayerReady(event: any) {
    this.ngZone.run(() => {
      this.playerReady = true;
      this.isLoading = false;

      // Use a setTimeout to defer the value updates to the next change detection cycle.
      setTimeout(() => {
        const duration = this.player.getDuration();
        this.duration = isNaN(duration) ? 0 : duration;
        this.currentTime = isNaN(this.player.getCurrentTime()) ? 0 : this.player.getCurrentTime();
        this.cdr.detectChanges(); // Manually trigger change detection after the update
      }, 0);

      this.startUpdateLoop();
      this.startPlayerStatePolling();

      if (this.user?.preferences?.autoplay && !this.isPlaying) {
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
        this.cdr.detectChanges();
        this.startWatchHistoryTracking();

        // Check if duration is already set, if not, get it.
        // Call getDuration directly without .then()
        if (this.duration === 0 || isNaN(this.duration)) {
          const duration = this.player.getDuration();
          if (!isNaN(duration) && duration > 0) {
            this.duration = duration;
          }
        }
      } else if (state === window.YT.PlayerState.PAUSED) {
        this.isPlaying = false;
        this.cdr.detectChanges();
        this.stopWatchHistoryTracking();
      } else if (state === window.YT.PlayerState.ENDED) {
        this.handleVideoEnded();
      } else if (state === window.YT.PlayerState.CUED) {
        if (this.user?.preferences?.autoplay) {
          setTimeout(() => {
            this.player.playVideo();
          }, 500);
        }
      }

      this.resetControlsTimer();
      this.cdr.detectChanges();
    });
  }

  startPlayerStatePolling() {
    if (this.playerStateInterval) {
      clearInterval(this.playerStateInterval);
    }

    this.playerStateInterval = setInterval(() => {
      if (this.playerReady && this.player) {
        try {
          const time = this.player.getCurrentTime();
          if (!isNaN(time)) {
            this.ngZone.run(() => {
              this.currentTime = time;
            });
          }

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
    }, 1000);
  }
 
  loadVideo(videoId: string) {
    this.currentVideoId = videoId;
    this.isLoading = true;
    this.cdr.detectChanges();

    const url = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&controls=0&disablekb=1&fs=1&iv_load_policy=3&origin=${window.location.origin}`;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    this.showOverlay = true;
    this.isPlaying = false;
    this.isLoading = true;
    this.duration = 0;
    this.currentTime = 0;
    this.playerReady = false;

    if (this.player && typeof this.player.loadVideoById === 'function') {
      this.player.loadVideoById({
        videoId: videoId,
        suggestedQuality: 'default'
      });

      // Always try to play after loading
      setTimeout(() => {
        if (this.player && typeof this.player.playVideo === 'function') {
          this.player.playVideo();
        }
      }, 500);
    } else {
      // If player is not ready yet, poll until ready and then play
      const tryPlay = () => {
        if (this.playerReady && this.player && typeof this.player.playVideo === 'function') {
          this.player.playVideo();
        } else {
          setTimeout(tryPlay, 300);
        }
      };
      tryPlay();
    }

    this.currentVideoIndex = this.davidoVideos.findIndex((v: any) => v.id === videoId);
    this.getCurrentVideoData(videoId);
  }


  private startUpdateLoop() {
    this.stopUpdateLoop();
    this.updateInterval = setInterval(() => {
      if (this.playerReady && this.player && typeof this.player.getCurrentTime === 'function') {
        const time = this.player.getCurrentTime();
        if (!isNaN(time)) {
          setTimeout(() => {
            this.currentTime = time;
            this.cdr.detectChanges();
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

  playVideo() {
    if (this.playerReady) {
      this.ngZone.run(() => {
        this.player.playVideo();
        this.isPlaying = true;
        this.showOverlay = false;
        this.cdr.detectChanges();
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
    this.cdr.detectChanges();
    clearTimeout(this.controlsTimeout);
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
    this.cdr.detectChanges(); // Add this line
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
    this.cdr.detectChanges();
    this.resetControlsTimer();
  }

  /* getDuration() {
    if (this.playerReady && this.player) {
      this.player.getDuration().then((duration: number) => {
        this.ngZone.run(() => {
          if (!isNaN(duration) && duration > 0) {
            this.duration = duration;
          } else {
            setTimeout(() => this.getDuration(), 1000);
          }
        });
      }).catch((error: any) => {
        console.error('Error getting duration:', error);
        setTimeout(() => this.getDuration(), 1000);
      });
    }
  } */

  getDuration() {
    if (this.playerReady && this.player) {
      const duration = this.player.getDuration();
      this.ngZone.run(() => {
        if (!isNaN(duration) && duration > 0) {
          this.duration = duration;
        } else {
          // If the duration is not yet available, try again after a delay
          setTimeout(() => this.getDuration(), 1000);
        }
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
    if (this.repeatMode === 'one') {
      this.currentTime = 0;
      this.player.seekTo(0, true);
      this.playVideo();
    } else if (this.user?.preferences?.autoplay) {
      //console.log('video has ended, playing next...')
      this.playNextRecommendedVideo();
    } else {
      this.isPlaying = false;
      this.showOverlay = true;
      this.showControls = true;
      this.cdr.detectChanges();
    }
  }

  playNextVideo(loop: boolean = false) {
    if (this.davidoVideos.length > 0) {
      let nextIndex = this.currentVideoIndex + 1;
      if (nextIndex >= this.davidoVideos.length) {
        if (loop) {
          nextIndex = 0;
        } else {
          this.isPlaying = false;
          this.showOverlay = true;
          this.showControls = true;
          return;
        }
      }
      const nextVideo = this.davidoVideos[nextIndex];
      this.currentVideoIndex = nextIndex;
      this.router.navigate(['/watch', nextVideo.youtubeVideoId]);
      this.loadVideo(nextVideo.youtubeVideoId);
      this.playVideo();
    }
  }

  playPreviousVideo() {
    if (this.davidoVideos.length > 0) {
      let prevIndex = this.currentVideoIndex - 1;
      if (prevIndex < 0) {
        prevIndex = this.davidoVideos.length - 1;
      }
      const prevVideo = this.davidoVideos[prevIndex];
      this.currentVideoIndex = prevIndex;
      this.router.navigate(['/watch', prevVideo.youtubeVideoId]);
      this.loadVideo(prevVideo.youtubeVideoId);
      this.playVideo();
    }
  }

  toggleRepeatMode() {
    if (this.repeatMode === 'none') {
      this.repeatMode = 'one';
      this.snackBar.open('Repeat On', '', { duration: 1000 });
    } else {
      this.repeatMode = 'none';
      this.snackBar.open('Repeat Off', '', { duration: 1000 });
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
          this.ngZone.run(() => {
            this.appLikes = response.appLikes;
            this.appDislikes = response.appDislikes;

            this.cdr.detectChanges();

            if (response.liked) {
              this.snackBar.open('Video liked', '', { duration: 1000 });
            } else {
              this.snackBar.open('Like removed', '', { duration: 1000 });
            }
          });
        },
        error: (error) => {
          this.snackBar.open('Failed to like video', '', { duration: 2000 });
        }
      })
    )
  }

  dislikeVideo() {
    if (!this.user) {
      this.snackBar.open('Please login to dislike videos', '', { duration: 2000 });
      return;
    }

    this.subscriptions.push(
      this.videoService.dislikeVideo(this.currentVideoId, this.user._id).subscribe({
        next: (response) => {
          this.ngZone.run(() => {
            this.appLikes = response.appLikes;
            this.appDislikes = response.appDislikes;

            if (response.disliked) {
              this.snackBar.open('Video disliked', '', { duration: 1000 });
            } else {
              this.snackBar.open('Dislike removed', '', { duration: 1000 });
            }
          });
        },
        error: (error) => {
          this.snackBar.open('Failed to dislike video', '', { duration: 2000 });
        }
      })
    )
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
          next: (response: any) => {
            this.snackBar.open(response.message, '', { duration: 2000 });
          },
          error: (error: HttpErrorResponse) => {
            this.saved = false;
            let errorMessage = 'Server error occurred, please try again.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
            this.snackBar.open(errorMessage, 'Ok',{duration: 2000});
          }
        })
      )
    } else {
      this.videoService.removeVideoFromLibrary(this.user._id, this.currentVideoId).subscribe({
        next: () => {
          this.snackBar.open('Video removed from library', '', { duration: 2000 });
        },
        error: (error: HttpErrorResponse) => {
          this.saved = true;
          this.snackBar.open('Failed to remove video', '', { duration: 2000 });
        }
      });
    }
  }

  shareVideo() {
    if (navigator.share) {
      navigator.share({
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.snackBar.open('Link copied to clipboard!', '', { duration: 2000 });
    }
  }

  onCommentAdded(commentData: {text: string}) {
    if (!this.user) return;

    const tempComment: Comment = {
      _id: 'temp_' + Date.now(),
      videoId: this.currentVideoId,
      userId: this.user._id,
      avatar: this.user.avatar || 'img/avatar.png',
      name: `${this.user.name}`,
      text: commentData.text,
      likes: 0,
      createdAt: new Date()
    };

    this.subscriptions.push(
      this.videoCommentService.addComment(
        this.currentVideoId,
        this.user._id,
        commentData.text
      ).subscribe({
        next: (response) => {
          this.comments = [tempComment, ...this.comments];
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.comments = this.comments.filter(c => c._id !== tempComment._id);

          let errorMessage = 'Server error occurred, please try again.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Ok',{duration: 3000});

          this.cdr.detectChanges();
        }
      })
    )
  }

  onCommentLiked(commentId: string) {
    if (!this.user) {
      this.snackBar.open('Please login to like comments', 'Close', { duration: 2000 });
      return;
    }

    this.subscriptions.push(
      this.videoCommentService.likeComment(
        this.currentVideoId,
        commentId,
        this.user._id
      ).subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Ok',{duration: 3000});
        },
        error: (error: HttpErrorResponse) => {
          let errorMessage = 'Server error occurred, please try again.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
          this.cdr.markForCheck();
        }
      })
    )
  }

  onReplyAdded(replyData: {parentId: string, text: string}) {
    if (!this.user) {
      this.snackBar.open('Please log in to post a reply.', 'Close', { duration: 3000 });
      return;
    }

    const parentComment = this.comments.find(c => c._id === replyData.parentId);
    if (!parentComment) {
      console.error('Parent comment not found for reply:', replyData.parentId);
      this.snackBar.open('Could not find the comment to reply to.', 'Close', { duration: 3000 });
      return;
    }

    if (!parentComment.replies) {
      parentComment.replies = [];
    }

    const tempReplyId = 'temp_reply_' + Date.now();
    const tempReply: Comment = {
      _id: tempReplyId,
      videoId: this.currentVideoId,
      userId: this.user._id,
      avatar: this.user.avatar || 'img/avatar.png',
      name: this.user.name,
      text: replyData.text,
      likes: 0,
      parentComment: replyData.parentId,
      createdAt: new Date(),
      user: {
        _id: this.user._id,
        username: this.user.username || '',
        name: this.user.name,
        lastname: this.user.lastname || '',
        avatar: this.user.avatar || 'img/avatar.png'
      }
    };

    parentComment.replies.unshift(tempReply);
    this.cdr.detectChanges();

    this.subscriptions.push(
      this.videoCommentService.addReply(
        this.currentVideoId,
        replyData.parentId,
        this.user._id,
        replyData.text
      ).subscribe({
        next: (actualReplyFromServer) => {
          const index = parentComment?.replies?.findIndex(r => r._id === tempReplyId);
          if (index !== -1) {
            // No need to replace, as you're optimistically adding. The server response might contain the full data,
            // but if your goal is just to show it immediately, the temp object is fine.
            // If you need the server-generated _id or other server-generated fields, you'd replace it here.
          }
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Failed to post reply:', error);
          this.snackBar.open('Failed to post reply. Please try again.', 'Close', { duration: 3000 });
          this.cdr.detectChanges();
        }
      })
    )
  }

  navigateToVideo(videoId: string) {
    this.router.navigate(['/watch', videoId]).then(() => {
      this.loadVideo(videoId);
      if (this.user?.preferences?.autoplay) {
        const checkPlayer = setInterval(() => {
          if (this.playerReady && this.player) {
            clearInterval(checkPlayer);
            this.player.playVideo();
          }
        }, 100);
      }

      // Add this conditional check
      if (this.isMobile) {
        this.scrollToTop();
      }
    });
  }


  private scrollToTop() {
    // Scroll to specific element with id 'apptop' after navigation is complete
    const element = document.getElementById('videoplayer');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback to scrolling to top if element not found
      this.viewportScroller.scrollToPosition([0, 0]);
    }
  }

  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }

  formatDuration(duration: string): string {
    return videoDuration(duration);
  }

  formatViewCount(views: number | 0): string {
    return viewFormat(views);
  }

  formatLikesCount(views: number | 0): string {
    return likeFormat(views);
  }

  formatDislikesCount(views: number | 0): string {
    return dislikesFormat(views);
  }

  private startWatchHistoryTracking() {
    if (!this.user) return;

    this.stopWatchHistoryTracking();
    this.updateWatchHistory();

    this.watchHistorySubscription = timer(this.watchHistoryInterval * 1000, this.watchHistoryInterval * 1000).subscribe(() => this.updateWatchHistory());
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
      userId: this.user._id,
      progress,
      youtubeVideoId: this.currentVideoId,
      title: this.currentVideo.title,
      channel: this.currentVideo.channel,
      thumbnail: `https://i.ytimg.com/vi/${this.currentVideoId}/mqdefault.jpg`,
      duration: this.currentVideo.duration,
      publishedAt: this.currentVideo.publishedAt,
      views: this.currentVideo.views,
      likes: this.currentVideo.likes,
      dislikes: this.currentVideo.dislikes
    };

    this.subscriptions.push(
      this.videoService.updateWatchHistory(videoData).subscribe({
        error: (err) => console.error('Error updating watch history:', err)
      }))
  }

  private initializeLikeDislikeStates() {
    if (this.user && this.currentVideo) {
      this.liked = this.currentVideo.likedBy?.includes(this.user._id) || false;
      this.disliked = this.currentVideo.dislikedBy?.includes(this.user._id) || false;

      this.appLikes = this.currentVideo.appLikes || 0;
      this.appDislikes = this.currentVideo.appDislikes || 0;
    }
  }

  playNextRecommendedVideo() {
    if (this.recommendedVideos.length === 0) return;

    const currentIndex = this.recommendedVideos.findIndex(video => video.youtubeVideoId === this.currentVideoId);

    let nextVideo;

    if (currentIndex === -1) {
      nextVideo = this.recommendedVideos[0];
    } else if (currentIndex < this.recommendedVideos.length - 1) {
      nextVideo = this.recommendedVideos[currentIndex + 1];
    } else {
      nextVideo = this.recommendedVideos[0];
    }

    if (nextVideo) {
      this.navigateToVideo(nextVideo.youtubeVideoId);
      if (this.user?.preferences?.autoplay) {
        setTimeout(() => {
          if (this.player && typeof this.player.playVideo === 'function') {
            this.player.playVideo();
          }
        }, 1500);
      }
      this.resetControlsTimer();
    }
  }

  openCommentsSheet() {
  this.bottomSheet.open(CommentsBottomSheetComponent, {
    data: {
      comments: this.comments,
      videoId: this.currentVideo.youtubeVideoId,
      user: this.user
    },
    panelClass: 'comments-bottom-sheet'
  });
}
}