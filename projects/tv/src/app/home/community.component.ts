import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ForumPageComponent } from '../forum/forum-page.component';
import { EventsCarouselComponent } from '../event/events-carousel.component';

@Component({
  selector: 'async-community',
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    ForumPageComponent,
    EventsCarouselComponent
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
            <!-- <mat-card *ngFor="let post of fanPosts" class="post-card">
              <mat-card-header>
                <img mat-card-avatar [src]="post.user.avatar" alt="User avatar" loading="lazy">
                <mat-card-title>{{post.user.name}}</mat-card-title>
                <mat-card-subtitle>{{post.date | date}}</mat-card-subtitle>
              </mat-card-header>
              <img mat-card-image [src]="post.image" *ngIf="post.image" loading="lazy">
              <mat-card-content>
                <p>{{post.content}}</p>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button>
                  <mat-icon>thumb_up</mat-icon> {{post.likes}}
                </button>
                <button mat-button>
                  <mat-icon>comment</mat-icon> {{post.comments}}
                </button>
                <button mat-button>
                  <mat-icon>share</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card> -->
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
export class CommunityComponent {
  fanPosts: any[] = [
    {
      user: {
        name: 'SuperFan Ade',
        avatar: 'https://via.placeholder.com/40x40'
      },
      date: new Date(),
      content: 'Just met Davido backstage at the concert! He was so humble and took pictures with everyone #30BG',
      image: 'https://via.placeholder.com/600x300',
      likes: 245,
      comments: 32
    },
    {
      user: {
        name: 'Chioma Lover',
        avatar: 'https://via.placeholder.com/40x40'
      },
      date: new Date(Date.now() - 86400000),
      content: 'Who else is excited for the new album dropping next week? I already pre-ordered!',
      likes: 189,
      comments: 45
    }
  ];
}
