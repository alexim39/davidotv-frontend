import { Component, Input, Output, EventEmitter, HostListener, OnInit, OnChanges, ChangeDetectorRef, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { timeAgo as timeAgoUtil, formatDuration as videoDuration, formatViewCount as viewFormat } from '../../common/utils/time.util';
import { debounceTime, filter, fromEvent } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserInterface } from '../../common/services/user.service';

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
          <mat-slide-toggle [(ngModel)]="autoplay" (change)="autoplayChanged()"/>
        </div>
      </div>
      
      <div class="recommendation-list" #scrollContainer>
       <div class="recommendation-item" *ngFor="let video of recommendedVideos" (click)="navigateToVideo.emit(video.youtubeVideoId)">
          <div class="thumbnail-container">
            <img [src]="'https://i.ytimg.com/vi/' + video.youtubeVideoId + '/mqdefault.jpg'" alt="{{ video.title }}" class="thumbnail">                
            <span class="duration"> {{ formatDuration(video.duration) }}</span>
            @if ( video.isShort || (video.durationSeconds && video.durationSeconds <= 120)) {
              <div class="short-badge">SHORT</div>
            }
          </div>
          <div class="video-details">
            <h4>{{ video.title }}</h4>
            <p class="creator">{{ video.channel }}</p>
            <p class="views">{{ formatViewCount(video.views) }} views • {{ timeAgo(video.publishedAt) }} </p>
          </div>
        </div>
        
        <div *ngIf="isLoading" class="loading-more">
          <mat-spinner diameter="20"/> Loading videos!
        </div>
        
        <div *ngIf="!hasMoreVideos && recommendedVideos.length > 0" class="no-more-videos">
          No more videos to load
        </div>
      </div>
    </aside>
  `,
  styleUrls: ['./recommendations-sidebar.component.scss']
})
export class RecommendationsSidebarComponent implements OnChanges, OnInit {

  @Input() recommendedVideos: any[] = [];
  @Input() isLoading: boolean = false;
  @Input() hasMoreVideos: boolean = true;
  autoplay: boolean = false;
  @Input() currentUser: UserInterface | null = null;
  
  @Output() navigateToVideo = new EventEmitter<string>();
  @Output() loadMore = new EventEmitter<void>(); 

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  // Track the last scroll position to prevent multiple triggers
  private lastScrollPosition = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentUser'] && changes['currentUser'].currentValue) {
      this.autoplay = changes['currentUser'].currentValue.preferences?.autoplay || false;
    }
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

  autoplayChanged() {
    // send backend code to change autoplay
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

}