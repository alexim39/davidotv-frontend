import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ForumPageComponent } from '../../forum/forum-page.component';
import { EventsCarouselComponent } from '../../event/events-carousel.component';
import { HomeService, TestimonialInterface } from '../home.service';
import { Subscription } from 'rxjs';
import { CommunityTestimonialComponent } from './testimonial.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserInterface, UserService } from '../../common/services/user.service';

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
    EventsCarouselComponent,
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
          <div class="events-container">
            <!-- <p>No upcoming events at this time. Check back later!</p> -->
             <app-events-carousel/>
          </div>
        </mat-tab>

        <mat-tab label="Top Fans">
          <div class="fans-container">
            <p>Top fans leaderboard coming soon!</p>
          </div>
        </mat-tab>

        <mat-tab label="App Reviews">
          <div class="fans-container">

          <community-testimonial *ngIf="testimonials" [testimonials]="testimonials" [user]="user"/>
            

          </div>
        </mat-tab>
        
      </mat-tab-group>
    </section>
  `,
  styles: [`
    .community-section {
      padding: 2rem;
      //background: #fafafa;
      margin-top: 2rem;
      border-radius: 10px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 1rem;
    }

    .section-icon {
      margin-right: 8px;
      //color: #8f0045;
    }

    
    h2 {
      margin: 0;
      flex: 1;
      font-size: clamp(1rem, 2vw, 1.25rem);
      font-weight: 500;
    }



    .posts-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .post-card {
      width: 100%;
    }
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
