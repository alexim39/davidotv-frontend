import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'async-video-player',
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule, 
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSliderModule // <-- Make sure this is present
  ],
  template: `
    <div class="app-container">
      <!-- App Header -->
      <header class="app-header">
        <div class="header-content">
          <div class="logo-container">
            <img src="./img/logo2.PNG" alt="DavidoTv Logo" class="logo">
            <h1>DavidoTv</h1>
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
        <!-- Video Section -->
        <section class="video-section">
          <div class="video-container" *ngIf="safeUrl; else loadingTpl">
            <div class="video-wrapper">
              <iframe
                #videoFrame
                [src]="safeUrl"
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

            <!-- Repeat Indicator -->
            <div class="repeat-indicator" *ngIf="repeatMode !== 'none'">
              Repeat {{ repeatMode === 'one' ? '1' : 'All' }}
            </div>

            <!-- Video Controls -->
            <div class="video-controls" *ngIf="!isLoading" [class.hidden]="!showControls && isPlaying">
              <div class="progress-bar">
                <mat-slider 
                  min="0" 
                  [max]="duration" 
                  (input)="seekVideo($event)"
                  step="1"
                  aria-label="Video progress"
                >
                <input matSliderThumb [(ngModel)]="currentTime">
                </mat-slider>
              </div>
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
            </div>
          </div>

          <ng-template #loadingTpl>
            <div class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
              <p class="loading-text">Loading Davido's content...</p>
            </div>
          </ng-template>

          <!-- Video Info Section -->
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

          <!-- Comments Section -->
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

        <!-- Recommendations Sidebar -->
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
  styles: [`
    /* Global Styles */
    :host {
      display: block;
      background-color: #0f0f0f;
      color: #f1f1f1;
      font-family: 'Roboto', sans-serif;
    }

    /* App Header */
    .app-header {
      position: relative;
      top: 0;
      z-index: 100;
      background-color: #0f0f0f;
      padding: 0 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1800px;
      margin: 0 auto;
      padding: 12px 0;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .logo {
      height: 30px;
      width: auto;
    }

    .logo-container h1 {
      font-size: 1.5rem;
      font-weight: 500;
      margin: 0;
      color: #fff;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .subscribe-btn {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .premium-btn {
      background: linear-gradient(90deg, #ff4b2b, #ff416c);
      font-weight: 500;
    }

    /* Main Content Layout */
    .main-content {
      display: flex;
      max-width: 1800px;
      margin: 0 auto;
      padding: 24px 16px;
      gap: 24px;
    }

    .video-section {
      flex: 1;
      min-width: 0;
    }

    .recommendations-sidebar {
      width: 402px;
      flex-shrink: 0;
    }

    /* Video Container */
    .video-container {
      position: relative;
      width: 100%;
      aspect-ratio: 16/9;
      background-color: #000;
      border-radius: 12px;
      overflow: hidden;
    }


    .video-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      padding: 12px 16px;
      z-index: 10;
      transition: opacity 0.3s ease;
    }

    .video-controls.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .video-container:hover .video-controls:not(.hidden) {
      opacity: 1;
    }

    .progress-bar {
      margin-bottom: 8px;
    }

    .controls-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .left-controls, .right-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .time-display {
      font-size: 0.9rem;
      color: #fff;
      margin: 0 12px;
    }

    button.mat-icon-button {
      color: white;
      transition: transform 0.2s ease;
    }

    button.mat-icon-button:hover {
      transform: scale(1.1);
      background-color: rgba(255, 255, 255, 0.1);
    }

    button.mat-icon-button.active {
      color: #ff4b2b;
    }

    .video-wrapper {
      width: 100%;
      height: 100%;
    }

    /* Responsive Controls */
    @media (max-width: 768px) {
      .video-controls {
        padding: 8px;
      }
      
      .time-display {
        font-size: 0.8rem;
        margin: 0 8px;
      }
      
      button.mat-icon-button {
        width: 36px;
        height: 36px;
        line-height: 36px;
      }
      
      .play-button mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
    }

    .play-button {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      margin-bottom: 16px;
      padding: 0;
    }

    .play-button mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      transition: transform 0.2s;
    }

    .play-button:hover mat-icon {
      transform: scale(1.1);
    }

    /* Loading State */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
    }

    .loading-text {
      color: #aaa;
      font-size: 1rem;
    }

    /* Video Info */
    .video-info-container {
      margin-top: 16px;
    }

    .video-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid #3f3f3f;
    }

    .video-stats {
      color: #aaa;
      font-size: 0.9rem;
      display: flex;
      gap: 12px;
    }

    .video-actions {
      display: flex;
      gap: 8px;
    }

    .video-actions button {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .video-actions button.active {
      color: #ff4b2b;
    }

    /* Video Description */
    .video-description {
      padding: 16px 0;
      border-bottom: 1px solid #3f3f3f;
    }

    .video-description h2 {
      font-size: 1.25rem;
      font-weight: 500;
      margin: 0 0 16px 0;
    }

    .creator-info {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .creator-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .creator-details {
      flex: 1;
    }

    .creator-details h3 {
      font-size: 1rem;
      font-weight: 500;
      margin: 0 0 4px 0;
    }

    .creator-details p {
      font-size: 0.8rem;
      color: #aaa;
      margin: 0;
    }

    .description-text {
      margin-left: 64px;
      position: relative;
    }

    .description-text p {
      margin: 0 0 8px 0;
      line-height: 1.5;
      white-space: pre-line;
    }

    .show-more-btn {
      color: #aaa;
      font-weight: 500;
      padding: 0;
      min-width: auto;
    }

    /* Comments Section */
    .comments-section {
      padding: 16px 0;
    }

    .comments-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .comments-header h3 {
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0;
    }

    .sort-comments {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #aaa;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .add-comment {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .comment-form {
      flex: 1;
    }

    .comment-form input {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 1px solid #3f3f3f;
      color: white;
      padding: 8px 0;
      font-size: 0.9rem;
      outline: none;
    }

    .comment-form input:focus {
      border-bottom-color: #ff4b2b;
    }

    .comment-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }

    /* Comments List */
    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .comment {
      display: flex;
      gap: 16px;
    }

    .comment-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .comment-content {
      flex: 1;
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .comment-header h4 {
      font-size: 0.9rem;
      font-weight: 500;
      margin: 0;
    }

    .comment-time {
      font-size: 0.8rem;
      color: #aaa;
    }

    .comment-text {
      font-size: 0.9rem;
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .comment-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .comment-actions button {
      min-width: auto;
      padding: 0;
    }

    .likes-count {
      font-size: 0.8rem;
      color: #aaa;
    }

    /* Recommendations Sidebar */
    .recommendations-sidebar {
      padding-top: 8px;
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .sidebar-header h3 {
      font-size: 1rem;
      font-weight: 500;
      margin: 0;
    }

    .autoplay-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #aaa;
      font-size: 0.9rem;
    }

    .recommendation-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .recommendation-item {
      display: flex;
      gap: 8px;
      cursor: pointer;
    }

    .thumbnail-container {
      position: relative;
      flex-shrink: 0;
    }

    .thumbnail {
      width: 168px;
      height: 94px;
      border-radius: 4px;
      object-fit: cover;
    }

    .duration {
      position: absolute;
      bottom: 4px;
      right: 4px;
      background-color: rgba(0, 0, 0, 0.8);
      padding: 2px 4px;
      border-radius: 2px;
      font-size: 0.7rem;
    }

    .video-details {
      flex: 1;
    }

    .video-details h4 {
      font-size: 0.9rem;
      font-weight: 500;
      margin: 0 0 4px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .creator, .views {
      font-size: 0.8rem;
      color: #aaa;
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .main-content {
        flex-direction: column;
      }

      .recommendations-sidebar {
        width: 100%;
      }

      .recommendation-item {
        gap: 16px;
      }

      .thumbnail {
        width: 240px;
        height: 135px;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 8px 0;
      }

      .premium-btn {
        display: none;
      }

      .video-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .creator-info {
        flex-wrap: wrap;
      }

      .description-text {
        margin-left: 0;
      }

      .recommendation-item {
        flex-direction: column;
        gap: 8px;
      }

      .thumbnail {
        width: 100%;
        height: auto;
        aspect-ratio: 16/9;
      }
    }

    /* Add to your styles */
    .video-actions button.active {
      color: #ff4b2b;
    }

    .repeat-indicator {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: rgba(0, 0, 0, 0.7);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      z-index: 5;
    }

    mat-slider {
      width: 100%;
    }

    .mat-slider-track-background {
      background-color: rgba(255, 255, 255, 0.2) !important;
    }

    .mat-slider-track-fill {
      background-color: #ff4b2b !important;
    }

    .mat-slider-thumb {
      background-color: #ff4b2b !important;
    }

    .mat-slider-thumb-label {
      background-color: #ff4b2b !important;
    }
  `]
})
export class VideoPlayerComponent implements OnInit {
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
  player: any;
  playerReady = false;
  isMuted = false;
  isFullscreen = false;
  currentTime = 0;
  duration = 0;

  // Playlist management
  davidoVideos = [
    { id: 'IDynlmdQ-0o', title: 'Davido - Fall', duration: '4:25', thumbnail: 'https://i.ytimg.com/vi/IDynlmdQ-0o/mqdefault.jpg', views: '245M views', date: '5 years ago' },
    { id: 'gGdGFtwCNBE', title: 'Davido - IF', duration: '3:32', thumbnail: 'https://i.ytimg.com/vi/gGdGFtwCNBE/mqdefault.jpg', views: '187M views', date: '4 years ago' },
    { id: 'qV2N6hJ2gXk', title: 'Davido - Assurance', duration: '4:12', thumbnail: 'https://i.ytimg.com/vi/qV2N6hJ2gXk/mqdefault.jpg', views: '98M views', date: '3 years ago' }
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

  constructor(
    private route: ActivatedRoute, 
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    const videoId = this.route.snapshot.paramMap.get('id');
    if (videoId) {
      this.currentVideoId = videoId;
      this.currentVideoIndex = this.davidoVideos.findIndex(v => v.id === videoId);
      this.loadVideo(videoId);
    }
    this.setupMessageListener();
    this.loadYouTubeAPI();
    this.setupPlayerStatePolling();
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.handleYouTubeMessages);
    clearInterval(this.controlsTimeout);
  }

  loadYouTubeAPI() {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  }

  setupMessageListener() {
    window.addEventListener('message', this.handleYouTubeMessages.bind(this));
  }


  setupPlayerStatePolling() {
    // Poll player state since we can't reliably get all events from YouTube iframe
    setInterval(() => {
      if (this.playerReady) {
        this.getCurrentTime();
        // Only get duration if we don't have it yet
        if (!this.duration) {
          this.getDuration();
        }
      }
    }, 1000);
  }


  handleYouTubeMessages(event: MessageEvent) {
    if (event.origin !== 'https://www.youtube.com') return;
    
    try {
      const data = JSON.parse(event.data);
      
      switch (data.event) {
        case 'onReady':
          this.playerReady = true;
          this.player = data.target;
          if (this.autoplay) this.playVideo();
          // Get initial duration
          this.getDuration();
          break;
          
        case 'onStateChange':
          this.handleStateChange(data.info);
          break;
      }
    } catch (e) {
      console.error('Error parsing YouTube message', e);
    }
  }


  handleStateChange(state: number) {
    // YouTube player states:
    // -1 (unstarted)
    // 0 (ended)
    // 1 (playing)
    // 2 (paused)
    // 3 (buffering)
    // 5 (video cued)
    
    if (state === 1) {
      this.isPlaying = true;
      this.showOverlay = false;
    } else if (state === 2 || state === 0) {
      this.isPlaying = false;
    }
    
    if (state === 0) { // Video ended
      this.handleVideoEnded();
    }
    
    this.resetControlsTimer();
  }

  loadVideo(videoId: string) {
    const isDavidoVideo = this.davidoVideos.some(v => v.id === videoId);
    const url = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&controls=0&disablekb=1&fs=1&iv_load_policy=3&origin=${window.location.origin}`;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.showOverlay = true;
    this.isPlaying = false;
    this.updateVideoInfo(videoId);
    
    // Reset player ready state when loading new video
    this.playerReady = false;
  }

  updateVideoInfo(videoId: string) {
    const video = this.davidoVideos.find(v => v.id === videoId);
    if (video) {
      this.videoTitle = video.title;
      this.uploadDate = new Date();
      this.uploadDate.setFullYear(this.uploadDate.getFullYear() - Math.floor(Math.random() * 5));
    }
  }

  onVideoLoad() {
    this.isLoading = false;
    this.resetControlsTimer();
  }

  // Player control methods
  playVideo() {
    if (this.playerReady) {
      this.player.playVideo();
      this.isPlaying = true;
      this.showOverlay = false;
    } else {
      // Fallback if API isn't ready
      const iframe = this.videoFrame.nativeElement;
      iframe.contentWindow?.postMessage(
        '{"event":"command","func":"playVideo","args":""}',
        '*'
      );
      this.isPlaying = true;
      this.showOverlay = false;
    }
    this.resetControlsTimer();
  }

  pauseVideo() {
    if (this.playerReady) {
      this.player.pauseVideo();
    } else {
      const iframe = this.videoFrame.nativeElement;
      iframe.contentWindow?.postMessage(
        '{"event":"command","func":"pauseVideo","args":""}',
        '*'
      );
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
    const time = event.value || event;
    this.currentTime = time;
    
    if (this.playerReady) {
      this.player.seekTo(time, true);
      if (!this.isPlaying) {
        this.player.playVideo();
        this.isPlaying = true;
      }
    } else {
      const iframe = this.videoFrame.nativeElement;
      iframe.contentWindow?.postMessage(
        `{"event":"command","func":"seekTo","args":[${time},true]}`,
        '*'
      );
      if (!this.isPlaying) {
        iframe.contentWindow?.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          '*'
        );
        this.isPlaying = true;
      }
    }
    
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
    } else {
      const iframe = this.videoFrame.nativeElement;
      iframe.contentWindow?.postMessage(
        `{"event":"command","func":"${this.isMuted ? 'mute' : 'unMute'}","args":""}`,
        '*'
      );
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

  getCurrentTime() {
    if (this.playerReady) {
      this.player.getCurrentTime().then((time: number) => {
        this.currentTime = time;
      });
    }
  }

  getDuration() {
    if (this.playerReady) {
      this.player.getDuration().then((duration: number) => {
        this.duration = duration;
      });
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
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
        this.seekVideo({ value: 0 });
        this.playVideo();
        break;
      case 'all':
        this.playNextVideo();
        break;
      default:
        this.isPlaying = false;
        this.showOverlay = true;
        this.showControls = true;
    }
  }

  playNextVideo() {
    if (this.davidoVideos.length > 0) {
      let nextIndex = this.currentVideoIndex + 1;
      if (nextIndex >= this.davidoVideos.length) {
        nextIndex = 0;
      }
      const nextVideo = this.davidoVideos[nextIndex];
      this.currentVideoIndex = nextIndex;
      this.router.navigate(['/videos', nextVideo.id]);
      this.loadVideo(nextVideo.id);
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
      this.router.navigate(['/videos', prevVideo.id]);
      this.loadVideo(prevVideo.id);
    }
  }

  toggleRepeatMode() {
    if (this.repeatMode === 'none') {
      this.repeatMode = 'one';
    } else if (this.repeatMode === 'one') {
      this.repeatMode = 'all';
    } else {
      this.repeatMode = 'none';
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
    this.router.navigate(['/videos', videoId]);
    this.loadVideo(videoId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}