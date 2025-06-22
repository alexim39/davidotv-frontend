import { Component, Input, Output, EventEmitter, HostListener, OnInit, OnChanges, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { timeAgo as timeAgoUtil, formatDuration as videoDuration, formatViewCount as viewFormat } from '../../../common/utils/time.util';
import { debounceTime, filter, fromEvent } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'async-recommendations-sidebar',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule, FormsModule, MatProgressSpinnerModule],
  template: `
    <aside class="recommendations-sidebar">
      <div class="sidebar-header">
        <h3>Up Next</h3>
        <div class="autoplay-toggle">
          <span>Autoplay</span>
          <mat-slide-toggle [(ngModel)]="autoplay" (change)="autoplayChanged.emit(autoplay)"></mat-slide-toggle>
        </div>
      </div>
      
      <div class="recommendation-list" #scrollContainer>
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
        
        <div *ngIf="isLoading" class="loading-more">
          <mat-spinner diameter="20"></mat-spinner> Loading videos!
        </div>
        
        <div *ngIf="!hasMoreVideos && recommendedVideos.length > 0" class="no-more-videos">
          No more videos to load
        </div>
      </div>
    </aside>
  `,
  styleUrls: ['./recommendations-sidebar.component.scss']
})
export class RecommendationsSidebarComponent implements OnChanges {

  @Input() recommendedVideos: any[] = [];
  @Input() isLoading: boolean = false;
  @Input() hasMoreVideos: boolean = true;
  @Input() autoplay: boolean = false;
  
  @Output() navigateToVideo = new EventEmitter<string>();
  @Output() autoplayChanged = new EventEmitter<boolean>();
  @Output() loadMore = new EventEmitter<void>(); 

    @ViewChild('scrollContainer') scrollContainer!: ElementRef;



  // Track the last scroll position to prevent multiple triggers
  private lastScrollPosition = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges() {
    this.cdr.detectChanges();
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

  ngAfterViewInit() {
    fromEvent(this.scrollContainer.nativeElement, 'scroll')
      .pipe(
        debounceTime(200),
        filter(() => this.shouldLoadMore())
      )
      .subscribe(() => this.loadMore.emit());
  }

   private shouldLoadMore(): boolean {
    if (this.isLoading || !this.hasMoreVideos) return false;
    
    const el = this.scrollContainer.nativeElement;
    const scrollThreshold = 200;
    
    return (el.scrollHeight - el.scrollTop - el.clientHeight) < scrollThreshold;
  }

 

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.isLoading || !this.hasMoreVideos) return;

    const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // More reliable threshold calculation
    const threshold = 500; // Increased from 200
    const isNearBottom = (currentScrollPosition + windowHeight) >= (documentHeight - threshold);

    if (isNearBottom && currentScrollPosition > this.lastScrollPosition) {
      this.loadMoreVideos();
    }

    this.lastScrollPosition = currentScrollPosition;
  }

  loadMoreVideos() {
    if (!this.isLoading && this.hasMoreVideos) {
      this.loadMore.emit();
    }
  }

 /*  loadMoreVideos() {
    if (!this.isLoadingMore && this.hasMoreVideos) {
      this.loadMore.emit();
    }
  } */

}