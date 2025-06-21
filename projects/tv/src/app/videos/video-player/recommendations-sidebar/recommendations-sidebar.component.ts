import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms'; // Add this import
import { timeAgo as timeAgoUtil, formatDuration as videoDuration, formatViewCount as viewFormat } from '../../../common/utils/time.util';

@Component({
  selector: 'async-recommendations-sidebar',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule, FormsModule], // Add FormsModule here
  template: `
    <aside class="recommendations-sidebar" *ngIf="!isLoading">
      <div class="sidebar-header">
        <h3>Up Next</h3>
        <div class="autoplay-toggle">
          <span>Autoplay</span>
          <mat-slide-toggle [(ngModel)]="autoplay" (change)="autoplayChanged.emit(autoplay)"></mat-slide-toggle>
        </div>
      </div>
      <div class="recommendation-list">
        <div class="recommendation-item" *ngFor="let video of recommendedVideos" (click)="navigateToVideo.emit(video.youtubeVideoId)">
          <div class="thumbnail-container">
            <img [src]="'https://i.ytimg.com/vi/' + video.youtubeVideoId + '/mqdefault.jpg'" alt="{{ video.title }}" class="thumbnail">                
            <span class="duration"> {{ formatDuration(video.duration) }}</span>
          </div>
          <div class="video-details">
            <h4>{{ video.title }}</h4>
            <p class="creator">{{ video.channel }}</p>
            <p class="views">{{ formatViewCount(video.views) }} views • {{ timeAgo(video.publishedAt) }} </p>
          </div>
        </div>
      </div>
    </aside>
  `,
  styleUrls: ['./recommendations-sidebar.component.scss']
})
export class RecommendationsSidebarComponent {
  @Input() recommendedVideos: any[] = [];
  @Input() isLoading: boolean = true;
  @Input() autoplay: boolean = false;
  
  @Output() navigateToVideo = new EventEmitter<string>();
  @Output() autoplayChanged = new EventEmitter<boolean>();

   timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }

  formatDuration(duration: string): string {
      return videoDuration(duration)
  }

  formatViewCount(views: number | 0): string {
    return viewFormat(views);
  }
}