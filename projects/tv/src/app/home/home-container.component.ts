import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { NavbarComponent } from './navbar.component';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'async-home-container',
  imports: [
    CommonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    NavbarComponent,
    FooterComponent,
    RouterModule,    
  ],
  template: `
    <async-navbar (menuToggle)="toggleSidenav()"/>

    <div class="page-container">
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav 
          [mode]="(isMobile$ | async) ? 'over' : 'side'" 
          [fixedInViewport]="(isMobile$ | async)"
          [fixedTopGap]="mobileNavbarHeight"
          [(opened)]="sidenavOpen"
          class="app-sidenav"
          (keydown.escape)="sidenavOpen = false">
          
          <mat-nav-list>
            <a mat-list-item routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidenavOnMobile()">
              <mat-icon>home</mat-icon>
              <span>Home</span>
            </a>
            <a mat-list-item routerLink="/videos/trending" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"(click)="closeSidenavOnMobile()">
              <mat-icon>local_fire_department</mat-icon>
              <span>Trending</span>
            </a>
            <a mat-list-item routerLink="/official/videos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"(click)="closeSidenavOnMobile()">
              <mat-icon>play_circle</mat-icon>
              <span>Official</span>
            </a>
            <a mat-list-item routerLink="/videos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"(click)="closeSidenavOnMobile()">
              <mat-icon>music_video</mat-icon>
              <span>Videos</span>
            </a>
           <!--  <a mat-list-item routerLink="/subscriptions" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"(click)="closeSidenavOnMobile()">
              <mat-icon>subscriptions</mat-icon>
              <span>Subscriptions</span>
            </a> -->
            <mat-divider></mat-divider>
            <a mat-list-item routerLink="/library" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidenavOnMobile()">
              <mat-icon>video_library</mat-icon>
              <span>Library</span>
            </a>
            <a mat-list-item routerLink="/history" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidenavOnMobile()">
              <mat-icon>history</mat-icon>
              <span>History</span>
            </a>
            <mat-divider></mat-divider>
            <h3 matSubheader>FAN COMMUNITY</h3>
            <a mat-list-item routerLink="/groups" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidenavOnMobile()">
              <mat-icon>groups</mat-icon>
              <span>Fan Groups</span>
            </a>
            <a mat-list-item routerLink="/events" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidenavOnMobile()">
              <mat-icon>event</mat-icon>
              <span>Events</span>
            </a>
            <a mat-list-item routerLink="/store" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidenavOnMobile()">
              <mat-icon>storefront</mat-icon>
              <span>Store</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>
        
        <mat-sidenav-content class="content">
          
          <router-outlet/>
          
          <async-footer/>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    /* Variables */
    /* :root {
      --primary: #8f0045;
      --accent: #282828;
      --background: #f9f9f9;
      --desktop-sidenav-width: 240px;
      --mobile-navbar-height: 56px;
      --desktop-navbar-height: 64px;
      --mobile-breakpoint: 600px;
      --tablet-breakpoint: 960px;
    } */

    /* Main layout */
    .page-container {
      //background-color: var(--background);
      min-height: 100vh;
      margin-top: 4em;
    }

    /* Sidenav container */
    .sidenav-container {
      position: relative;
      height: 100vh;
      width: 100%;
    }

    /* Sidenav styles */
  .app-sidenav {
  width: var(--desktop-sidenav-width);
  //background-color: #fff;
  padding-top: 12px;

  mat-nav-list {
    display: flex;
    flex-direction: column;

    a {
      height: 40px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      text-decoration: none;
      gap: 24px;
      font-size: 9.5px;
      //color: #8f0045;
      transition: background-color 0.2s;

      mat-icon {
        font-size: 20px;
        width: 24px;
        height: 24px;
        //color: #606060;
        transition: color 0.2s;
        vertical-align: middle;
        margin-right: 8px;
      }

      span {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        //color: #606060;
        font-size: 14px;
        margin-top: -10px;
      }

      &:hover {
        //background-color: #f2f2f2;
      }

      &.active {
        //background-color: #e6e6e6;
        font-weight: 600;

        mat-icon {
          //color: var(--primary);
        }

        span {
          //color: var(--primary);
        }
      }
    }

    h3 {
      font-size: 11px;
      //color: #606060;
      padding: 12px 16px 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    mat-divider {
      margin: 8px 0;
    }
  }

  @media (max-width: var(--mobile-breakpoint)) {
    width: 85%;
    max-width: 300px;
  }
}


    /* Content area */
    .content {
      padding: 16px;
      min-height: calc(100vh - var(--desktop-navbar-height));
      //background-color: var(--background);

      @media (max-width: var(--mobile-breakpoint)) {
        min-height: calc(100vh - var(--mobile-navbar-height));
      }
    }

    /* Mobile-specific styles */
    @media (max-width: var(--tablet-breakpoint)) {
      .sidenav-container {
        height: auto;
        min-height: 100vh;
      }

      .app-sidenav {
        position: fixed;
        z-index: 1000;
      }

      .content {
        margin-left: 0 !important;
      }
    }


    /* Section headers */
    .section-header {
      display: flex;
      align-items: center;
      margin: 24px 16px 16px;
      
      .section-icon {
        margin-right: 8px;
        //color: var(--primary);
      }
      
      h2 {
        margin: 0;
        flex: 1;
        font-size: clamp(1rem, 2vw, 1.25rem);
        font-weight: 500;
      }
      
      .see-all {
        //color: var(--primary);
      }

      @media (max-width: var(--mobile-breakpoint)) {
        margin: 16px 8px 12px;
      }
    }


    /* Accessibility focus styles */
    button:focus-visible, a:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }


  `]
})
export class HomeContainerComponent implements OnInit, OnDestroy {
  sidenavOpen = true;
  mobileNavbarHeight = 56;
  private destroy$ = new Subject<void>();
  isMobile$!: Observable<boolean>;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    this.isMobile$ = this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.TabletPortrait,
      Breakpoints.Small
    ]).pipe(
      map(result => result.matches),
      takeUntil(this.destroy$)
    );

    this.isMobile$.subscribe(isMobile => {
      if (isMobile) {
        this.sidenavOpen = false;
      } else {
        this.sidenavOpen = true;
      }
    });
  }

  toggleSidenav() {
    this.sidenavOpen = !this.sidenavOpen;
  }

  closeSidenavOnMobile() {
    this.isMobile$.pipe(takeUntil(this.destroy$)).subscribe(isMobile => {
      if (isMobile) {
        this.sidenavOpen = false;
      }
    });
  }



  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}