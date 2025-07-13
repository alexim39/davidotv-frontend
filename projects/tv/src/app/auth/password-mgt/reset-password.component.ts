import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators, 
  AbstractControl,
  ValidationErrors,
  ValidatorFn 
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AuthComponent } from '../auth.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'async-reset-password',
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
    MatDividerModule
  ],
  styles: [`
    .reset-password-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 1em;
    }

    .mat-mdc-card {
      width: 100%;
      max-width: 450px;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
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

    .reset-password-title {
      font-size: 1.5rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #666;
    }

    .reset-password-subtitle {
      color: #666;
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

    .password-strength {
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: #757575;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      .strength-bar {
        flex-grow: 1;
        height: 4px;
        background: #e0e0e0;
        border-radius: 2px;
        overflow: hidden;
        .fill {
          height: 100%;
          transition: width 0.3s, background 0.3s;
        }
      }
    }

    .weak {
      width: 33%;
      background: #ff5252;
    }
    .medium {
      width: 66%;
      background: #ffab40;
    }
    .strong {
      width: 100%;
      background: #4caf50;
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
      }
    }

    @media (max-width: 600px) {
      .mat-mdc-card {
        padding: 1.5rem;
      }
    }
  `],
  template: `
    <section class="reset-password-page">
      <mat-card>
        <div class="logo-container">
          <img src="./img/logo.png" alt="DavidoTV Logo">
        </div>

        <h2 class="reset-password-title">Change Password</h2>
        <p class="reset-password-subtitle">
          Create a new password for your DavidoTV account. Make sure it's strong and unique.
        </p>

        <form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>New Password</mat-label>
            <input 
              matInput 
              [type]="hidePassword ? 'password' : 'text'" 
              formControlName="password"
              required
              (input)="checkPasswordStrength()"
            >
            <button 
              mat-icon-button 
              matSuffix
              type="button"
              (click)="hidePassword = !hidePassword"
              [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'"
            >
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="password?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="password?.hasError('minlength')">Password must be at least 6 characters</mat-error>
          </mat-form-field>

          <div *ngIf="password?.valid" class="password-strength">
            <span>Strength:</span>
            <div class="strength-bar">
              <div class="fill" [ngClass]="passwordStrengthClass"></div>
            </div>
            <span>{{passwordStrengthText}}</span>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Confirm Password</mat-label>
            <input 
              matInput 
              [type]="hideConfirmPassword ? 'password' : 'text'" 
              formControlName="confirmPassword"
              required
            >
            <button 
              mat-icon-button 
              matSuffix
              type="button"
              (click)="hideConfirmPassword = !hideConfirmPassword"
              [attr.aria-label]="hideConfirmPassword ? 'Show password' : 'Hide password'"
            >
              <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="confirmPassword?.errors?.['passwordMismatch']">Passwords don't match</mat-error>
          </mat-form-field>

          <div class="button-container">
            <button 
              mat-raised-button 
              class="submit-button"
              type="submit" 
              [disabled]="changePasswordForm.invalid || loading"
            >
              <mat-spinner *ngIf="loading" diameter="20" class="spinner"></mat-spinner>
              <span *ngIf="!loading">Change Password</span>
            </button>
            <button mat-button class="back-button" (click)="authDialog()">
              <mat-icon>arrow_back</mat-icon> Back to Sign in
            </button>
          </div>
        </form>

        <mat-divider class="my-4"></mat-divider>

        <div *ngIf="successMessage" class="success-message">
          <mat-icon>check_circle</mat-icon>
          <div>
            <strong>Password changed successfully!</strong> 
            <p>You can now sign in with your new password.</p>
          </div>
        </div>
      </mat-card>
    </section>
  `,
})
export class ResetPasswordComponent implements OnDestroy {
  changePasswordForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  passwordStrength = 0;
  passwordStrengthText = '';
  passwordStrengthClass = '';
  successMessage = false;

  private snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
  ) {
    this.changePasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }


  get password() {
    return this.changePasswordForm.get('password');
  }

  get confirmPassword() {
    return this.changePasswordForm.get('confirmPassword');
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  checkPasswordStrength() {
    const password = this.password?.value;
    if (!password) {
      this.passwordStrength = 0;
      return;
    }

    let strength = 0;
    if (password.length > 8) strength++;
    if (password.length > 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    this.passwordStrength = Math.min(strength, 3);
    
    switch(this.passwordStrength) {
      case 0:
      case 1:
        this.passwordStrengthText = 'Weak';
        this.passwordStrengthClass = 'weak';
        break;
      case 2:
        this.passwordStrengthText = 'Medium';
        this.passwordStrengthClass = 'medium';
        break;
      case 3:
        this.passwordStrengthText = 'Strong';
        this.passwordStrengthClass = 'strong';
        break;
    }
  }

  onSubmit() {
    if (this.changePasswordForm.valid) {
      this.loading = true;
      this.successMessage = false;
      
      const password = this.changePasswordForm.value.password;
      const token = this.route.snapshot.queryParams['token'];
      const payload = { password, token };

      this.subscriptions.push(
        this.auth.resetPassword(payload).subscribe({
          next: (response) => {
            this.loading = false;
            this.successMessage = true;
            this.changePasswordForm.reset();
            
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 5000);
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            
            let errorMessage = 'An error occurred. Please try again later.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.status === 400) {
              errorMessage = 'Invalid or expired token. Please request a new password reset.';
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