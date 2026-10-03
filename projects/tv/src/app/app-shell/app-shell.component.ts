import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { NavbarComponent } from '../home/navbar/navbar.component';
import { FooterComponent } from '../home/footer/footer.component';
import { Router, RouterModule } from '@angular/router';
import { UserInterface, UserService } from '../common/services/user.service';
import { MatDialog } from '@angular/material/dialog';


/**
 * Persistent app shell: navbar + sidenav + footer on EVERY route.
 * Promoted from home-container (which scoped chrome to the HomeRoutes
 * subtree, leaving talent/media/store/etc. nav-less on desktop).
 * Sidenav links are the canonical 5 tabs + shelves (no duplicates).
 */
@Component({
  selector: 'async-app-shell',
  imports: [
    CommonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    NavbarComponent,
    FooterComponent,
    RouterModule,
  ],
  template: `
    <async-navbar/>

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
            <a mat-list-item routerLink="/media/trending" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidenavOnMobile()">
              <mat-icon>play_circle</mat-icon>
              <span>Watch</span>
            </a>
            <a mat-list-item routerLink="/talent" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidenavOnMobile()">
              <mat-icon>auto_awesome</mat-icon>
              <span>Talent</span>
            </a>
            <a mat-list-item routerLink="/forum" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidenavOnMobile()">
              <mat-icon>forum</mat-icon>
              <span>Community</span>
            </a>
            <a mat-list-item routerLink="/store" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidenavOnMobile()">
              <mat-icon>storefront</mat-icon>
              <span>Store</span>
            </a>

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
            <a mat-list-item routerLink="/events" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidenavOnMobile()">
              <mat-icon>event</mat-icon>
              <span>Events</span>
            </a>
            <a mat-list-item (click)="uploadContent(); closeSidenavOnMobile()" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon>computer_arrow_up</mat-icon>
              <span>Upload</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="content">

          <router-outlet/>

          @defer (on viewport) {
            <async-footer/>
          } @placeholder {
            <div class="footer-spacer" aria-hidden="true"></div>
          }
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    /* Main layout */
    .page-container {
      min-height: 100vh;
    }

    /* Sidenav container */
    .sidenav-container {
      position: relative;
      height: 100vh;
      width: 100%;
    }

    /* Sidenav styles */
  .app-sidenav {
  width: 240px;
  background-color: var(--dt-card, #1A1A1E);
  padding-top: 12px;
  border-right: 1px solid var(--dt-line, rgba(255,255,255,0.08));

  mat-nav-list {
    display: flex;
    flex-direction: column;
    margin-top: 4em;

    a {
      height: 44px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      text-decoration: none;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--dt-text-2, #C9C9D1);
      border-radius: var(--dt-radius-card, var(--dt-radius-card));
      margin: 2px 8px;
      transition: background-color 0.2s;

      mat-icon {
        font-size: 20px;
        width: 24px;
        height: 24px;
        transition: color 0.2s;
        vertical-align: middle;
        margin-right: 8px;
      }

      span {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
        margin-top: -10px;
      }

      &.active {
        background: rgba(225, 29, 72, 0.14);
        font-weight: 700;
        color: var(--dt-accent-3, #FB7185);
        mat-icon {
          color: var(--dt-accent-3, #FB7185);
        }
      }
    }

    h3 {
      font-size: 12px;
      font-weight: 700;
      color: var(--dt-text-3, #8E8E96);
      padding: 12px 16px 4px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    mat-divider {
      margin: 8px 0;
    }
  }
}


    /* Content area */
    .content {
      min-height: 100vh;
      margin-top: 4em;
    }
    .footer-spacer { min-height: 120px; }


    /* Section headers */
    .section-header {
      display: flex;
      align-items: center;
      margin: 24px 16px 16px;

      h2 {
        margin: 0;
        flex: 1;
        font-size: clamp(1rem, 2vw, 1.25rem);
        font-weight: 500;
      }
    }


    /* Accessibility focus styles */
    button:focus-visible, a:focus-visible {
      outline: 2px solid var(--dt-accent-2);
      outline-offset: 2px;
    }


  `]
})
export class AppShellComponent implements OnInit, OnDestroy {
  sidenavOpen = true;
  mobileNavbarHeight = 56;
  private destroy$ = new Subject<void>();
  isMobile$!: Observable<boolean>;


  private userService = inject(UserService);
  user: UserInterface | null = null;
  subscriptions: Subscription[] = [];
  isAuthenticated = false;
  private router = inject(Router);
  readonly dialog = inject(MatDialog);

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

    // Only revalidate when a session flag exists — an unconditional call
    // 401s for logged-out visitors, and the error interceptor then yanks
    // them off home to /auth. Matches the navbar pattern.
    if (localStorage.getItem('isAuthenticated') === 'true') {
      this.subscriptions.push(
        this.userService.getUser().subscribe({
          next: (response) => {
            if (response.success) {
              this.userService.setCurrentUser(response.user);
              this.isAuthenticated = true;
            }
          }
        })
      );
    }
  }

  closeSidenavOnMobile() {
    this.isMobile$.pipe(takeUntil(this.destroy$)).subscribe(isMobile => {
      if (isMobile) {
        this.sidenavOpen = false;
      }
    });
  }

   async authDialog() {
      // Dynamic import: AuthComponent pulls Firebase + signin/signup dialogs.
      const { AuthComponent } = await import('../auth/auth.component');
      this.dialog.open(AuthComponent);
      // After successful auth, set isAuthenticated to true and load user image
    }


  uploadContent(): void {
    if (this.isAuthenticated) {
      this.router.navigateByUrl('/talent/upload');
    } else {
      this.authDialog();
    }
  }

  chatRoom(): void {
    if (this.isAuthenticated) {
      this.router.navigateByUrl('chat');
    } else {
      this.authDialog();
    }
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
