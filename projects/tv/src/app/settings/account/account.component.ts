import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { PersonalInfoComponent } from './personal/personal.component';
import { ProfessionalInfoComponent } from './professional/professional.component';
import { UsernameInfoComponent } from './username/username.component';
import { PasswordChangeComponent } from './password/password.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { UserInterface } from '../../common/services/user.service';
import { HelpDialogComponent } from '../../common/help-dialog.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'async-account',
  standalone: true,
  imports: [
    PersonalInfoComponent,
    ProfessionalInfoComponent,
    UsernameInfoComponent,
    PasswordChangeComponent,
    CommonModule,  
    MatExpansionModule,  
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatCardModule
  ],
  template: `
  <div class="account-container">
    <div class="account-header">
      <div class="breadcrumb">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="scrollToTop()">
          <mat-icon>home</mat-icon> Dashboard
        </a>
        <mat-icon>chevron_right</mat-icon>
        <a>Settings</a>
        <mat-icon>chevron_right</mat-icon>
        <span class="current">Account Settings</span>
      </div>

      <div class="header-main">
        <h1>
          <mat-icon class="account-icon">account_circle</mat-icon>
          Account Settings
          <button mat-icon-button class="help" (click)="showDescription()" matTooltip="Help">
            <mat-icon>help_outline</mat-icon>
          </button>
        </h1>
        <p>Manage your Davidotv account information</p>
      </div>
    </div>

    <div class="account-content">
     <div class="account-nav">
      <button mat-raised-button routerLink="../system" routerLinkActive="active" (click)="scrollToTop()">
        <mat-icon>settings</mat-icon> System Settings
      </button>
      <!-- Add your new button here -->
      <button mat-raised-button routerLink="../share-reviews" routerLinkActive="active" (click)="scrollToTop()" style="margin-left: 8px;">
        <mat-icon>share_reviews</mat-icon> Share Reviews
      </button>
    </div>

      <mat-card class="settings-card">
        <mat-accordion>
          <mat-expansion-panel [expanded]="true">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>person</mat-icon> Personal Information
              </mat-panel-title>
            </mat-expansion-panel-header>
            <async-personal-infor *ngIf="user" [user]="user"/>
          </mat-expansion-panel>

          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>work</mat-icon> Professional Information
              </mat-panel-title>
            </mat-expansion-panel-header>
            <async-professional-info *ngIf="user" [user]="user"/>
          </mat-expansion-panel>
        
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>alternate_email</mat-icon> Username
              </mat-panel-title>
            </mat-expansion-panel-header>
            <async-username-info *ngIf="user" [user]="user"/>
          </mat-expansion-panel>
        
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>lock</mat-icon> Password
              </mat-panel-title>
            </mat-expansion-panel-header>
            <async-password-changer *ngIf="user" [user]="user"/>
          </mat-expansion-panel>
        </mat-accordion>
      </mat-card>
    </div>
  </div>
  `,
  styles: [`
  .account-container {
    min-height: 100vh;
    padding: 0;
  }

  .account-header {
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

      .account-icon {
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

  .account-content {
    max-width: 1200px;
    margin: 24px auto;
    padding: 0 24px;
  }

  .account-nav {
    display: flex;
    gap: 8px; // This adds space between buttons
    margin-bottom: 24px;

    button {
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

    ::ng-deep .mat-expansion-panel {
      box-shadow: none;
      border-radius: 0;
      border-bottom: 1px solid #e5e5e5;

      &:last-child {
        border-bottom: none;
      }

      .mat-expansion-panel-header {
        height: 64px;
        padding: 0 24px;

        .mat-content {
          align-items: center;
        }

        mat-icon {
          color: #8f0045;
          margin-right: 16px;
        }

        .mat-expansion-panel-header-title {
          font-weight: 500;
        }
      }

      .mat-expansion-panel-content {
        //background-color: #f9f9f9;
      }
    }
  }

  @media (max-width: 768px) {
    .account-content {
      padding: 0 16px;
    }

    .header-main h1 {
      font-size: 20px;
    }
  }
  `]
})
export class AccountComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  @Input() user!: UserInterface;

  disabled = true;
  status = false;

  constructor() { }

  ngOnInit() {
    // if (this.user) {
    //   //this.status = this.user.status;
    //   //this.disabled = this.user.status;
    // }
  }

  showDescription() {
    this.dialog.open(HelpDialogComponent, {
      data: {help: 'In this section, you can set up your profile details'},
      panelClass: 'help-dialog'
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}