import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SigninDialogComponent } from './signin-dialog/signin-dialog.component';
import { SignupDialogComponent } from './signup-dialog/signup-dialog.component';

@Component({
  selector: 'async-auth',
  imports: [
    MatToolbarModule,
    SigninDialogComponent,
    SignupDialogComponent,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  template: `
  
  
  <div class="container" [class.right-panel-active]="rightPanelActive">

  <!-- Toggle buttons on mobile -->
  <div class="mobile-toggle-buttons">
    <button mat-button color="primary" (click)="showSignIn()">Sign In</button>
    <button mat-button color="accent" (click)="showSignUp()">Sign Up</button>
  </div>

  <!-- Desktop / Mobile Shared Forms -->
  <div class="form-container sign-in-container" *ngIf="!rightPanelActive">
    <async-signin />
  </div>

  <div class="form-container sign-up-container" *ngIf="rightPanelActive">
    <async-signup />
  </div>

  <!-- Hide overlay on small screens -->
  <div class="overlay-container desktop-only">
    <div class="overlay">
      <div class="overlay-panel overlay-left">
        <h1>Welcome Back!</h1>
        <p>Stay connected by signing in</p>
        <br />
        <button mat-raised-button color="accent" (click)="showSignIn()">SIGN IN NOW</button>
      </div>
      <div class="overlay-panel overlay-right">
        <h1>Hello, Fan!</h1>
        <p>Sign up to stay connected</p>
        <br />
        <button mat-raised-button color="accent" (click)="showSignUp()">SIGN UP FOR FREE</button>
      </div>
    </div>
  </div>
</div>


  `,
  styles: [`
    .container {
      position: relative;
      overflow: hidden;
      width: 800px;
      max-width: 100%;
      min-height: 500px;
    }

    .form-container {
      position: absolute;
      top: 0;
      height: 100%;
      width: 50%;
      transition: all 0.6s ease-in-out;
    }

    .sign-in-container {
      left: 0;
      z-index: 2;
    }

    .sign-up-container {
      left: 0;
      opacity: 0;
      z-index: 1;
    }

    .container.right-panel-active .sign-in-container {
      transform: translateX(100%);
      opacity: 0;
      z-index: 1;
    }

    .container.right-panel-active .sign-up-container {
      transform: translateX(100%);
      opacity: 1;
      z-index: 2;
      animation: show 0.6s;
    }

    @keyframes show {
      0%, 49.99% {
        opacity: 0;
        z-index: 1;
      }

      50%, 100% {
        opacity: 1;
        z-index: 2;
      }
    }

    .overlay-container {
      position: absolute;
      top: 0;
      left: 50%;
      width: 50%;
      height: 100%;
      overflow: hidden;
      transition: transform 0.6s ease-in-out;
      z-index: 100;
    }

    .overlay {
      background: #8f0045;
      background: linear-gradient(to right, #8f0045, #8f0045);
      color: #ffffff;
      position: relative;
      left: -100%;
      height: 100%;
      width: 200%;
      transform: translateX(0);
      transition: transform 0.6s ease-in-out;
    }

    .container.right-panel-active .overlay-container {
      transform: translateX(-100%);
    }

    .container.right-panel-active .overlay {
      transform: translateX(50%);
    }

    .overlay-panel {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      text-align: center;
      top: 0;
      height: 100%;
      width: 50%;
      transition: transform 0.6s ease-in-out;
    }

    .overlay-left {
      transform: translateX(-20%);
    }

    .overlay-right {
      right: 0;
      transform: translateX(0);
    }

    .container.right-panel-active .overlay-left {
      transform: translateX(0);
    }

    .container.right-panel-active .overlay-right {
      transform: translateX(20%);
    }

    .social-container {
      margin: 20px 0;
    }

    .social-container a {
      border: 1px solid #ddd;
      border-radius: 50%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 40px;
      width: 40px;
    }

    .github:hover {
      background-color: #24292e;
      color: white;
    }

    .twitter:hover {
      background-color: #1da1f2;
      color: white;
    }

    .facebook:hover {
      background-color: #4267b2;
      color: white;
    }

	.mobile-toggle-buttons {
		display: none; // hidden by default
	}


@media (max-width: 768px) {
  .container {
    width: auto;
    min-height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    position: relative;
  }

  .form-container {
    width: 100%;
    position: static;
    opacity: 1 !important;
    transform: none !important;
    z-index: 1 !important;
  }

  .overlay-container,
  .overlay,
  .overlay-panel {
    display: none !important;
  }

  .mobile-toggle-buttons {
    width: 100%;
    display: flex;
    justify-content: space-around;
    margin-bottom: 1rem;
  }

  .mobile-toggle-buttons button {
    flex: 1;
    margin: 0 0.5rem;
  }

  .social-container {
    justify-content: center;
    gap: 10px;
  }
}


	
  `]
})
export class AuthComponent implements OnDestroy {
  subscriptions: Subscription[] = [];
  rightPanelActive: boolean = false;

  showSignUp() {
    this.rightPanelActive = true;
  }

  showSignIn() {
    this.rightPanelActive = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
