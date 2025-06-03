import { Component, OnInit, OnDestroy  } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthComponent } from '../auth.component';
import { RouterModule, Router, } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthApiService } from '../auth.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@Component({
  selector: 'async-signin',
  providers: [ AuthApiService ],
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
              Password should be minimum of 8 characters
          </mat-error>
          <mat-error *ngIf=" form.get('password')?.hasError('required')">
              Your password is required
          </mat-error>
      </mat-form-field>

      <button [disabled]="form.invalid || isSpinning" mat-flat-button color="accent">SIGN IN</button>

      <a (click)="closeDialog()" [routerLink]="['/fp']">Forgot your password?</a>

      <mat-progress-bar color="accent" mode="indeterminate" *ngIf="isSpinning"></mat-progress-bar>
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

  signIn_hide = true;
  subscriptions: Subscription[] = [];
  form!: FormGroup;
  isSpinning: boolean = false;
  currentRouteCourseId = ''


  constructor(
    private thisDialogRef: MatDialogRef<AuthComponent>,
    private router: Router,
    private authAPI: AuthApiService,
  ) {}


  ngOnInit(): void {
    // check current route of user
    const parts = this.router.url.split('/');
    this.currentRouteCourseId = parts[parts.length - 1]; // This will print "64f1a27ce709366c3d55e247"

    this.form = new FormGroup({
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
      })
    })
  }

  onSignIn(formObject: { email: string, password: string }): void {
    this.isSpinning = true;

    this.subscriptions.push(
      this.authAPI.signIn(formObject).subscribe(res => {

        if (this.currentRouteCourseId.length === 24) {
          // user viewing from course detail page
          // may be user is already logged
          
          this.closeDialog();
          this.isSpinning = false;
          this.router.navigate([`/portal/courses/details/${this.currentRouteCourseId}`]);
          
        } else {
          this.closeDialog();
          this.isSpinning = false;
          this.router.navigate(['/portal']);
        }

      }, error => {
        this.isSpinning = false;
        if (error.code == 404) {// user not found
         /*  Swal.fire({
            position: 'bottom',
            icon: 'warning',
            text: "Check your email or password",
            showConfirmButton: false,
            timer: 4000
          }); */
        }
        if (error.code == 400) {// invalid credentail
         /*  Swal.fire({
            position: 'bottom',
            icon: 'warning',
            text: "Check your email or password",
            showConfirmButton: false,
            timer: 4000
          }); */
        }
      })
    )
  }


  closeDialog(): void {
    // close dialog
    this.thisDialogRef.close()
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }  

}


