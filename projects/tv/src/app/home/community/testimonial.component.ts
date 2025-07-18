import { CommonModule } from '@angular/common';
import {Component, Input, input} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * @title Indeterminate progress-bar
 */
@Component({
selector: 'community-testimonial',
imports: [MatIconModule, CommonModule, MatButtonModule],
template: `

<div class="testimonials-container">
  <div *ngFor="let testimonial of testimonials" class="testimonial-card">
    <div class="user-info">
      <img [src]="testimonial.avatar || 'assets/default-avatar.png'" 
           alt="User avatar" 
           class="user-avatar"
           loading="lazy">
      <div class="user-meta">
        <div class="user-name">{{testimonial.name}}</div>
        <div class="user-location">
          <mat-icon class="location-icon">location_on</mat-icon>
          {{testimonial.country}}, {{testimonial.state}}
        </div>
        <div class="post-date">{{testimonial.updatedAt | date:'mediumDate'}}</div>
      </div>
    </div>
    
    <div class="testimonial-content">
      <p>{{testimonial.message}}</p>
    </div>
    
    <div class="engagement-bar">
      <button mat-button class="engagement-button">
        <mat-icon class="engagement-icon">thumb_up</mat-icon>
        <span class="count">{{testimonial.likes || 0}}</span>
      </button>
      <button mat-button class="engagement-button">
        <mat-icon class="engagement-icon">thumb_down</mat-icon>
      </button>
     <!--  <button mat-button class="engagement-button">
        <mat-icon class="engagement-icon">comment</mat-icon>
        <span class="count">{{testimonial.comments || 0}}</span>
      </button> -->
      <button mat-button class="engagement-button share-button">
        <mat-icon class="engagement-icon">share</mat-icon>
        <span>Share</span>
      </button>
    </div>
    
    <div *ngIf="testimonial.comments > 0" class="view-comments">
      <button mat-button>View {{testimonial.comments}} comments</button>
    </div>
  </div>
  
  <div *ngIf="testimonials.length > 5" class="load-more">
    <button mat-raised-button color="primary">Load More Testimonials</button>
  </div>
</div>

`,
 styles: `

 .testimonials-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}

.testimonial-card {
  //background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
}

.user-info {
  display: flex;
  align-items: center;
  padding: 16px 16px 0 16px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
  border: 2px solid #f0f0f0;
}

.user-meta {
  flex: 1;
}

.user-name {
  font-weight: 500;
  font-size: 16px;
  //color: #0f0f0f;
}

.user-location {
  display: flex;
  align-items: center;
  font-size: 12px;
  //color: #606060;
  margin-top: 2px;
  
  .location-icon {
    font-size: 14px;
    margin-right: 4px;
  }
}

.post-date {
  font-size: 12px;
  //color: #909090;
  margin-top: 2px;
}

.testimonial-content {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  //color: #0f0f0f;
  
  p {
    margin: 0;
  }
}

.engagement-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid #f0f0f0;
}

.engagement-button {
  display: flex;
  align-items: center;
  //color: #606060;
  font-size: 13px;
  margin-right: 8px;
  
  .engagement-icon {
    font-size: 18px;
    margin-right: 6px;
  }
  
  .count {
    font-size: 12px;
  }
}

.share-button {
  margin-left: auto;
  margin-right: 0;
}

.view-comments {
  padding: 8px 16px;
  border-top: 1px solid #f0f0f0;
  
  button {
    color: #065fd4;
    font-size: 13px;
  }
}

.load-more {
  text-align: center;
  margin: 24px 0;
  
  button {
    font-weight: 500;
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .testimonials-container {
    padding: 8px;
  }
  
  .testimonial-card {
    margin-bottom: 16px;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
  }
  
  .user-name {
    font-size: 15px;
  }
  
  .testimonial-content {
    font-size: 13px;
    padding: 10px 12px;
  }
  
  .engagement-button {
    font-size: 12px;
    
    .engagement-icon {
      font-size: 16px;
    }
  }
}
`
})
export class CommunityTestimonialComponent {
    @Input() testimonials!: any;
}
