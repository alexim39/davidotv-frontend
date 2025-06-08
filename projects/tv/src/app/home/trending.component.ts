import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { VideoItem } from "../videos/videos.service";
import { Router } from "@angular/router";

@Component({
  selector: 'async-trending',
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <section class="trending-section">
      <div class="section-header">
        <mat-icon class="section-icon">local_fire_department</mat-icon>
        <h2>Trending Now</h2>
        <button mat-button class="see-all">See all</button>
      </div>
      
      <div class="video-grid">
        <mat-card *ngFor="let video of videos" class="video-card" (click)="goToVideo(video.id)">
          <img mat-card-image [src]="video.thumbnail" [alt]="video.title" loading="lazy">
          <mat-card-content>
            <div class="video-info">
              <img [src]="video.channelIcon" alt="Channel" class="channel-icon" loading="lazy">
              <div class="video-meta">
                <h3>{{video.title}}</h3>
                <p>{{video.channel}}</p>
                <p>{{video.views}} • {{video.date}}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </section>
  `,
  styles: [`
    .trending-section {
      margin-bottom: 32px;
      width: 100%;
    }

    .section-header {
      display: flex;
      align-items: center;
      margin: 24px 16px 16px;
      flex-wrap: wrap;

      .section-icon {
        margin-right: 8px;
        color: #8f0045;
      }

      h2 {
        margin: 0;
        flex: 1;
        font-size: clamp(1rem, 2vw, 1.25rem);
        font-weight: 500;
      }

      .see-all {
        color: #8f0045;
      }

      @media (max-width: 600px) {
        margin: 16px 8px 12px;
      }
    }

    .video-grid {
      display: grid;
      gap: 16px;
      padding: 0 16px;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
        padding: 0 8px;
        gap: 12px;
      }
    }

    .video-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      @media (max-width: 600px) {
        &:hover {
          transform: none;
        }
      }
    }

    .video-info {
      display: flex;
      margin-top: 12px;
      align-items: flex-start;

      .channel-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .video-meta {
        overflow: hidden;
      }

      h3 {
        font-size: 14px;
        margin: 0 0 4px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      p {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        margin: 0;
        word-break: break-word;
      }
    }

  mat-card img {
    width: 100%;
    height: auto;
    object-fit: cover;
    display: block;
    border-radius: 4px;
  }

  @media (max-width: 600px) {
    mat-card img {
      width: 100%;
      height: auto;
      object-fit: cover;
      display: block;
      border-radius: 4px;
    }
  }


  `]
})
export class TrendingComponent {
  @Input() videos: VideoItem[] = [];

  constructor(private router: Router) {}


  goToVideo(videoId: string) {
    this.router.navigate(['/watch', videoId]);
  }
}
