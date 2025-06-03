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
  templateUrl: './signup-dialog.component.html',
  styleUrls: ['./signup-dialog.component.scss']
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
