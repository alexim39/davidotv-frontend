import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { AuthComponent } from '../auth.component';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'async-forgot-password',
  standalone: true,
  providers: [AuthService],
  imports: [
    MatButtonModule, 
    CommonModule, 
    MatIconModule, 
    RouterModule, 
    ReactiveFormsModule,
    MatCardModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatProgressSpinnerModule,
    MatDividerModule,
    MatToolbarModule
  ],
  styles: [`
    .forgot-password-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 1em;
    }

    .forgot-password-container {
      width: 100%;
      max-width: 450px;
    }

    .logo-container {
      text-align: center;
      margin-bottom: 2rem;
      img {
        height: 50px;
      }
    }

     form {
      .w-full {
        width: 100%;
      }
    }

    .mat-mdc-card {
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      padding: 2rem;
    }

    .forgot-password-title {
      font-size: 1.5rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #666;
    }

    .forgot-password-subtitle {
      color: #757575;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .button-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .submit-button {
      background-color: #8f0045;
      color: white;
      &:hover {
        background-color: #6f0036;
      }
      &:disabled {
        background-color: #c28faa;
      }
    }

    .back-button {
      color: #8f0045;
      margin-bottom: 1em;
    }

    .additional-options {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
      a {
        color: #8f0045;
        font-size: 0.9rem;
        font-weight: 500;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }

    .success-message {
      background: #e8f5e9;
      border-radius: 4px;
      padding: 1rem;
      margin-top: 1.5rem;
      color: #2e7d32;
      display: flex;
      align-items: center;
      mat-icon {
        margin-right: 0.5rem;
        font-size: 1.2em;
      }
    }

    /* Responsive design */
    @media (max-width: 600px) {
      .mat-mdc-card {
        padding: 1.5rem;
      }
    }

    @media (max-width: 400px) {
      .additional-options {
        flex-direction: column;
        gap: 0.75rem;
        align-items: center;
      }
    }
  `],
  template: `
    <section class="forgot-password-page">
      <div class="forgot-password-container">
        <mat-card>
          <div class="logo-container">
            <img src="./img/logo.png" alt="DavidoTV Logo">
          </div>

          <h2 class="forgot-password-title">Forgot Password?</h2>
          <p class="forgot-password-subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="email?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="email?.hasError('email')">Please enter a valid email</mat-error>
            </mat-form-field>

            <div class="button-container">
              <button 
                mat-raised-button 
                class="submit-button"
                type="submit" 
                [disabled]="forgotPasswordForm.invalid || loading"
              >
                <mat-spinner *ngIf="loading" diameter="20" class="spinner"/>
                <span *ngIf="!loading">Send Reset Link</span>
              </button>
              <button mat-button class="back-button" (click)="authDialog()">
                <mat-icon>arrow_back</mat-icon> Back to Sign In
              </button>
            </div>
          </form>

          <mat-divider class="my-4"></mat-divider>

          <div class="additional-options">
            <a (click)="authDialog()">Sign in with different account</a>
            <a (click)="authDialog()">Create account</a>
          </div>

          <div *ngIf="successMessage" class="success-message">
            <mat-icon>check_circle</mat-icon>
            <div>
              <strong>Reset email sent!</strong> 
              <p>Check your inbox for instructions to reset your password.</p>
            </div>
          </div>
        </mat-card>
      </div>
    </section>
  `,
})
export class ForgotPasswordComponent implements OnDestroy {
  forgotPasswordForm: FormGroup;
  loading = false;
  successMessage = false;

  private snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);
  subscriptions: Subscription[] = [];
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    //private http: HttpClient,
    private router: Router,
    private auth: AuthService,
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      this.successMessage = false;
      
      const email = this.forgotPasswordForm.value.email;

      this.subscriptions.push(
      this.auth.requestPasswordChange({email}).subscribe({
        next: (response) => {
         this.loading = false;
          this.successMessage = true;
          this.forgotPasswordForm.reset();
        // notify of success
          //this.snackBar.open(response.message, 'Ok',{duration: 3000});
          // show the sign in panel
        }, 
         error: (error: HttpErrorResponse) => {
            this.loading = false;
            this.successMessage = false;
            
            let errorMessage = 'An error occurred. Please try again later.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.status === 404) {
              errorMessage = 'No account found with this email address.';
            } else if (error.status === 429) {
              errorMessage = 'Too many requests. Please try again later.';
            }
            
            this.snackBar.open(errorMessage, 'Dismiss', {
              duration: 6000,
              panelClass: ['error-snackbar']
            });
            this.cdr.markForCheck();
          }
      })
    )
    }
  }

  authDialog() {
    this.dialog.open(AuthComponent);
    // After successful auth, set isAuthenticated to true and load user image
  }

   ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}