import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'async-trending-container',
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="trending-container">
      <div class="header">
        <h2>Trending Videos</h2>
        <a mat-flat-button color="primary" routerLink="/all-videos">See All</a>
      </div>

      <div class="video-grid">
        <mat-card *ngFor="let video of trendingVideos" class="video-card" tabindex="0">
          <div class="thumbnail-wrapper">
            <img [src]="video.thumbnail" [alt]="video.title" class="thumbnail" />
            <div class="overlay">
              <mat-icon class="play-icon">play_arrow</mat-icon>
            </div>
          </div>
          <mat-card-content>
            <h3 class="title">{{ video.title }}</h3>
            <p class="artist">by {{ video.artist }}</p>
            <div class="metrics">
              <span><mat-icon>favorite</mat-icon> {{ video.likes }}</span>
              <span><mat-icon>visibility</mat-icon> {{ video.views }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .trending-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h2 {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 600;
      }
    }

    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .video-card {
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      cursor: pointer;
      background-color: #fff;

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      }

      &:focus {
        outline: 2px solid #1976d2;
      }
    }

    .thumbnail-wrapper {
      position: relative;
      width: 100%;
      padding-top: 56.25%; /* 16:9 Aspect Ratio */
      background-color: #f5f5f5;

      .thumbnail {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;

        .play-icon {
          font-size: 48px;
          color: #fff;
          transform: scale(0.8);
          transition: transform 0.3s ease-in-out;
        }
      }

      &:hover .overlay {
        opacity: 1;

        .play-icon {
          transform: scale(1);
        }
      }
    }

    mat-card-content {
      padding: 16px;

      .title {
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 4px;
      }

      .artist {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 12px;
      }

      .metrics {
        display: flex;
        gap: 16px;
        font-size: 0.85rem;
        color: #444;

        mat-icon {
          font-size: 18px;
          margin-right: 4px;
          color: #999;
        }
      }
    }

    @media (max-width: 600px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .video-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TrendingComponent {
  trendingVideos = [
    {
      title: 'Dance Cover',
      artist: 'Henry12',
      thumbnail: './img/davido-banner.png',
      likes: '31.0K',
      views: '12K'
    },
    {
      title: 'Vocal Cover',
      artist: 'Ainnadi',
      thumbnail: './img/davido-banner.png',
      likes: '2.5K',
      views: '43K'
    },
    {
      title: 'Freestyle',
      artist: 'Ado2',
      thumbnail: './img/davido-banner.png',
      likes: '4.8K',
      views: '47K'
    },
    {
      title: 'Somebody Baby Remix',
      artist: 'StarboyL',
      thumbnail: './img/davido-banner.png',
      likes: '3.1K',
      views: '1.2M'
    }
  ];
}
