import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ForumPageComponent } from '../../forum/forum-page.component';
import { HomeService, TestimonialInterface } from '../home.service';
import { Subscription } from 'rxjs';
import { CommunityTestimonialComponent } from './testimonial.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserInterface, UserService } from '../../common/services/user.service';
import { UpcomingEventComponent } from './upcoming-event.component';

@Component({
  selector: 'async-community',
  providers: [HomeService],
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    ForumPageComponent,
    UpcomingEventComponent,
    CommunityTestimonialComponent
  ],
  template: `
    <section class="community-section">
      <div class="section-header">
        <mat-icon class="section-icon">forum</mat-icon>
        <h2>Fan Community</h2>
      </div>

      <mat-tab-group>
        <mat-tab label="Latest Posts">
          <div class="posts-container">
            <app-forum-page/>
          </div>
        </mat-tab>

        <mat-tab label="Upcoming Events">
          <div class="posts-containerXX">
            <!-- <p>No upcoming events at this time. Check back later!</p> -->
             <community-upcoming-event/>
          </div>
        </mat-tab>

        <mat-tab label="Top Fans">
          <div class="posts-containerXX">
            <p>Top fans leaderboard coming soon!</p>
          </div>
        </mat-tab>

        <mat-tab label="App Reviews">
          <div class="posts-container">
          <community-testimonial *ngIf="testimonials" [testimonials]="testimonials" [user]="user"/>
          </div>
        </mat-tab>
        
      </mat-tab-group>
    </section>
  `,
  styles: [`
    .community-section {
      padding: 28px 24px;
      margin-top: 28px;
      background: #0B0B0C;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: var(--dt-radius-sheet);
      box-shadow: 0 8px 32px rgba(0,0,0,0.45);
      overflow: hidden;
      position: relative;
    }
    .community-section::before {
      content: ''; position: absolute; inset: 0 0 auto 0; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(251,113,133,0.18), transparent);
    }
    .section-header {
      display: flex; align-items: center; gap: 10px; margin-bottom: 18px;
      padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .section-icon {
      width: 32px; height: 32px; display: grid; place-items: center; border-radius: var(--dt-radius-sm);
      background: linear-gradient(135deg, #BE123C, #FB7185); color: white; font-size: 18px; box-shadow: 0 4px 16px rgba(225,29,72,0.25);
    }
    h2 { margin: 0; flex: 1; font-size: clamp(1.05rem,2vw,1.35rem); font-weight: 800; letter-spacing: -0.01em; color: #F8F7F8; }
    .posts-container {
      display: flex; flex-direction: column; gap: 14px; margin-top: 18px;
      height: 860px; overflow-y: auto; padding-right: 6px;
      scrollbar-width: thin; scrollbar-color: rgba(251,113,133,0.30) transparent;
    }
    .post-card { width: 100%; }
    :host ::ng-deep .mat-mdc-tab-group { --mdc-tab-indicator-active-indicator-color: #E11D48; }
    :host ::ng-deep .mat-mdc-tab-labels { gap: 4px; }
    :host ::ng-deep .mat-mdc-tab { border-radius: 999px; }
  `]
})
export class CommunityComponent implements OnInit, OnDestroy {

  loading = false;
  private testimonialsSubscription?: Subscription;
  private homeService = inject(HomeService);
  private cdr = inject(ChangeDetectorRef);
  testimonials: Array<TestimonialInterface> = []
  subscriptions: Subscription[] = [];

   private snackBar = inject(MatSnackBar);
   private userService = inject(UserService);
   user: UserInterface | null = null;

   ngOnInit() {

     this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
          //if (this.user ) {}
        }
      })
    )
    // load testimonial
    this.loadTestimonial();
  }


  loadTestimonial() {
    if (this.loading ) return;
    
    this.loading = true;

    this.subscriptions.push(
       this.testimonialsSubscription = this.homeService.getTestimonials().subscribe({
        next: (response) => {
          this.loading = true;
          //console.log('testimonials ',response.testimonials)
          this.testimonials = response.testimonials;
        
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          this.cdr.detectChanges();
          console.error('Error loading videos:', error);
        }
      })
    )

   
  }

   ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    if (this.testimonialsSubscription) {
      this.testimonialsSubscription.unsubscribe();
    }
  }
}
