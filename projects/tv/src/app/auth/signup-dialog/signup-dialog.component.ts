import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthComponent } from '../auth.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthService } from '../auth.service';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthStateService } from '../../core/services/auth-state.service';
import { UserService } from '../../common/services/user.service';


@Component({
selector: 'async-signup',
providers: [AuthService],
imports: [RouterModule, MatIconModule, MatSlideToggleModule, MatButtonModule, CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, MatProgressBarModule],
template: `


<form [formGroup]="form" (ngSubmit)="onSignUp(form.value)" class="signup">

    <h1>Create account</h1>
    <span>Use your email to sign up</span>

    <mat-form-field appearance="outline">
        <mat-label>First name</mat-label>
        <input matInput formControlName="name">
        <mat-error *ngIf="form.get('name')?.hasError('required')">
            Your name is required
        </mat-error>
        <mat-error *ngIf=" form.get('name')?.hasError('pattern')">
            Enter a valid name
        </mat-error>
    </mat-form-field>

    <mat-form-field appearance="outline">
        <mat-label>Last name</mat-label>
        <input matInput formControlName="lastname">
        <mat-error *ngIf="form.get('lastname')?.hasError('required')">
            Your first name is required
        </mat-error>
        <mat-error *ngIf="form.get('lastname')?.hasError('pattern')">
            Enter a valid last name
        </mat-error>
    </mat-form-field>

    <mat-form-field appearance="outline">
        <mat-label>Email address</mat-label>
        <input matInput type="email" formControlName="email">
        <mat-error *ngIf=" form.get('email')?.hasError('email')">
            Please enter a valid email address
        </mat-error>
        <mat-error *ngIf="form.get('email')?.hasError('required')">
            Your email is required
        </mat-error>
    </mat-form-field>

    <mat-form-field appearance="outline">
        <mat-label>Password</mat-label>
        <input matInput [type]="signUp_hide ? 'password' : 'text'" formControlName="password">
        <div mat-icon-button matSuffix (click)="signUp_hide = !signUp_hide" [attr.aria-label]="'Hide password'" [attr.aria-pressed]="signUp_hide">
            <mat-icon>{{signUp_hide ? 'visibility_off' : 'visibility'}}</mat-icon>
        </div>
        <mat-error *ngIf=" form.get('password')?.hasError('pattern')">
            Password should be 8 characters min.
        </mat-error>
        <mat-error *ngIf=" form.get('password')?.hasError('required')">
            Your password is required
        </mat-error>
    </mat-form-field>

    <mat-slide-toggle color="accent" class="tnc" formControlName="tnc">Have you seen our T&C?</mat-slide-toggle>

    <button [disabled]="form.invalid || isSpinning" mat-flat-button color="accent">SIGN UP</button>

    <mat-progress-bar color="accent" mode="indeterminate" *ngIf="isSpinning"></mat-progress-bar>

</form>


`,
styles: [`

a {
	color: #FB7185;
	font-size: 13px;
  font-weight: 600;
	text-decoration: none;
	margin: 12px 0;
  &:hover { color: #F8F7F8; text-decoration: underline; text-underline-offset: 3px; }
}

form {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	height: 100%;
	text-align: center;
  background: transparent;
  color: #F8F7F8;
  h1 {
    font-size: 1.35em;
    font-weight: 800;
    letter-spacing: -0.01em;
    background: linear-gradient(135deg,#F8F7F8 0%, #FB7185 100%);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  }
  span {
    font-size: 12px;
    margin-bottom: 1em;
    color: #A1A1AA;
    letter-spacing: 0.02em;
  }
	mat-form-field {
		width: 86%;
		margin-top: 6px;
		div {
			cursor: pointer;
			mat-icon { font-size: 1rem; color: #A1A1AA; }
		}
	}

  .tnc {
    font-size: 0.8em;
    color: #A1A1AA;
    --mdc-switch-selected-handle-color: #E11D48;
    --mdc-switch-selected-track-color: rgba(225,29,72,0.35);
  }

  button[mat-flat-button] {
    margin: 14px 0 6px;
    border-radius: var(--dt-radius-pill) !important;
    background: linear-gradient(135deg,#BE123C,#FB7185) !important;
    color: white !important;
    font-weight: 700;
    height: 44px;
    padding: 0 22px !important;
    box-shadow: 0 8px 24px rgba(225,29,72,0.35);
    &:disabled { opacity: 0.55; }
  }

}


`]
})
export class SignupDialogComponent implements OnInit, OnDestroy {

  signUp_hide = true;
  subscriptions: Subscription[] = [];
  form!: FormGroup;
  isSpinning = false;

  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private authState = inject(AuthStateService);
  private userService = inject(UserService);

  constructor(
    private thisDialogRef: MatDialogRef<AuthComponent>,
    private router: Router,
    private auth: AuthService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      lastname: new FormControl('', {
        validators:
          [
            Validators.required,
            Validators.pattern('[A-Za-z]{2,80}')
          ], updateOn: 'change'
      }),
      name: new FormControl('', {
        validators:
          [
            Validators.required,
            Validators.pattern('[A-Za-z]{2,80}'),
            //this.ageValidator
          ], updateOn: 'change'
      }),
      email: new FormControl('', {
        validators:
          [
            Validators.required,
            Validators.email
          ], updateOn: 'change'
      }),
      password: new FormControl('', {
        validators:
          [
            Validators.required,
            Validators.pattern('[A-Za-z0-9!@#$%^&*()-_=+?/.>,<;:]{8,80}') // min of 8 any character lower/upper case with optionally any of attached special character or digit and mix of 80
          ], updateOn: 'change'
      }),
      tnc: new FormControl(false, {
        validators:
          [
            Validators.requiredTrue
          ]
      })
    })
  }

  onSignUp(formObject: any): void {
    this.isSpinning = true;

    this.subscriptions.push(
      this.auth.signUp(formObject).subscribe({
        next: (response) => {
          this.isSpinning = false;
          this.thisDialogRef.close()
          // FE-01: SEC-02 signup issues a session — seed the signal store too.
          if (response.user) {
            localStorage.setItem('isAuthenticated', 'true');
            this.authState.seedSession(response.user, response.token);
            // Bridge the legacy navbar (subscribes to getCurrentUser$).
            this.userService.setCurrentUser(response.user);
          }
          // notify of success
          this.snackBar.open(response.message, 'Ok',{duration: 3000});
          // show the sign in panel
        },
        // FE-01: normalized error shape {status,message,requestId}.
        error: (error: any) => {
          this.isSpinning = false;

          const errorMessage = error?.message || 'Server error occurred, please try again.';
          this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
          this.cdr.markForCheck();
        }
      })
    )
  }

  openAuthComponent() {
    this.dialog.open(AuthComponent);
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
