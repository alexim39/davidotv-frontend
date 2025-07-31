import { Component, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { SigninDialogComponent } from './signin-dialog/signin-dialog.component';
import { SignupDialogComponent } from './signup-dialog/signup-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

// Firebase Auth imports
import { Auth, GoogleAuthProvider, signInWithPopup, UserCredential } from '@angular/fire/auth'; // Added UserCredential for type hinting
import { AuthService } from './auth.service';

@Component({
  selector: 'async-auth',
  standalone: true,
  providers: [AuthService],
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
    MatDividerModule
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
      <div class="social-auth-section">
        <mat-divider class="divider"/>
        Or sign in with
        <div class="social-buttons-sign-in" style="margin-top: 1rem;">
          <button mat-stroked-button class="social-btn google" (click)="signInWithGoogle()">
            <img src="./img/google-logo.png" width="4000" alt="Google Logo">
          </button>
         <!--  <button mat-stroked-button class="social-btn facebook" (click)="signInWithFacebook()">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook logo">
          </button> -->
         <!--  <button mat-stroked-button class="social-btn apple" (click)="signInWithApple()">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple logo">
          </button> -->
        </div>
      </div>
    </div>

    <div class="form-container sign-up-container" *ngIf="rightPanelActive">
      <async-signup />
      <!-- <div class="social-auth-section">
        <mat-divider class="divider">or sign up with</mat-divider>
        <div class="social-buttons-sign-up">
          <button mat-stroked-button class="social-btn google" (click)="signInWithGoogle()">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" width="1500" alt="Google Logo">

          </button>
          <button mat-stroked-button class="social-btn facebook" (click)="signInWithFacebook()">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook logo">
          </button>
          <button mat-stroked-button class="social-btn apple" (click)="signInWithApple()">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple logo">
          </button>
        </div>
      </div> -->
    </div>

    <!-- Hide overlay on small screens -->
    <div class="overlay-container desktop-only">
      <div class="overlay">
        <div class="overlay-panel overlay-left">
          <h1>Welcome Back!</h1>
          <p>Stay connected by signing in</p>
          <button mat-raised-button color="accent" (click)="showSignIn()">Sign in now</button>
        </div>
        <div class="overlay-panel overlay-right">
          <h1>Hello, Fan!</h1>
          <p>Sign up to stay connected</p>
          <button mat-raised-button color="accent" (click)="showSignUp()">Sign up for free</button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .container {
      position: relative;
      overflow: auto; /* Changed from hidden to visible */
      width: 800px;
      max-width: 100%;
      min-height: 520px; /* Increased from 500px to accommodate social buttons */
    }

    .form-container {
      position: absolute;
      top: 0;
      height: 100%;
      width: 50%;
      transition: all 0.6s ease-in-out;
      display: flex;
      flex-direction: column;
      justify-content: space-between; /* Distribute space evenly */
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

    .social-auth-section {
      margin-top: auto; /* Push to bottom of container */
      padding: 1rem 0;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .divider {
      width: 80%;
      margin: 1rem 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .social-buttons-sign-in, {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.75rem;
      width: 80%;
    }

    .social-buttons-sign-up {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
      width: 80%;
    }

    .social-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 16px;
      height: 40px;
      border-radius: 20px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .social-btn img {
      width: 25px;
      height: 25px;
    }

    .social-btn.google {
      border-color: #dd4b39;
      color: #dd4b39;
    }

    .social-btn.google:hover {
      color: #dd4b39;
      opacity: 0.95;
    }

    .social-btn.facebook {
      border-color: #4267B2;
      color: #4267B2;
      
    }

    .social-btn.facebook:hover {
      color: #4267B2;
      opacity: 0.95;
    }

    .social-btn.apple {
      border-color: #000000;
      color: #000000;
    }

    .social-btn.apple:hover {
      color: #000000;
      opacity: 0.95;
    }

    .mobile-toggle-buttons {
      display: none;
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
        height: auto;
        min-height: 500px;
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

      .social-buttons {
        flex-direction: column;
        width: 100%;
      }

      .social-btn {
        width: 100%;
      }

      .divider {
        width: 100%;
      }

      .social-auth-section {
        margin-top: 2rem;
        padding-bottom: 1rem;
      }
    }
  `]
})
export class AuthComponent implements OnDestroy {
  subscriptions: Subscription[] = [];
  rightPanelActive: boolean = false;
  private auth: Auth = inject(Auth);
  private apiService: AuthService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private googleProvider = new GoogleAuthProvider();

  showSignUp() {
    this.rightPanelActive = true;
  }

  showSignIn() {
    this.rightPanelActive = false;
  }

   // Google Sign-In
  async signInWithGoogle(): Promise<void> { // Made it async as signInWithPopup returns a Promise
    try {
      const result: UserCredential = await signInWithPopup(this.auth, this.googleProvider);
      // Authentication successful!
      //console.log('Google sign-in successful:', result.user);
      //this.snackBar.open('Signed in with Google!', 'Close', { duration: 3000 });
      // You might want to redirect the user or update UI state here


      this.subscriptions.push(
        this.apiService.signInWithGoogle({googleUser: result.user}).subscribe({
          next: (response) => {
            if (response.success) {
              // Save token and update user service
              localStorage.setItem('isAuthenticated', 'true');
              // Close dialog and optionally navigate
              //this.dialogRef.close();
              window.location.reload();
            }
          }
        })
      )

    } catch (error: any) { // Use 'any' or more specific AuthError type
      console.error('Google sign-in error:', error);
      let errorMessage = 'An unknown error occurred during Google sign-in.';

      if (error.code) {
        // Handle specific Firebase Auth errors
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-in window closed. Please try again.';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'Another sign-in request is already in progress.';
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage = 'An account with this email already exists using a different sign-in method.';
            break;
          default:
            errorMessage = `Sign-in error: ${error.message}`;
        }
      }
      this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
