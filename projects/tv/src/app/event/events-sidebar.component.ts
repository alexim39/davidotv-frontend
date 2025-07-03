import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Subscription } from 'rxjs';
import { EventService } from './event.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Event } from './event.model'
import { UserInterface, UserService } from '../common/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-events-sidebar',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="events-sidebar">
      <!-- Your Events Section -->
     <mat-card class="sidebar-section">
    <mat-card-header>
      <mat-card-title>Events Your Are Interested</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <br>
      @if (currentUser) {
       <mat-card class="sidebar-section">
  <mat-card-header>
    <!-- <mat-card-title>
      <mat-icon color="primary" style="vertical-align: middle;">star</mat-icon>
      <span class="interest-title">Interested Events</span>
    </mat-card-title> -->
  </mat-card-header>
  <mat-card-content>
    <ng-container *ngIf="interestedEventloader; else interestedList">
      <div class="interested-loader">
        <mat-spinner diameter="28"></mat-spinner>
        <span>Loading your interested events...</span>
      </div>
    </ng-container>
    <ng-template #interestedList>
      <mat-list class="scroll-list" *ngIf="interestedEvents.length > 0; else noInterested">
        <mat-list-item *ngFor="let event of interestedEvents">
          <!-- <mat-icon mat-list-icon color="accent">event</mat-icon> -->
          <div class="event-info">
            <div class="event-title">{{ event.title }}</div>
            <div class="event-location" *ngIf="event.location">
              <mat-icon inline fontSize="5" color="primary">location_on</mat-icon>
              <span>{{ event.location }}</span>
            </div>
          </div>
        </mat-list-item>
      </mat-list>
      <ng-template #noInterested>
        <div class="no-interested-message">
          <mat-icon color="warn">info</mat-icon>
          You have not shown interest in any event yet.
        </div>
      </ng-template>
    </ng-template>
  </mat-card-content>
</mat-card>
      } @else {
         <div class="not-signed-in-message">
          <mat-icon color="warn">info</mat-icon>
          Sign in to view your events.
        </div>
      }
    </mat-card-content>
  </mat-card>

      <!-- Friends Going Section -->
      <!-- <mat-card class="sidebar-section">
        <mat-card-header>
          <mat-card-title>Friends Attending</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="friends-list">
            <div class="friend" *ngFor="let friend of friendsGoing">
              <img [src]="friend.avatar" [alt]="'Profile picture of ' + friend.name" width="40" height="40">
              <span>{{friend.name}}</span>
            </div>
          </div>
          <button mat-button color="primary" class="view-all">View All ({{friendsGoing.length}})</button>
        </mat-card-content>
      </mat-card> -->

      <!-- Trending Section -->
      <mat-card class="sidebar-section">
        <mat-card-header>
          <mat-card-title>Trending in Davidotv</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list style="max-height: 500px; overflow-y: auto;">
            <mat-list-item *ngFor="let event of trendingEvents" style="padding: 1em 0;">
              <div mat-line>{{event.title}}</div>
              <div mat-line>{{event.attendees | number}} {{event.attendees === 1 ? 'fan' : 'fans'}} going</div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .events-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      
      .sidebar-section {
        mat-card-header {
          mat-card-title {
            font-size: 1.1rem;
            font-weight: 500;
            color: #8f0045; /* Primary color */
          }
        }
        
        mat-card-content {
          padding: 0 16px 16px;
          
          mat-nav-list {
            padding: 0;
            display: flex-wrap;
          }
           .event-card {
            //padding-left: 1em;
            display: flex;
            flex-direction: column;
            mat-list-item {
              width: 100%;
              mat-icon {
                font-size: 22px;
                text-align: center;
              }
            }
          }
        }
        
        .friends-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
          
          .friend {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 60px;
            
            img {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              object-fit: cover;
              margin-bottom: 0.25rem;
              border: 2px solid #f5f5f5;
            }
            
            span {
              font-size: 0.7rem;
              text-align: center;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
            }
          }
        }
        
        .view-all {
          width: 100%;
          margin-top: 0.5rem;
        }
        
        mat-list-item {
          height: auto;
          padding: 0;
          
          [mat-line] {
            font-size: 0.9rem;
            
            &:nth-child(2) {
              color: rgba(161, 161, 161, 0.6);
              font-size: 0.8rem;
            }
          }
        }
       
      }
    }

  .not-signed-in-message {
    text-align: center;
    //color: #8f0045;
    margin: 1rem 0;
    font-size: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .interested-list {
  list-style: none;
  margin: 0;
  padding-left: 0;
  li {
    display: flex;
   // align-items: center;
    padding: 0.2em 0;
    font-size: 0.8em;
    .event-dot {
      font-size: 0.8em;
      margin-right: 0.5em;
      //vertical-align: middle;
    }
    .event-title {
      //font-weight: 500;
      color: #8f0045;
      margin-right: 0.3em;
    }
    .event-location {
      color: #888;
      font-size: 0.75em;
    }
  }
}

.interest-title {
  font-size: 1.08rem;
  font-weight: 600;
  //color: #8f0045;
  margin-left: 0.5em;
  vertical-align: middle;
}

.scroll-list {
  max-height: 220px;
  overflow-y: auto;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(140,0,69,0.04);
}

mat-list-item {
  border-bottom: 1px solid #8f0045;
  
  &:last-child {
    border-bottom: none;
  }
  .event-info {
    display: flex;
    flex-direction: column;
    margin-left: 0.5em;
    padding: 1em 0;
    .event-title {
      font-weight: 500;
      //color: #8f0045;
      font-size: 1em;
    }
    .event-location {
      display: flex;
      align-items: center;
      font-size: 0.92em;
      color: #888;
      mat-icon {
        margin-right: 0.2em;
        font-size: 1em;
      }
    }
  }
}

.interested-loader {
  display: flex;
  align-items: center;
  gap: 0.7em;
  color: #8f0045;
  font-size: 1em;
  margin: 1em 0;
  justify-content: center;
}

.no-interested-message {
  display: flex;
  align-items: center;
  gap: 0.5em;
  color: #8f0045;
  font-size: 1em;
  margin: 1em 0;
  justify-content: center;
  mat-icon {
    color: #f44336;
    font-size: 1.2em;
  }
}
  `]
})
export class EventsSidebarComponent implements OnInit, OnDestroy {
  userEvents = {
    attending: 3,
    interested: 5,
    past: 12
  };
  
  /* friendsGoing = [
    { name: 'Ade', avatar: '/img/avatar.png' },
    { name: 'Bola', avatar: '/img/avatar.png' },
    { name: 'Chioma', avatar: '/img/avatar.png' },
    { name: 'Dayo', avatar: '/img/avatar.png' },
    { name: 'Emeka', avatar: '/img/avatar.png' },
    { name: 'Funke', avatar: '/img/avatar.png' }
  ] */;
  
  interestedEvents: { title: string; location: string }[] = []

  trendingEvents: { title: string; attendees: number }[] = [
    /* { name: 'Davido Live in Lagos', attendees: 12500 },
    { name: 'Fan Meetup NYC', attendees: 850 },
    { name: 'Album Listening Party', attendees: 3200 },
    { name: 'Birthday Celebration', attendees: 5400 } */
  ];

  loading = false;
  interestedEventloader = false;
  subscriptions: Subscription[] = [];
  private eventService = inject(EventService)
  private cd = inject(ChangeDetectorRef)
  currentUser: UserInterface | null = null;
  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);

  ngOnInit(): void {
    this.getCurrentUser();
    this.geTrendingEvents();
    
  }

   private getCurrentUser() {
     this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.currentUser = user;
          //console.log('current user ',this.currentUser)
          this.geInterestedEvents();
        }
      })
    )
  } 

  private geTrendingEvents(): void {
    this.loading = true;
    this.cd.detectChanges();

    this.subscriptions.push(
      this.eventService.getTrendingEvents().subscribe({
        next: (response) => {
          this.trendingEvents = (response.data || []).map((e: Event) => ({
           // name: e.interestedUsers?.[0]?.user?.name,
            title: e.title,
            attendees: e.interestedUsers?.length,
            id: e._id, 
          }));
          //console.log('Trending Events:', response);
          this.loading = false;
          this.cd.detectChanges();
        },
        error: (eror: HttpErrorResponse) => {
          this.trendingEvents = [];
          this.loading = false;
          this.cd.detectChanges();
        }
      })
    );
  }

  private geInterestedEvents(): void {
    this.interestedEventloader = true;
    this.cd.detectChanges();

    if (this.currentUser) {
      this.subscriptions.push(
        this.eventService.getInterestedEvents(this.currentUser?._id).subscribe({
          next: (response) => {
            this.interestedEvents = (response.data || []).map((e: Event) => ({
            // name: e.interestedUsers?.[0]?.user?.name,
              title: e.title,
              location: e.location
            }));
            //console.log('Interested Events:', response);
            this.interestedEventloader = false;
            this.cd.detectChanges();
          },
          error: (eror: HttpErrorResponse) => {
            this.trendingEvents = [];
            this.interestedEventloader = false;
            this.cd.detectChanges();
          }
        })
      );
    }
  }


  

  

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}