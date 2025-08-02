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
import { MatCardModule } from '@angular/material/card';

// Add a type for the player to avoid errors
type SimpleAudioPlayer = HTMLAudioElement | null;

@Component({
  selector: 'async-audio-player',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule, 
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSliderModule,
    MatCardModule
  ],
  template: `
    <div class="app-container">
      <!-- App Header -->
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
        <!-- Music Player Section -->
        <section class="music-section">
          <div class="music-container">
            <!-- Album Art and Visualizer -->
            <div class="album-art-container">
              <div class="album-art-wrapper" [class.playing]="isPlaying">
                <img [src]="currentTrack.albumArt" alt="Album Art" class="album-art">
                <div class="visualizer" *ngIf="isPlaying">
                  <div class="bar" *ngFor="let bar of visualizerBars" [style.height]="bar.height + 'px'"></div>
                </div>
              </div>
            </div>

            <!-- Track Info -->
            <div class="track-info">
              <h1 class="track-title">{{ currentTrack.title }}</h1>
              <h2 class="artist-name">Davido</h2>
              <p class="album-name">{{ currentTrack.album }} • {{ currentTrack.year }}</p>
              
              <!-- Lyrics Section -->
              <div class="lyrics-container" *ngIf="showLyrics">
                <div class="lyrics-scroll" #lyricsScroll>
                  <div class="lyrics-line" 
                       *ngFor="let line of lyrics" 
                       [class.active]="isLyricActive(line.time)"
                       [style.opacity]="getLyricOpacity(line.time)">
                    {{ line.text }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Player Controls -->
            <div class="player-controls">
              <!-- Progress Bar -->
              <div class="progress-container">
                <span class="time-current">{{ formatTime(currentTime) }}</span>
                <mat-slider 
                  class="progress-slider"
                  min="0" 
                  [max]="duration" 
                  (input)="seekTrack($event)"
                  step="1"
                  aria-label="Track progress"
                >
                <input matSliderThumb [(ngModel)]="currentTime">
            </mat-slider>
                <span class="time-duration">{{ formatTime(duration) }}</span>
              </div>

              <!-- Main Controls -->
              <div class="main-controls">
                <button mat-icon-button (click)="toggleShuffle()" [class.active]="shuffle" aria-label="Shuffle">
                  <mat-icon>shuffle</mat-icon>
                </button>
                <button mat-icon-button (click)="previousTrack()" aria-label="Previous track">
                  <mat-icon>skip_previous</mat-icon>
                </button>
                <button mat-icon-button class="play-button" (click)="togglePlay()" aria-label="Play/Pause">
                  <mat-icon>{{ isPlaying ? 'pause_circle' : 'play_circle' }}</mat-icon>
                </button>
                <button mat-icon-button (click)="nextTrack()" aria-label="Next track">
                  <mat-icon>skip_next</mat-icon>
                </button>
                <button mat-icon-button (click)="toggleRepeat()" [class.active]="repeatMode !== 'none'" aria-label="Repeat">
                  <mat-icon>{{ repeatMode === 'one' ? 'repeat_one' : 'repeat' }}</mat-icon>
                </button>
              </div>

              <!-- Secondary Controls -->
              <div class="secondary-controls">
                <button mat-icon-button (click)="toggleLyrics()" aria-label="Toggle lyrics">
                  <mat-icon>lyrics</mat-icon>
                </button>
                <button mat-icon-button (click)="toggleMute()" aria-label="Toggle mute">
                  <mat-icon>{{ isMuted ? 'volume_off' : 'volume_up' }}</mat-icon>
                </button>
                <mat-slider
                  class="volume-slider"
                  min="0"
                  max="1"
                  step="0.01"
                  (input)="setVolume($event)"
                  aria-label="Volume"
                >
                <input matSliderThumb [(ngModel)]="volume">
            </mat-slider>
                <button mat-icon-button (click)="addToPlaylist()" aria-label="Add to playlist">
                  <mat-icon>playlist_add</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Track Info Section -->
          <div class="track-details-container">
            <div class="track-meta">
              <div class="track-stats">
                <span class="plays">{{ plays | number }} plays</span>
                <span class="release-date">Released {{ releaseDate | date }}</span>
              </div>
              <div class="track-actions">
                <button mat-button (click)="likeTrack()" [class.active]="liked" aria-label="Like track">
                  <mat-icon>{{ liked ? 'favorite' : 'favorite_border' }}</mat-icon>
                  {{ likes | number }}
                </button>
                <button mat-button (click)="downloadTrack()" aria-label="Download track">
                  <mat-icon>download</mat-icon>
                  Download
                </button>
                <button mat-button (click)="shareTrack()" aria-label="Share track">
                  <mat-icon>share</mat-icon>
                  Share
                </button>
              </div>
            </div>

            <div class="track-description">
              <h3>About This Track</h3>
              <div class="description-text" [class.expanded]="descriptionExpanded">
                <p>{{ currentTrack.description }}</p>
                <button mat-button (click)="descriptionExpanded = !descriptionExpanded" class="show-more-btn">
                  Show {{ descriptionExpanded ? 'less' : 'more' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="comments-section">
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
        <aside class="recommendations-sidebar">
          <div class="sidebar-header">
            <h3>More from Davido</h3>
          </div>
          <div class="recommendation-list">
            <mat-card class="recommendation-item" *ngFor="let track of recommendedTracks" (click)="playTrack(track.id)">
              <div class="card-content">
                <div class="thumbnail-container">
                  <img [src]="track.albumArt" alt="{{ track.title }}" class="thumbnail">
                  <button mat-icon-button class="play-overlay" (click)="playTrack(track.id); $event.stopPropagation()">
                    <mat-icon>play_circle</mat-icon>
                  </button>
                </div>
                <div class="track-details">
                  <h4>{{ track.title }}</h4>
                  <p class="album">{{ track.album }}</p>
                  <p class="duration">{{ track.duration }} • {{ track.plays | number }} plays</p>
                </div>
              </div>
            </mat-card>
          </div>

          <!-- Playlist Section -->
          <div class="playlist-section">
            <div class="sidebar-header">
              <h3>Featured Playlists</h3>
            </div>
            <div class="playlist-list">
              <mat-card class="playlist-item" *ngFor="let playlist of featuredPlaylists">
                <div class="card-content">
                  <img [src]="playlist.cover" alt="{{ playlist.name }}" class="playlist-cover">
                  <div class="playlist-info">
                    <h4>{{ playlist.name }}</h4>
                    <p>{{ playlist.trackCount }} tracks • {{ playlist.followers | number }} followers</p>
                  </div>
                </div>
              </mat-card>
            </div>
          </div>
        </aside>
      </main>

      <!-- Mini Player (Fixed at bottom) -->
      <div class="mini-player" [class.active]="isPlaying">
        <div class="mini-player-content">
          <img [src]="currentTrack.albumArt" alt="Album Art" class="mini-album-art">
          <div class="mini-track-info">
            <h4>{{ currentTrack.title }}</h4>
            <p>Davido</p>
          </div>
          <div class="mini-controls">
            <button mat-icon-button (click)="togglePlay()" aria-label="Play/Pause">
              <mat-icon>{{ isPlaying ? 'pause' : 'play_arrow' }}</mat-icon>
            </button>
            <button mat-icon-button (click)="nextTrack()" aria-label="Next track">
              <mat-icon>skip_next</mat-icon>
            </button>
          </div>
          <mat-slider
            class="mini-progress"
            min="0"
            [max]="duration"
            (input)="seekTrack($event)"
            step="1"
            aria-label="Track progress"
          >
          <input matSliderThumb [(ngModel)]="currentTime">
        </mat-slider>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Global Styles */
    :host {
      display: block;
      background-color: #121212;
      color: #ffffff;
      font-family: 'Roboto', sans-serif;
      padding-bottom: 80px; /* Space for mini player */
    }

    /* App Header */
    .app-header {
      position: relative;
      top: 0;
      z-index: 100;
      background-color: #121212;
      padding: 0 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
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

    .music-section {
      flex: 1;
      min-width: 0;
    }

    .recommendations-sidebar {
      width: 402px;
      flex-shrink: 0;
    }

    /* Music Container */
    .music-container {
      background-color: #181818;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    /* Album Art Section */
    .album-art-container {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }

    .album-art-wrapper {
      position: relative;
      width: 300px;
      height: 300px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s ease;
    }

    .album-art-wrapper.playing {
      transform: scale(1.02);
    }

    .album-art {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .visualizer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 4px;
      padding: 0 10px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    }

    .bar {
      width: 4px;
      background: linear-gradient(to top, #ff4b2b, #ff416c);
      border-radius: 2px;
      transition: height 0.3s ease;
    }

    /* Track Info */
    .track-info {
      text-align: center;
      margin-bottom: 32px;
    }

    .track-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #ffffff;
    }

    .artist-name {
      font-size: 1.2rem;
      font-weight: 500;
      margin: 0 0 4px 0;
      color: rgba(255, 255, 255, 0.9);
    }

    .album-name {
      font-size: 0.9rem;
      margin: 0 0 24px 0;
      color: rgba(255, 255, 255, 0.6);
    }

    /* Lyrics Section */
    .lyrics-container {
      max-height: 300px;
      overflow-y: auto;
      margin: 24px auto;
      padding: 16px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      scroll-behavior: smooth;
    }

    .lyrics-scroll {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .lyrics-line {
      font-size: 1.1rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.7);
      transition: all 0.3s ease;
    }

    .lyrics-line.active {
      color: #ffffff;
      font-size: 1.3rem;
      font-weight: 500;
    }

    /* Player Controls */
    .player-controls {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Progress Bar */
    .progress-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .time-current, .time-duration {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
      min-width: 40px;
    }

    .progress-slider {
      flex: 1;
    }

    /* Main Controls */
    .main-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 24px;
    }

    .play-button {
      width: 56px;
      height: 56px;
      line-height: 56px;
    }

    .play-button mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
    }

    button.mat-icon-button {
      color: white;
      transition: all 0.2s ease;
    }

    button.mat-icon-button:hover {
      transform: scale(1.1);
      background-color: rgba(255, 255, 255, 0.1);
    }

    button.mat-icon-button.active {
      color: #ff4b2b;
    }

    /* Secondary Controls */
    .secondary-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
    }

    .volume-slider {
      width: 100px;
    }

    /* Track Details */
    .track-details-container {
      background-color: #181818;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .track-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid #3f3f3f;
    }

    .track-stats {
      color: #aaa;
      font-size: 0.9rem;
      display: flex;
      gap: 12px;
    }

    .track-actions {
      display: flex;
      gap: 8px;
    }

    .track-actions button {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .track-actions button.active {
      color: #ff4b2b;
    }

    /* Track Description */
    .track-description {
      padding: 16px 0;
    }

    .track-description h3 {
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0 0 16px 0;
    }

    .description-text p {
      margin: 0 0 8px 0;
      line-height: 1.5;
      white-space: pre-line;
      color: rgba(255, 255, 255, 0.8);
    }

    .show-more-btn {
      color: #aaa;
      font-weight: 500;
      padding: 0;
      min-width: auto;
    }

    /* Comments Section (Same as video component) */
    .comments-section {
      background-color: #181818;
      border-radius: 12px;
      padding: 24px;
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

    .likes-count {
      font-size: 0.8rem;
      color: #aaa;
    }

    /* Recommendations Sidebar */
    .recommendations-sidebar {
      display: flex;
      flex-direction: column;
      gap: 24px;
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

    /* Recommendation Items */
    .recommendation-item {
      background-color: #181818;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 16px;
      transition: transform 0.3s ease, background-color 0.3s ease;
      cursor: pointer;
    }

    .recommendation-item:hover {
      background-color: #282828;
      transform: translateY(-4px);
    }

    .card-content {
      display: flex;
      gap: 16px;
      padding: 16px;
    }

    .thumbnail-container {
      position: relative;
      flex-shrink: 0;
    }

    .thumbnail {
      width: 80px;
      height: 80px;
      border-radius: 4px;
      object-fit: cover;
    }

    .play-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .thumbnail-container:hover .play-overlay {
      opacity: 1;
    }

    .track-details {
      flex: 1;
    }

    .track-details h4 {
      font-size: 0.9rem;
      font-weight: 500;
      margin: 0 0 4px 0;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .album, .duration {
      font-size: 0.8rem;
      color: #aaa;
      margin: 0;
    }

    /* Playlist Section */
    .playlist-item {
      background-color: #181818;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 16px;
      transition: transform 0.3s ease;
    }

    .playlist-item:hover {
      transform: translateY(-4px);
    }

    .playlist-cover {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }

    .playlist-info {
      padding: 16px;
    }

    .playlist-info h4 {
      font-size: 0.9rem;
      font-weight: 500;
      margin: 0 0 4px 0;
    }

    .playlist-info p {
      font-size: 0.8rem;
      color: #aaa;
      margin: 0;
    }

    /* Mini Player */
    .mini-player {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 80px;
      background-color: #282828;
      border-top: 1px solid #3f3f3f;
      transform: translateY(100%);
      transition: transform 0.3s ease;
      z-index: 1000;
    }

    .mini-player.active {
      transform: translateY(0);
    }

    .mini-player-content {
      display: flex;
      align-items: center;
      max-width: 1800px;
      margin: 0 auto;
      padding: 0 16px;
      height: 100%;
      position: relative;
    }

    .mini-album-art {
      width: 56px;
      height: 56px;
      border-radius: 4px;
      margin-right: 16px;
    }

    .mini-track-info {
      flex: 1;
      min-width: 0;
    }

    .mini-track-info h4 {
      font-size: 0.9rem;
      font-weight: 500;
      margin: 0 0 4px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mini-track-info p {
      font-size: 0.8rem;
      color: #aaa;
      margin: 0;
    }

    .mini-controls {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 0 24px;
    }

    .mini-progress {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }

    /* Slider Styles */
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

    /* Responsive Design */
    @media (max-width: 1200px) {
      .main-content {
        flex-direction: column;
      }

      .recommendations-sidebar {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 8px 0;
      }

      .premium-btn {
        display: none;
      }

      .album-art-wrapper {
        width: 200px;
        height: 200px;
      }

      .track-title {
        font-size: 1.5rem;
      }

      .artist-name {
        font-size: 1rem;
      }

      .main-controls {
        gap: 16px;
      }

      .play-button {
        width: 48px;
        height: 48px;
        line-height: 48px;
      }

      .play-button mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      .secondary-controls {
        gap: 8px;
      }

      .volume-slider {
        width: 80px;
      }

      .track-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .card-content {
        flex-direction: column;
        gap: 8px;
      }

      .thumbnail {
        width: 100%;
        height: auto;
        aspect-ratio: 1;
      }
    }
  `]
})
export class AudioPlayerComponent implements OnInit {
  // Player state
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  volume = 0.7;
  isMuted = false;
  showLyrics = false;
  descriptionExpanded = false;
  shuffle = false;
  repeatMode: 'none' | 'one' | 'all' = 'none';

  // Visualizer
  visualizerBars = Array(20).fill(0).map(() => ({ height: Math.random() * 20 + 5 }));

  // Track data
  currentTrack = {
    id: '1',
    title: 'Fall',
    album: 'A Good Time',
    year: '2017',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273e29b577624c60a2e2a8a6f5d',
    duration: 243,
    plays: 245000000,
    description: `"Fall" is a song by Nigerian singer Davido. It was released on 2 June 2017 as the second single from his second studio album A Good Time. 
    
    The song was produced by Kiddominant and written by Davido. It became a continental hit and one of Davido's most successful songs to date.`,
    audioUrl: 'https://example.com/audio/fall.mp3'
  };

  // Lyrics
  lyrics = [
    { time: 0, text: "[Intro]" },
    { time: 5, text: "Girl I like the way you dance, oh oh oh" },
    { time: 10, text: "Girl I like the way you whine, oh oh oh" },
    { time: 15, text: "And I want you to be my lover" },
    { time: 20, text: "Girl I want you to be my lover" },
    // ... more lyrics
  ];

  // Track stats
  plays = 245000000;
  releaseDate = new Date('2017-06-02');
  likes = 542310;
  liked = false;

  // Comments
  comments = [
    { 
      user: 'SuperFan', 
      text: 'This song never gets old! Davido is the GOAT 🐐', 
      likes: 1245,
      time: '2 days ago',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    { 
      user: 'MusicLover', 
      text: 'The beat still hits hard after all these years!', 
      likes: 892,
      time: '1 week ago',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    }
  ];
  newComment = '';

  // Recommended tracks
  recommendedTracks = [
    {
      id: '2',
      title: 'IF',
      album: 'A Good Time',
      year: '2017',
      albumArt: 'https://i.scdn.co/image/ab67616d0000b273e29b577624c60a2e2a8a6f5d',
      duration: 212, // 3:32 in seconds
      plays: 187000000
    },
    {
      id: '3',
      title: 'Assurance',
      album: 'A Good Time',
      year: '2018',
      albumArt: 'https://i.scdn.co/image/ab67616d0000b273e29b577624c60a2e2a8a6f5d',
      duration: 252, // 4:12 in seconds
      plays: 98000000
    },
    {
      id: '4',
      title: 'FIA',
      album: 'A Good Time',
      year: '2017',
      albumArt: 'https://i.scdn.co/image/ab67616d0000b273e29b577624c60a2e2a8a6f5d',
      duration: 195, // 3:15 in seconds
      plays: 120000000
    }
  ];

  // Featured playlists
  featuredPlaylists = [
    {
      id: '1',
      name: 'Davido Essentials',
      cover: 'https://i.scdn.co/image/ab67706f00000002a980b152e708b33c6518d9e5',
      trackCount: 50,
      followers: 1200000
    },
    {
      id: '2',
      name: 'Afrobeats Hits',
      cover: 'https://i.scdn.co/image/ab67706f0000000254473d2e9a1d2d6c2c3e3b3d',
      trackCount: 100,
      followers: 2500000
    }
  ];

  // User data
  currentUserAvatar = 'https://randomuser.me/api/portraits/men/1.jpg';

  // Replace Howler.js player with native Audio
  player: SimpleAudioPlayer = null;

  @ViewChild('lyricsScroll') lyricsScroll!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const trackId = this.route.snapshot.paramMap.get('id');
    if (trackId) {
      this.loadTrack(trackId);
    } else {
      this.loadTrack(this.currentTrack.id);
    }

    // Set initial volume
    this.setVolume(this.volume);

    // Update visualizer animation
    setInterval(() => {
      if (this.isPlaying) {
        this.visualizerBars = this.visualizerBars.map(() => ({
          height: Math.random() * 30 + 10
        }));
      }
    }, 200);

    // Update current time
    setInterval(() => {
      if (this.player && this.isPlaying) {
        this.currentTime = this.player.currentTime;

        // Auto-scroll lyrics
        if (this.showLyrics && this.lyricsScroll) {
          const activeLine = document.querySelector('.lyrics-line.active');
          if (activeLine) {
            activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    }, 1000);
  }

  loadTrack(trackId: string) {
    // In a real app, you would fetch track data based on ID
    const track = this.recommendedTracks.find(t => t.id === trackId) || this.currentTrack;
    this.currentTrack = { ...this.currentTrack, ...track };

    // Initialize audio player
    this.initPlayer();

    // Reset player state
    this.currentTime = 0;
    this.duration = this.currentTrack.duration;
    this.isPlaying = false;
  }

  initPlayer() {
    if (this.player) {
      this.player.pause();
      this.player.src = '';
      this.player = null;
    }

    this.player = new Audio(this.currentTrack.audioUrl);
    this.player.volume = this.volume;
    this.player.preload = 'auto';

    this.player.onloadedmetadata = () => {
      this.duration = this.player?.duration || this.currentTrack.duration;
    };
    this.player.onplay = () => {
      this.isPlaying = true;
      this.duration = this.player?.duration || this.currentTrack.duration;
    };
    this.player.onpause = () => {
      this.isPlaying = false;
    };
    this.player.onended = () => {
      this.handleTrackEnd();
    };
    this.player.onerror = (error) => {
      console.error('Error loading audio:', error);
      this.snackBar.open('Error loading audio track', 'Close', { duration: 3000 });
    };
  }

  togglePlay() {
    if (!this.player) return;

    if (this.isPlaying) {
      this.player.pause();
    } else {
      this.player.play();
    }
  }

  seekTrack(event: any) {
    const time = event.value || event;
    this.currentTime = time;

    if (this.player) {
      this.player.currentTime = time;
      if (!this.isPlaying) {
        this.player.play();
      }
    }
  }

  setVolume(event: any) {
    const volume = typeof event === 'number' ? event : event.value || event;
    this.volume = volume;
    if (this.player) {
      this.player.volume = volume;
    }
    this.isMuted = volume === 0;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.player) {
      this.player.muted = this.isMuted;
      if (!this.isMuted && this.volume === 0) {
        this.volume = 0.7;
        this.player.volume = this.volume;
      }
    }
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
  }

  toggleRepeat() {
    if (this.repeatMode === 'none') {
      this.repeatMode = 'one';
    } else if (this.repeatMode === 'one') {
      this.repeatMode = 'all';
    } else {
      this.repeatMode = 'none';
    }
  }

  toggleLyrics() {
    this.showLyrics = !this.showLyrics;
  }

  previousTrack() {
    // In a real app, you would implement proper playlist navigation
    const currentIndex = this.recommendedTracks.findIndex(t => t.id === this.currentTrack.id);
    const prevIndex = currentIndex <= 0 ? this.recommendedTracks.length - 1 : currentIndex - 1;
    this.playTrack(this.recommendedTracks[prevIndex].id);
  }

  nextTrack() {
    // In a real app, you would implement proper playlist navigation
    const currentIndex = this.recommendedTracks.findIndex(t => t.id === this.currentTrack.id);
    const nextIndex = currentIndex >= this.recommendedTracks.length - 1 ? 0 : currentIndex + 1;
    this.playTrack(this.recommendedTracks[nextIndex].id);
  }

  playTrack(trackId: string) {
    this.router.navigate(['/music', trackId]);
    this.loadTrack(trackId);
    if (this.player) {
      this.player.play();
    }
  }

  handleTrackEnd() {
    switch (this.repeatMode) {
      case 'one':
        this.seekTrack(0);
        this.player?.play();
        break;
      case 'all':
        this.nextTrack();
        break;
      default:
        this.isPlaying = false;
        this.currentTime = 0;
    }
  }

  likeTrack() {
    this.liked = !this.liked;
    if (this.liked) {
      this.likes++;
      this.snackBar.open('Added to your liked songs', '', { duration: 2000 });
    } else {
      this.likes--;
    }
  }

  downloadTrack() {
    this.snackBar.open('Download started', '', { duration: 2000 });
    // In a real app, you would implement actual download logic
  }

  shareTrack() {
    if (navigator.share) {
      navigator.share({
        title: `Davido - ${this.currentTrack.title}`,
        text: `Listen to "${this.currentTrack.title}" by Davido`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.snackBar.open('Link copied to clipboard!', '', { duration: 2000 });
    }
  }

  addToPlaylist() {
    this.snackBar.open('Added to playlist', '', { duration: 2000 });
    // In a real app, you would implement actual playlist addition
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

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  isLyricActive(lineTime: number): boolean {
    return this.currentTime >= lineTime && 
           (this.currentTime < (this.getNextLyricTime(lineTime) || this.duration));
  }

  getLyricOpacity(lineTime: number): number {
    const nextTime = this.getNextLyricTime(lineTime) || this.duration;
    const timeSinceLine = this.currentTime - lineTime;
    const lineDuration = nextTime - lineTime;
    
    // Fade in quickly at start of line, stay mostly opaque until next line
    return Math.min(1, 0.7 + (timeSinceLine / lineDuration) * 0.3);
  }

  getNextLyricTime(currentTime: number): number | null {
    const currentIndex = this.lyrics.findIndex(line => line.time === currentTime);
    if (currentIndex === -1 || currentIndex >= this.lyrics.length - 1) {
      return null;
    }
    return this.lyrics[currentIndex + 1].time;
  }
}