import { Component, OnInit, OnDestroy } from '@angular/core';
// declare jquery as any
declare const $: any;
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
imports: [MatToolbarModule, SigninDialogComponent, SignupDialogComponent, RouterModule, MatIconModule, MatButtonModule, CommonModule, ReactiveFormsModule, FormsModule],
template: `


<div class="container" [class.right-panel-active]="rightPanelActive">

        <!-- Desktop -->
        <div class="form-container sign-up-container">
            <async-signup/>
        </div>
        <div class="form-container sign-in-container">
            <async-signin/>
        </div>
        <div class="overlay-container">
            <div class="overlay">
                <div class="overlay-panel overlay-left">
                    <h1>Welcome Back!</h1>
                    <p>To keep connected with us please sign in your info</p>
                    <br>
                    <button mat-raised-button color="accent" (click)="showSignIn()">SIGN IN NOW</button>
                </div>
                <div class="overlay-panel overlay-right">
                    <h1>Hello, Friend!</h1>
                    <p>Enter your details and start journey with us</p>
                    <br>
                    <button mat-raised-button color="accent" (click)="showSignUp()">SIGN UP FOR FREE</button>
                </div>
            </div>
        </div>

  <!-- Mobile -->
    <!-- <section *ngIf="deviceXs">

        <div fxLayout.xs="column" fxLayoutGap="2rem" *ngIf="!toggle">
            <async-signin></async-signin>
            <button mat-button color="accent" (click)="toggleAuth()">SIGN UP FOR FREE</button>
        </div>

        <div fxLayout.xs="column" fxLayoutGap="2rem" *ngIf="toggle">
            <async-signup></async-signup>
            <button mat-button color="accent" (click)="toggleAuth()">SIGN IN NOW</button>
        </div>
    </section> -->
</div>


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
	mat-form-field {
		width: 80%;
	}
}

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
	transition: all 0.6s ease-in-out;
}

.sign-in-container {
	left: 50%;
	width: 50%;
	z-index: 2;
}

.sign-up-container {
	left: 50%;
	width: 50%;
	opacity: 0;
	z-index: 1;
}

.container.right-panel-active .sign-in-container {
	transform: translateX(-100%);
}

.container.right-panel-active .sign-up-container {
	transform: translateX(-100%);
	opacity: 1;
	z-index: 5;
	animation: show 0.6s;
}

@keyframes show {
	0%, 49.99% {
		opacity: 0;
		z-index: 1;
	}

	50%, 100% {
		opacity: 1;
		z-index: 5;
	}
}

.overlay-container {
	position: absolute;
	top: 0;
	left: 0;
	width: 50%;
	height: 100%;
	overflow: hidden;
	transition: transform 0.6s ease-in-out;
	z-index: 100;
}

.overlay {
	background: #C2185B;
	background: -webkit-linear-gradient(to right, #C2185B, #C2185B);
	background: linear-gradient(to right, #C2185B, #C2185B);
	background-repeat: no-repeat;
	background-size: cover;
	background-position: 0 0;
	color: #FFFFFF;
	position: relative;
	left: -100%;
	height: 100%;
	width: 200%;
  	transform: translateX(0);
	transition: transform 0.6s ease-in-out;
}

.container.right-panel-active .overlay-container{
	transform: translateX(100%);
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
	transform: translateX(0);
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
export class AuthComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  toggle: boolean = false;
  rightPanelActive: boolean = false;

  constructor() {}

  ngOnInit(): void {
    // No jQuery needed
  }

  showSignUp() {
    this.rightPanelActive = true;
  }

  showSignIn() {
    this.rightPanelActive = false;
  }

  toggleAuth() {
    this.toggle = !this.toggle;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

}
