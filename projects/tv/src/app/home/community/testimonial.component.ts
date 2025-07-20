import { CommonModule } from '@angular/common';
import {ChangeDetectorRef, Component, Input, input} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HomeService, TestimonialInterface } from '../home.service';
import { UserInterface } from '../../common/services/user.service';

/**
 * @title Indeterminate progress-bar
 */
@Component({
selector: 'community-testimonial',
imports: [MatIconModule, CommonModule, MatButtonModule],
template: `

@if(testimonials.length === 0) {

  <p style="text-align: center; color: orange; padding: 1em 0; font-weight: bold;">
    No testimonials available yet
  </p>

} @else {

  
<div class="testimonials-container">
      <div *ngFor="let testimonial of testimonials" class="testimonial-card">
        <div class="user-info">
          <img [src]="testimonial.user.avatar || 'img/avatar.png'" 
               alt="User avatar" 
               class="user-avatar"
               loading="lazy">
          <div class="user-meta">
            <div class="user-name">{{testimonial.user.name}}</div>
            <div class="user-location">
              <mat-icon class="location-icon">location_on</mat-icon>
              {{testimonial.user.country | titlecase}}, {{testimonial.user.state | titlecase}}
            </div>
            <div class="post-date">{{testimonial.updatedAt | date:'mediumDate'}}</div>
          </div>
        </div>
        
        <div class="testimonial-content">
          <p>{{testimonial.message}}</p>
        </div>
        
        <div class="engagement-bar">
          <button mat-button class="engagement-button" (click)="likeTestimonial(testimonial)">
            <mat-icon class="engagement-icon">
              {{testimonial.userReaction === 'like' ? 'thumb_up' : 'thumb_up_off_alt'}}
            </mat-icon>
            <span class="count">{{testimonial.likes || 0}}</span>
          </button>
          <button mat-button class="engagement-button" (click)="dislikeTestimonial(testimonial)">
            <mat-icon class="engagement-icon">
              {{testimonial.userReaction === 'dislike' ? 'thumb_down' : 'thumb_down_off_alt'}}
            </mat-icon>
          </button>
          <button mat-button class="engagement-button share-button" (click)="openShareMenu(testimonial)">
            <mat-icon class="engagement-icon">share</mat-icon>
            <span>Share</span>
          </button>
        </div>

       <div class="share-menu" *ngIf="testimonial.showShareMenu">
          <button mat-button (click)="shareOnTwitter(testimonial)">
            <i class="fa fa-twitter" aria-hidden="true"></i>
            Twitter
          </button>
          <button mat-button (click)="shareOnFacebook(testimonial)">
            <i class="fa fa-facebook-official" aria-hidden="true"></i>
            Facebook
          </button>
          <button mat-button (click)="shareOnLinkedIn(testimonial)">
            <i class="fa fa-linkedin" aria-hidden="true"></i>
            LinkedIn
          </button>
          <button mat-button (click)="shareOnWhatsApp(testimonial)">
            <i class="fa fa-whatsapp" aria-hidden="true"></i>
            WhatsApp
          </button>
          <button mat-button (click)="shareOnReddit(testimonial)">
            <i class="fa fa-reddit" aria-hidden="true"></i>
            Reddit
          </button>
          <!-- <button mat-button (click)="copyTestimonialLink(testimonial)">
            <mat-icon>link</mat-icon> Copy Link
          </button> -->
        </div>
      </div>
      
      <!-- <div *ngIf="testimonials.length > 5" class="load-more">
        <button mat-raised-button color="primary">Load More Testimonials</button>
      </div> -->
    </div>
}


`,
 styles: `

 .share-menu {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid #f0f0f0;
      background: #f9f9f9;
      border-radius: 0 0 8px 8px;
    }
    
    .share-menu button {
      flex: 1 0 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    /* Responsive adjustments */
    @media (max-width: 600px) {
      .share-menu button {
        flex: 1 0 100px;
        font-size: 12px;
        padding: 0 8px;
      }
    }

  .testimonials-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 16px;
    }

    .testimonial-card {
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      margin-bottom: 24px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }
    }

    .share-menu {
      display: flex;
      gap: 8px;
      padding: 8px 16px;
      border-top: 1px solid #f0f0f0;
      background: #f9f9f9;
    }


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
   @Input() testimonials!: any[];
   @Input() user!: UserInterface;

  constructor(
    private snackBar: MatSnackBar,
    private homeService: HomeService,
    private cdr: ChangeDetectorRef // Add ChangeDetectorRef
  ) {}

   likeTestimonial(testimonial: TestimonialInterface) {
    const newReaction = testimonial.userReaction === 'like' ? null : 'like';
    const previousState = { ...testimonial }; // Save previous state for rollback
    
    // Optimistic UI update
    if (testimonial.userReaction === 'like') {
      testimonial.likes--;
      testimonial.userReaction = undefined;
    } else {
      if (testimonial.userReaction === 'dislike') {
        testimonial.userReaction = 'like';
        testimonial.likes += 1;
      } else {
        testimonial.likes = (testimonial.likes || 0) + 1;
        testimonial.userReaction = 'like';
      }
    }
    
    this.cdr.markForCheck(); // Trigger change detection

    this.homeService.addReaction(this.user._id, testimonial._id, newReaction).subscribe({
      error: (err) => {
        // Rollback on error
        Object.assign(testimonial, previousState);
        this.cdr.markForCheck();
        this.snackBar.open('Failed to update reaction', 'Close', { duration: 3000 });
        console.error('Reaction update failed:', err);
      }
    });
  }

 dislikeTestimonial(testimonial: TestimonialInterface) {
    const newReaction = testimonial.userReaction === 'dislike' ? null : 'dislike';
    const previousState = { ...testimonial }; // Save previous state for rollback
    
    // Optimistic UI update
    if (testimonial.userReaction === 'dislike') {
      testimonial.userReaction = undefined;
    } else {
      if (testimonial.userReaction === 'like') {
        testimonial.likes--;
      }
      testimonial.userReaction = 'dislike';
    }
    
    this.cdr.markForCheck(); // Trigger change detection

    this.homeService.addReaction(this.user._id, testimonial._id, newReaction).subscribe({
      error: (err) => {
        // Rollback on error
        Object.assign(testimonial, previousState);
        this.cdr.markForCheck();
        this.snackBar.open('Failed to update reaction', 'Close', { duration: 3000 });
        console.error('Reaction update failed:', err);
      }
    });
  }

   openShareMenu(testimonial: any) {
      testimonial.showShareMenu = !testimonial.showShareMenu;
      // Close other open share menus
      this.testimonials.forEach(t => {
        if (t !== testimonial) t.showShareMenu = false;
      });
    }


    // Twitter sharing
    shareOnTwitter(testimonial: any) {
      const text = encodeURIComponent(`"${this.truncate(testimonial.message, 100)}" - ${testimonial.name}`);
      const url = encodeURIComponent(this.getShareUrl(testimonial));
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
      this.closeShareMenu(testimonial);
    }

    // Facebook sharing
    shareOnFacebook(testimonial: any) {
      const url = encodeURIComponent(this.getShareUrl(testimonial));
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
      this.closeShareMenu(testimonial);
    }

    // LinkedIn sharing
    shareOnLinkedIn(testimonial: any) {
      const url = encodeURIComponent(this.getShareUrl(testimonial));
      const title = encodeURIComponent(`${testimonial.name}'s Testimonial`);
      const summary = encodeURIComponent(this.truncate(testimonial.message, 200));
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
      this.closeShareMenu(testimonial);
    }

    // WhatsApp sharing
    shareOnWhatsApp(testimonial: any) {
      const text = encodeURIComponent(`Check out this testimonial from ${testimonial.name}: "${this.truncate(testimonial.message, 100)}" ${this.getShareUrl(testimonial)}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
      this.closeShareMenu(testimonial);
    }

    // Reddit sharing
    shareOnReddit(testimonial: any) {
      const url = encodeURIComponent(this.getShareUrl(testimonial));
      const title = encodeURIComponent(`Testimonial from ${testimonial.name}`);
      window.open(`https://www.reddit.com/submit?url=${url}&title=${title}`, '_blank');
      this.closeShareMenu(testimonial);
    }

    // Copy link functionality
    copyTestimonialLink(testimonial: any) {
      navigator.clipboard.writeText(this.getShareUrl(testimonial))
        .then(() => {
          this.snackBar.open('Link copied to clipboard!', 'Close', { duration: 3000 });
          this.closeShareMenu(testimonial);
        });
    }

    // Helper methods
    private getShareUrl(testimonial: any): string {
      return `${window.location.origin}`;
      //return `${window.location.origin}/testimonials/${testimonial.id || 'testimonial'}`;
    }

    private truncate(text: string, length: number): string {
      return text.length > length ? text.substring(0, length) + '...' : text;
    }

    private closeShareMenu(testimonial: any) {
      testimonial.showShareMenu = false;
    }
}
