import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';
import { FooterService } from './footer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserInterface, UserService } from '../../common/services/user.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'async-footer',
  providers: [FooterService],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    RouterModule
  ],
  template: `
    <footer class="main-footer">
      <div class="footer-content">
        <!-- Company Info Section -->
        <div class="footer-section company-info">
          <div class="footer-logo">
            <img src="./img/logo2.PNG" alt="Davido Fans Hub" loading="lazy">
            <p class="tagline">Built by fans for fans</p>
          </div>
          <p class="company-description">
            DavidoTV is the premier fan destination for all things Davido. 
            We've built a community that provides exclusive content, news, and updates about the Afrobeat superstar.

          </p>
          <div class="contact-info">
            <p><mat-icon>email</mat-icon> info&#64;davidotv.com</p>
            <!-- <p><mat-icon>phone</mat-icon> +1 (234) 567-8900</p> -->
          </div>
        </div>

        <!-- Quick Links Section -->
        <div class="footer-section quick-links">
          <h3 class="section-title">Quick Links</h3>
          <nav>
            <ul>
              <li><a mat-button routerLink="/about">About Us</a></li>
              <li><a mat-button routerLink="/events">Events</a></li>
              <li><a mat-button routerLink="/contact">Contact</a></li>
            </ul>
          </nav>
        </div>

        <!-- Legal Links Section -->
        <div class="footer-section legal-links">
          <h3 class="section-title">Legal</h3>
          <nav>
            <ul>
              <li><a mat-button routerLink="/legal/privacy">Privacy Policy</a></li>
              <li><a mat-button routerLink="/legal/terms">Terms of Service</a></li>
              <li><a mat-button routerLink="/legal/cookies">Cookie Policy</a></li>
              <li><a mat-button routerLink="/faq">FAQ</a></li>
            </ul>
          </nav>
        </div>

        <!-- Newsletter Section -->
        <div class="footer-section newsletter">
          <h3 class="section-title">Stay Updated</h3>
          <p class="newsletter-description">
            Subscribe to our newsletter for exclusive updates, news, and offers.
          </p>
          <form [formGroup]="subscriptionForm" (ngSubmit)="onSubscribe()" class="subscription-form">
            <mat-form-field appearance="outline">
              <mat-label>Your Email</mat-label>
              <input matInput formControlName="email" type="email" required class="subscription-input">
              <mat-error *ngIf="subscriptionForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="subscriptionForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>
            <mat-progress-bar mode="indeterminate" *ngIf="isSubmitting"></mat-progress-bar>
            <button 
              mat-raised-button 
              color="accent" 
              type="submit"
              [disabled]="subscriptionForm.invalid || isSubmitting"
              aria-label="Subscribe to newsletter"
            >
              <span *ngIf="!isSubmitting">Subscribe</span>
              <span *ngIf="isSubmitting">Subscribing...</span>
            </button>
          </form>
          <div *ngIf="subscriptionSuccess" class="subscription-success">
            <mat-icon>check_circle</mat-icon>
            <span>Thank you for subscribing!</span>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="social-links">
          <a mat-icon-button href="https://www.facebook.com/davidoofficial2/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <i class="fa fa-facebook-square" aria-hidden="true"></i>
          </a>
          <a mat-icon-button href="https://x.com/davido" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <i class="fa fa-twitter" aria-hidden="true"></i>
          </a>
          <a mat-icon-button href="https://www.instagram.com/davido/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <i class="fa fa-instagram" aria-hidden="true"></i>
          </a>
          <a mat-icon-button href="https://www.youtube.com/channel/UCkBV3nBa0iRdxEGc4DUS3xA" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <i class="fa fa-youtube-square" aria-hidden="true"></i>
          </a>
          <a mat-icon-button href="https://music.apple.com/us/artist/davido/254654363" target="_blank" rel="noopener noreferrer" aria-label="Apple Music">
            <i class="fa fa-apple" aria-hidden="true"></i>
          </a>
        </div>
        <div class="copyright">
          <p>&copy; {{currentYear}} DavidoTV. All rights reserved.</p>
          <p class="credits">Built by fans for fans<mat-icon>favorite</mat-icon></p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .main-footer {
      background-color: #0a0a0a;
      color: rgba(255, 255, 255, 0.9);
      padding: 48px 0 0;
      font-family: 'Roboto', sans-serif;
      line-height: 1.6;
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 40px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px 40px;
    }

    .footer-section {
      h3.section-title {
        color: white;
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 20px;
        position: relative;
        padding-bottom: 8px;

        &::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 40px;
          height: 2px;
          //background: #ff5500;
          background: #8f0045;
        }
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          margin-bottom: 8px;

          a {
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            transition: color 0.3s ease;
            padding: 0;
            font-size: 14px;

            &:hover {
              color: white;
            }

            mat-icon {
              vertical-align: middle;
              margin-right: 8px;
              font-size: 16px;
            }
          }
        }
      }
    }

    .company-info {
      .footer-logo {
        margin-bottom: 16px;

        img {
          height: 40px;
          margin-bottom: 8px;
          //border-radius: 8px;
        }


        .tagline {
          color: #ccc;
          font-size: 8.5px;
          margin: -1em 0 0;
          border: 1px solid #ccc;
          padding: 0.2rem 0.5rem;
          width: fit-content;
          border-radius: 10px;
        }
      }

      .company-description {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        margin-bottom: 20px;
      }

      .contact-info {
        p {
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin: 8px 0;

          mat-icon {
            margin-right: 8px;
            font-size: 16px;
            //color: #ff5500;
            color: #8f0045;
          }
        }
      }
    }

    .newsletter {
      .newsletter-description {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        margin-bottom: 20px;
      }

      .subscription-form {
        display: flex;
        flex-direction: column;
        gap: 16px;

        mat-form-field {
          width: 100%;

          .subscription-input {
            color: white;
          }

          ::ng-deep .mat-form-field-outline {
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }

          ::ng-deep .mat-form-field-label {
            color: rgba(255, 255, 255, 0.7);
          }

          ::ng-deep .mat-input-element {
            color: white;
          }
        }

        button {
          align-self: flex-start;
          font-weight: 500;
        }
      }

      .subscription-success {
        display: flex;
        align-items: center;
        color: #4caf50;
        margin-top: 12px;
        font-size: 14px;

        mat-icon {
          margin-right: 8px;
        }
      }
    }

    .footer-bottom {
      background-color: rgba(0, 0, 0, 0.2);
      padding: 20px 24px;
      text-align: center;

      .social-links {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-bottom: 16px;

        a {
          color: rgba(255, 255, 255, 0.7);
          transition: color 0.3s ease;

          &:hover {
            color: white;
            transform: translateY(-2px);
          }

          mat-icon {
            font-size: 24px;
          }
        }
      }

      .copyright {
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;

        p {
          margin: 4px 0;
        }

        .credits {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 8px;

          mat-icon {
            //color: #ff5500;
            color: #8f0045;
            font-size: 14px;
            margin: 4px 0 0 2px;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        gap: 32px;
        padding-bottom: 32px;
      }

      .footer-section {
        margin-bottom: 0;
      }

      .subscription-form {
        flex-direction: column;

        button {
          width: 100%;
        }
      }
    }

    @media (max-width: 480px) {
      .footer-content {
        padding: 0 16px 24px;
      }

      .footer-bottom {
        padding: 16px;
      }
    }
  `]
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  subscriptionForm: FormGroup;
  isSubmitting = false;
  subscriptionSuccess = false;
  subscriptions: Subscription[] = [];

  private emailSubscription =  inject(FooterService)
  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);
  user: UserInterface | null = null;

  constructor(private fb: FormBuilder) {
    this.subscriptionForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
          //console.log('current user ',this.user)
        }
      })
    )
  }

 onSubscribe() {
  if (this.subscriptionForm.valid) {
    this.isSubmitting = true;
    const formObject = this.subscriptionForm.value;

    this.subscriptions.push(
      this.emailSubscription.subscribe(formObject).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.subscriptionSuccess = true;
          this.subscriptionForm.reset();
        },
        error: (error: HttpErrorResponse) => {
          this.subscriptionSuccess = false;

          let errorMessage = 'Server error occurred, please try again.'; // default error message.
          if (error.error && error.error.message) {
            errorMessage = error.error.message; // Use backend's error message if available.
          }  
          this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
          this.isSubmitting = false;

        }
      })
    )
  }
}

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  } 
}