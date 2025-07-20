import {ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TestimonialWriteupSettingsComponent } from './testimonial-writeup/testimonial-writeup.component';
import { UserInterface } from '../../common/services/user.service';
import { HelpDialogComponent } from '../../common/help-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { AppReviewService } from './app-review.service';
import { TestimonialInterface } from '../../home/home.service';

@Component({
  selector: 'async-review-setting',
  standalone: true,
  providers: [AppReviewService],
  imports: [
    MatTabsModule, 
    RouterModule, 
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    TestimonialWriteupSettingsComponent,
    MatCardModule
  ],
  template: `
  <div class="social-settings-container">
    <div class="social-settings-header">
      <div class="breadcrumb">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="scrollToTop()">
          <mat-icon>home</mat-icon> Dashboard
        </a>
        <mat-icon>chevron_right</mat-icon>
        <a>Settings</a>
        <mat-icon>chevron_right</mat-icon>
        <a>Account Settings</a>
        <mat-icon>chevron_right</mat-icon>
        <span class="current">Social Media</span>
      </div>

      <div class="header-main">
        <h1>
          <mat-icon class="social-icon">share</mat-icon>
          Social Media Settings
          <button mat-icon-button class="help" (click)="showDescription()" matTooltip="Help">
            <mat-icon>help_outline</mat-icon>
          </button>
        </h1>
        <p>Connect and manage your social media presence</p>
      </div>
    </div>

    <div class="settings-content">
      <div class="settings-nav">
        <button mat-raised-button routerLink="../account" routerLinkActive="active" (click)="scrollToTop()">
          <mat-icon>account_circle</mat-icon> Account Settings
        </button>
      </div>

      <div class="social-settings-content">
        <mat-card class="settings-card">
          <mat-tab-group animationDuration="200ms">
            <mat-tab label="Testimonial">
              <div class="tab-content">
                <async-testimonial-writeup-settings 
                  *ngIf="user" 
                  [user]="user" 
                  [testimonial]="testimonial"
                  [isLoading]="isLoading"
                  [error]="error"
                />
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      </div>
    </div>
  </div>
  `,
  styles: [`
  .social-settings-container {
    //background-color: #f9f9f9;
    min-height: 100vh;
    padding: 0;
  }

  .social-settings-header {
    //background-color: white;
    padding: 16px 24px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    border-bottom: 1px solid #e5e5e5;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #606060;
    margin-bottom: 16px;

    a {
      display: flex;
      align-items: center;
      color: #606060;
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: #8f0045;
      }

      mat-icon {
        font-size: 18px;
        height: 18px;
        width: 18px;
        margin-right: 4px;
      }
    }

    mat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
      margin: 0 4px;
      color: #909090;
    }

    .current {
      color: #8f0045;
      font-weight: 500;
    }
  }

  .header-main {
    h1 {
      display: flex;
      align-items: center;
      margin: 0;
      font-size: 24px;
      font-weight: 500;
      //color: #030303;

      .social-icon {
        color: #8f0045;
        margin-right: 12px;
      }

      .help {
        margin-left: 12px;
        color: #606060;
      }
    }

    p {
      margin: 4px 0 0;
      color: #606060;
      font-size: 14px;
    }
  }


  .settings-content {
    max-width: 1200px;
    margin: 24px auto;
    padding: 0 24px;
  }

  .settings-nav {
    margin-bottom: 24px;

    button {
      //background-color: white;
      color: #8f0045;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      padding: 8px 16px;
      font-weight: 500;
      display: flex;
      align-items: center;

      mat-icon {
        margin-right: 8px;
      }

      &:hover {
        background-color: rgba(143, 0, 69, 0.04);
      }
    }
  }


  .social-settings-content {
    max-width: 1200px;
    margin: 24px auto;
    padding: 0 24px;
  }

  .settings-card {
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    overflow: hidden;

    ::ng-deep .mat-tab-group {
      .mat-tab-header {
        border-bottom: none;
        //background-color: white;
      }

      .mat-tab-label {
        height: 48px;
        font-weight: 500;
        color: #606060;
        opacity: 1;

        &:hover {
          color: #8f0045;
        }
      }

      .mat-tab-label-active {
        color: #8f0045;
      }

      .mat-ink-bar {
        background-color: #8f0045;
        height: 3px;
      }

      .mat-tab-body-content {
        padding: 24px;
      }
    }

    .tab-content {
      padding: 16px 0;
    }
  }

  @media (max-width: 768px) {
    .social-settings-content {
      padding: 0 16px;
    }

    .header-main h1 {
      font-size: 20px;
    }
  }
  `]
})
export class AppReviewSettingComponent implements OnInit, OnDestroy {
  @Input() user!: UserInterface;
  readonly dialog = inject(MatDialog);
  subscriptions: Subscription[] = [];
  private cdr = inject(ChangeDetectorRef);
  
  testimonial: TestimonialInterface | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private appReview: AppReviewService
  ) { }

  ngOnInit(): void {
    if (this.user) this.getUserTestimonial();
  }

  getUserTestimonial() {
    this.isLoading = true;
    this.error = null;
    
    this.subscriptions.push(
      this.appReview.getTestimonial(this.user._id).subscribe({
        next: (response) => {
          this.testimonial = response.data || null;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.error = 'Failed to load testimonial. Write one or try again .';
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error('Error loading testimonials:', error);
        }
      })
    );
  }
  
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showDescription() {
    this.dialog.open(HelpDialogComponent, {
      data: {help: 'In this section, you can set up your social media pages links and testimonial writeup'},
      panelClass: 'help-dialog'
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}