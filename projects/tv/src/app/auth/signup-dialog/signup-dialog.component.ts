import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { AuthApiService } from '../auth.service';
import {MatProgressBarModule} from '@angular/material/progress-bar';


@Component({
selector: 'async-signup',
providers: [AuthApiService],
imports: [RouterModule, MatIconModule, MatSlideToggleModule, MatButtonModule, CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, MatProgressBarModule],
template: `


<form [formGroup]="form" (ngSubmit)="onSignUp(form.value)" class="signup">

    <h1>Create account</h1>
    <span>Use your email to sign up</span>

    <mat-form-field appearance="outline">
        <mat-label>Last name</mat-label>
        <input matInput placeholder="Surname" formControlName="lastname">
        <mat-error *ngIf="form.get('lastname')?.hasError('required')">
            Your surname is required
        </mat-error>
        <mat-error *ngIf=" form.get('lastname')?.hasError('pattern')">
            Enter a valid surname
        </mat-error>
    </mat-form-field>

    <mat-form-field appearance="outline">
        <mat-label>First name</mat-label>
        <input matInput formControlName="firstname">
        <mat-error *ngIf="form.get('firstname')?.hasError('required')">
            Your first name is required
        </mat-error>
        <mat-error *ngIf="form.get('firstname')?.hasError('pattern')">
            Enter a valid first name
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
            Password should be minimum of 8 characters
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
  span {
    font-size: 12px;
    margin-bottom: 1em;
  }
	mat-form-field {
		width: 80%;
    
		div {
			cursor: pointer;
			mat-icon {
				font-size: 1rem;
			}
		}
	}

  .tnc {
    font-size: 0.8em;
    color: gray;
  }

  button {
    margin: 1em 0;
  }

}


`]
})
export class SignupDialogComponent implements OnInit, OnDestroy {

  signUp_hide = true;
  subscriptions: Subscription[] = [];
  form!: FormGroup;
  isSpinning = false;


  constructor(
    private thisDialogRef: MatDialogRef<AuthComponent>,
    private router: Router,
    private authAPI: AuthApiService,
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
      firstname: new FormControl('', {
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
      this.authAPI.signUp(formObject).subscribe( res => {
        // redirect to login page
        //this.router.navigate(['/login'])
        this.thisDialogRef.close()
       /*  Swal.fire({
          position: 'bottom',
          icon: 'success',
          text: 'Your account has been created',
          showConfirmButton: true,
          confirmButtonText: 'Login now',
        }).then((result) => {
          if (result.isConfirmed) {
            // show login
            this.openAuthComponent();
          } 
        }) */
      }, error => {
        this.isSpinning = false;
       /*  Swal.fire({
          position: 'bottom',
          icon: 'info',
          text: 'Server error occured, please try again',
          showConfirmButton: false,
          timer: 4000
        }); */
      })
    )
  }

  openAuthComponent() {
    this.dialog.open(AuthComponent);
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

}
