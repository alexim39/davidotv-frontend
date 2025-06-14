import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef  } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthComponent } from '../auth.component';
import { RouterModule, Router, } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../auth.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserInterface, UserService } from '../../common/services/user.service';


@Component({
  selector: 'async-signin',
  providers: [ AuthService ],
  imports: [RouterModule, MatIconModule, MatButtonModule, CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, MatProgressBarModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSignIn(form.value)" class="signin">
      <h1>Sign in</h1>
      <span>Use your email to sign in</span>

      <mat-form-field appearance="outline">
          <mat-label>Email address</mat-label>
          <input matInput type="email" formControlName="email">
          <mat-error *ngIf="form.get('email')?.hasError('email') && !form.get('email')?.hasError('required')">
            Please enter a valid email address
          </mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('required')">
              Your email is required
          </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline">
          <mat-label>Password</mat-label>
          <input matInput [type]="signIn_hide ? 'password' : 'text'" formControlName="password">
          <div mat-icon-button matSuffix (click)="signIn_hide = !signIn_hide" [attr.aria-label]="'Hide password'" [attr.aria-pressed]="signIn_hide">
              <mat-icon>{{signIn_hide ? 'visibility_off' : 'visibility'}}</mat-icon>
          </div>
          <mat-error *ngIf=" form.get('password')?.hasError('pattern')">
              Password should be 8 characters min.
          </mat-error>
          <mat-error *ngIf=" form.get('password')?.hasError('required')">
              Your password is required
          </mat-error>
      </mat-form-field>

      <button [disabled]="form.invalid || isSpinning" mat-flat-button color="accent">SIGN IN</button>

      <a (click)="closeDialog()" [routerLink]="['/fp']">Forgot your password?</a>

      <mat-progress-bar color="accent" mode="indeterminate" *ngIf="isSpinning"/>
    </form>
  `,
styles: [`


span {
	font-size: 12px;
}

a {
	color: #333;
	font-size: 14px;
	text-decoration: none;
	margin: 15px 0;
}

form {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	height: 100%;
	text-align: center;
  h1 {
    font-size: 1.2em;
  }
	mat-form-field {
		width: 80%;
		margin-top: 1.5em;
		div {
			cursor: pointer;
			mat-icon {
				font-size: 1rem;
			}
		}
	}
	button {
		margin-top: 1.5em;
	}
}

.social-container {
	margin: 20px 0;
	a {
		border: 1px solid #DDDDDD;
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
		background-color: #1DA1F2;
		color: white;
	}
	.facebook:hover {
		background-color: #4267B2;
		color: white;
	}
}

`]
})
export class SigninDialogComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  signIn_hide = true;
  isSpinning = false;
  subscriptions: Subscription[] = [];
  subscriptionSuccess = false;
  user: UserInterface | null = null;

  // Inject services
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<SigninDialogComponent>);
  private cdr = inject(ChangeDetectorRef);
  
  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        updateOn: 'change'
      }),
      password: new FormControl('', {
        validators: [
          Validators.required,
          Validators.pattern('[A-Za-z0-9!@#$%^&*()-_=+?/.>,<;:]{8,80}')
        ],
        updateOn: 'change'
      })
    });
  }

  onSignIn(formObject: { email: string, password: string }): void {
    this.isSpinning = true;

    this.subscriptions.push(
      this.auth.signIn(formObject).subscribe({
        next: (response) => {
          this.isSpinning = false;
           this.cdr.markForCheck(); 
          if (response.success) {
            // Save token and update user service
            localStorage.setItem('isAuthenticated', 'true');
            // Close dialog and optionally navigate
            //this.dialogRef.close();
            window.location.reload();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isSpinning = false;
           this.cdr.markForCheck(); 
          this.handleLoginFailure(error);
        }
      })
    );
  }

  private handleLoginFailure(error: HttpErrorResponse) {
    // Pass an empty user object to indicate no user is logged in
    this.userService.setCurrentUser({} as UserInterface);
    localStorage.setItem('isAuthenticated', 'false');
    let errorMessage = 'Server error occurred, please try again.'; // default error message.
    if (error.error && error.error.message) {
      errorMessage = error.error.message; // Use backend's error message if available.
    }  
    this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }  

}


