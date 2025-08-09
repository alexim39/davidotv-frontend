import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { EventService } from './event.service';
import { Event } from './event.model';
import { EventDetailDialogComponent } from './event-detail-dialog.component';
import { MobileFiltersSheetComponent } from './mobile-filters-sheet.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { EventsMapComponent } from './events-map.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { EventsSidebarComponent } from './events-sidebar.component';
import { EventsCarouselComponent } from './events-carousel.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { EventsListComponent } from './events-list.component';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-event',
  providers: [EventService],
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    MatListModule,
    MatIconModule,
    EventsMapComponent,
    MatProgressBarModule,
    MatButtonToggleModule,
    EventsSidebarComponent,
    EventsCarouselComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    EventsListComponent
  ],
  template: `
    <div class="events-page">
      <!-- Hero Banner -->
      <section class="hero-banner">
        <div class="hero-content">
          <h1 class="mat-display-2">Davido Events</h1>
          <p class="mat-subheading-2">Never miss a show. Connect with fans.</p>
          <div class="search-container">
            <mat-form-field appearance="outline">
              <mat-label>Search events</mat-label>
              <input matInput placeholder="Search by location, date...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <button mat-flat-button color="primary" class="search-button">Search</button>
          </div>
          <div class="cta-buttons">
            <!-- <button mat-flat-button color="primary">Creat Event</button> -->
            <button mat-stroked-button color="primary">Browse Eventst</button>
          </div>
        </div>
      </section>

      <!-- Featured Events Carousel -->
      <section class="featured-events">
        <h2 class="section-title">Featured Events</h2>
         
        <app-events-carousel *ngIf="featuredEvents && featuredEvents.length > 0" [events]="featuredEvents"/>
        <mat-progress-bar *ngIf="loading" mode="indeterminate"/>
      </section>

      <!-- Main Content -->
      <div class="main-content" [class.mobile]="isMobile">
        <!-- Desktop Sidebar -->
        <aside class="sidebar" *ngIf="!isMobile">
          <app-events-sidebar/>
        </aside>

        <!-- Main Events Area -->
        <main class="events-main">
          <!-- Category Filters -->
          <div class="category-filters">
            <mat-button-toggle-group [(value)]="selectedCategory" (change)="onCategoryChange($event.value)">
              <mat-button-toggle *ngFor="let category of categories" [value]="category">
                {{category}}
              </mat-button-toggle>
            </mat-button-toggle-group>

             <mat-button-toggle-group name="timeFilter" aria-label="Time Filter" 
                [(value)]="selectedTimeFilter" (change)="onTimeFilterChange($event.value)">
                <mat-button-toggle value="all">All Events</mat-button-toggle>
                <mat-button-toggle value="active">Active Events</mat-button-toggle>
                <mat-button-toggle value="past">Past Events</mat-button-toggle>
            </mat-button-toggle-group>
            
            <button mat-icon-button class="view-toggle" (click)="toggleViewMode()">
              <mat-icon>{{viewMode === 'list' ? 'map' : 'view_list'}}</mat-icon>
            </button>
          </div>

          <!-- Mobile Filters Button -->
          <button *ngIf="isMobile" mat-flat-button color="primary" class="mobile-filters-button" (click)="openMobileFilters()">
            <mat-icon>filter_list</mat-icon>
            Filters
          </button>

          <!-- Events List -->
          <div *ngIf="viewMode === 'list'">
            <!-- <mat-progress-bar *ngIf="loading" mode="indeterminate"/> -->
            
            <div class="events-grid">
              <app-events-list [category]="selectedCategory" [timeFilter]="selectedTimeFilter"/>
            </div>
          </div>
          

          <!-- Map View -->
          <div *ngIf="viewMode === 'map'" class="map-view">
            <app-events-map/>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .events-page {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      
      .hero-banner {
        background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/img/event-banner.png');
        background-size: cover;
        background-position: center;
        color: white;
        padding: 4rem 2rem;
        text-align: center;
        
        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          
          h1 {
            font-weight: 700;
            margin-bottom: 1rem;
            //color: #8f0045;
            font-size: 3.5rem;
          }
          
          .search-container {
            display: flex;
            margin: 2rem 0;
            
            mat-form-field {
              flex: 1;
              margin-right: 1rem;
              
              ::ng-deep .mat-form-field-outline {
                color: white;
              }
              
              ::ng-deep .mat-form-field-label {
                color: white;
              }
              
              input {
                color: white;
              }
            }
            
            .search-button {
              height: 56px;
            }
          }
          
          .cta-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
          }
        }
      }
      
      .featured-events {
        padding: 2rem;
        background-color:rgb(16, 8, 8, 0.2);
        //border-radius: 10px;
        //margin: 0.5em 0;
        
        .section-title {
          text-align: center;
          margin-bottom: 2rem;
          color: #8f0045;
        }
      }
      
      .main-content {
        display: flex;
        flex: 1;
        padding: 2rem;
        
        &.mobile {
          flex-direction: column;
          padding: 1rem;
        }
        
        .sidebar {
          width: 300px;
          margin-right: 2rem;
        }
        
        .events-main {
          flex: 1;
          
          .category-filters {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            
            mat-button-toggle-group {
              flex-wrap: wrap;
              gap: 0.5rem;
              
              mat-button-toggle {
                ::ng-deep .mat-button-toggle-label-content {
                  padding: 0 1rem;
                }
              }
               @media (max-width: 600px) {
                margin-bottom: 1em;
               }
            }
            
            .view-toggle {
              margin-left: 1rem;
            }
            @media (max-width: 600px) {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
          }
          
          .mobile-filters-button {
            margin-bottom: 1rem;
            width: 100%;
          }
          
          .events-grid {
           /*  display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
            background: red; */
          }
          
          .map-view {
            height: 600px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
        }
      }
    }
  `]
})
export class EventComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  featuredEvents: Event[] = [];
  categories = ['Concerts', 'Meet & Greets', 'Fan Parties', 'Online Events', 'Viewing Parties', 'Charity Events'];
  selectedCategory = 'Concerts';
  isMobile = false;
  viewMode: 'list' | 'map' = 'list';
  loading = true;

  subscriptions: Subscription[] = [];

  selectedTimeFilter: 'all' | 'active' | 'past' = 'active'; // Default to 'active'

  constructor(
    private eventService: EventService,
    public dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    private breakpointObserver: BreakpointObserver,
    private router: Router, 
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef 
  ) {
    this.breakpointObserver.observe([
      Breakpoints.Handset
    ]).subscribe(result => {
      this.isMobile = result.matches;
    });
  }

  ngOnInit(): void {
    this.getFeaturedEvents();
    this.updateViewMode();
  }

  private updateViewMode() {
    const url = this.router.url;
    this.viewMode = url.includes('map') ? 'map' : 'list';
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /* private getFeaturedEvents(): void {
    this.loading = true;
    this.cd.detectChanges();

    this.subscriptions.push(
      this.eventService.getFeaturedEvents().subscribe({
        next: (response) => {
          // Map to expected structure
          this.featuredEvents = (response.data || []).map((e: Event) => ({
            id: e._id || e._id,
            title: e.title,
            imageUrl: e.imageUrl || '/img/event-banner.png',
            date: e.date,
            location: e.location,
            externalLink: e.externalLink || '',
            description: e.description || '',
            interestedUsers: e.interestedUsers
          }));
          //console.log('featuredEvents for carousel:', response.data);
          this.loading = false;
          this.cd.detectChanges();
        },
        error: (eror: HttpErrorResponse) => {
          this.featuredEvents = [];
          this.loading = false;
          this.cd.detectChanges();
        }
      })
    );
  } */

    private getFeaturedEvents(): void {
      this.loading = true;
      this.cd.detectChanges();

      this.subscriptions.push(
          this.eventService.getFeaturedEvents().subscribe({
              next: (response) => {
                  let events = (response.data || []).map((e: Event) => ({
                      id: e._id || e._id,
                      title: e.title,
                      imageUrl: e.imageUrl || '/img/event-banner.png',
                      date: e.date,
                      location: e.location,
                      externalLink: e.externalLink || '',
                      description: e.description || '',
                      interestedUsers: e.interestedUsers
                  }));

                  // Apply time filter if not 'all'
                  if (this.selectedTimeFilter !== 'all') {
                      const now = new Date();
                      events = events.filter((event: Event) => {
                          const eventDate = new Date(event.date);
                          return this.selectedTimeFilter === 'active' 
                              ? eventDate >= now 
                              : eventDate < now;
                      });
                  }

                  this.featuredEvents = events;
                  this.loading = false;
                  this.cd.detectChanges();
              },
              error: (error: HttpErrorResponse) => {
                  this.featuredEvents = [];
                  this.loading = false;
                  this.cd.detectChanges();
              }
          })
      );
  }
  
  
  openEventDetail(event: Event): void {
    if (this.isMobile) {
      this.bottomSheet.open(EventDetailDialogComponent, {
        data: { event }
      });
    } else {
      this.dialog.open(EventDetailDialogComponent, {
        width: '800px',
        data: { event }
      });
    }
  }

  openMobileFilters(): void {
    this.bottomSheet.open(MobileFiltersSheetComponent, {
      data: {
        categories: this.categories,
        selectedCategory: this.selectedCategory
      }
    });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    console.log('Selected category:', this.selectedCategory);
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'map' : 'list';
    this.router.navigate([], {
      queryParams: { view: this.viewMode },
      queryParamsHandling: 'merge'
    });
  }

  onTimeFilterChange(filter: 'all' | 'active' | 'past'): void {
      this.selectedTimeFilter = filter;
      this.filterEvents();
  }

 private filterEvents(): void {
    const now = new Date();
    
    if (this.selectedTimeFilter === 'all') {
        // No filtering needed for 'all'
        return;
    }
    
    if (this.featuredEvents) {
        this.featuredEvents = this.featuredEvents.filter(event => {
            const eventDate = new Date(event.date);
            return this.selectedTimeFilter === 'active' 
                ? eventDate >= now 
                : eventDate < now;
        });
    }
    
    // Always reload featured events when filter changes
    this.getFeaturedEvents();
  }
  
}