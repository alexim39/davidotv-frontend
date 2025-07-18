import {Component, inject, Input} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
//import { DarkThemeSettingsComponent } from './dark-theme/dark-theme.component';
import { CommonModule } from '@angular/common';
import { NotificationSettingsComponent } from './notification/notification.component';
import { HelpDialogComponent } from '../../common/help-dialog.component';
import { UserInterface } from '../../common/services/user.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'async-system-setting',
  standalone: true,
  imports: [MatTabsModule, RouterModule, MatCardModule, CommonModule, MatIconModule, MatButtonModule, NotificationSettingsComponent],
  template: `
  <div class="settings-container">
    <div class="settings-header">
      <div class="breadcrumb">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="scrollToTop()">
          <mat-icon>home</mat-icon> Dashboard
        </a>
        <mat-icon>chevron_right</mat-icon>
        <a>Settings</a>
        <mat-icon>chevron_right</mat-icon>
        <span class="current">System Settings</span>
      </div>

      <div class="header-main">
        <h1>
          <mat-icon class="settings-icon">settings</mat-icon>
          System Settings
          <button mat-icon-button class="help" (click)="showDescription()" matTooltip="Help">
            <mat-icon>help_outline</mat-icon>
          </button>
        </h1>
        <p>Customize your Davidotv experience</p>
      </div>
    </div>

    <div class="settings-content">
      <div class="settings-nav">
        <button mat-raised-button routerLink="../account" routerLinkActive="active" (click)="scrollToTop()">
          <mat-icon>account_circle</mat-icon> Account Settings
        </button>
      </div>

      <mat-card class="settings-card">
        <mat-tab-group animationDuration="200ms">
          <!-- <mat-tab label="Appearance">
            <async-dark-theme-settings *ngIf="user" [user]="user"/>
          </mat-tab> -->
          <mat-tab label="Notifications"> 
            <async-notification *ngIf="user" [user]="user"/>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  </div>
  `,
  styles: [`
  .settings-container {
    //background-color: #f9f9f9;
    min-height: 100vh;
    padding: 0;
  }

  .settings-header {
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

      .settings-icon {
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
  }

  @media (max-width: 768px) {
    .settings-content {
      padding: 0 16px;
    }

    .header-main h1 {
      font-size: 20px;
    }
  }
  `]
})
export class SystemSettingComponent {
  @Input() user!: UserInterface;
  readonly dialog = inject(MatDialog);

  constructor(
      private router: Router,
  ) { }
  
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showDescription() {
    this.dialog.open(HelpDialogComponent, {
      data: {help: 'In this section, you can set up your page look and feel'},
      panelClass: 'help-dialog'
    });
  }
}