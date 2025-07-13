import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'async-account-activation',
  imports: [MatButtonModule, CommonModule, MatIconModule, RouterModule],
  styles: [`
    .activation-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f0f4f8;
      padding: 1em; /* Add padding for smaller screens */
    }

    .activation-content {
      text-align: center;
      padding: 2em;
      border-radius: 16px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      background-color: white;
      width: 90%; /* Adjust width for responsiveness */
      max-width: 500px;
    }

    .activation-status {
      margin-bottom: 2em;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .success-icon {
      color: green;
      font-size: 1.4em;
    }

    .error-icon {
      color: red;
      font-size: 1.4em;
    }

    .success-message {
      color: green;
      margin-top: 0.5em;
    }

    .error-message {
      color: red;
      margin-top: 0.5em;
    }

    .activation-details {
      p {
        margin-bottom: 1em;
        color: #666;
      }
    }

    /* Responsive adjustments */
    @media (max-width: 600px) {
      .activation-content {
        padding: 1.5em; /* Reduce padding for smaller screens */
      }

      .activation-status {
        margin-bottom: 1.5em; /* Reduce margin for smaller screens */
      }
    }
  `],
  template: `
    <section class="activation-page">
      <div class="activation-content">
        <div class="activation-status">
          <mat-icon *ngIf="activationSuccess" class="success-icon">check_circle</mat-icon>
          <mat-icon *ngIf="activationError" class="error-icon">error</mat-icon>
          <h2 *ngIf="!activationSuccess && !activationError && !loading">Activating...</h2>
          <h2 *ngIf="activationSuccess" class="success-message">Activated!</h2>
          <h2 *ngIf="activationError" class="error-message">Activation Failed</h2>
        </div>

        <div class="activation-details">
          <p *ngIf="!activationSuccess && !activationError && !loading">Please wait while we activate your account.</p>
          <p *ngIf="activationSuccess" class="success-message">Your account has been successfully activated!</p>
          <p *ngIf="activationError" class="error-message">{{ errorMessage }}</p>
          <button mat-flat-button color="primary" routerLink="/dashboard">Go to Home</button>
        </div>
      </div>
    </section>
  `,
})
export class AccountActivationComponent implements OnInit {
  activationSuccess = false;
  activationError = false;
  errorMessage = '';
  loading = true;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const partnerId = params['id'];
      if (partnerId) {
        this.activateAccount(partnerId);
      } else {
        this.activationError = true;
        this.errorMessage = 'Invalid activation link.';
        this.loading = false;
      }
    });
  }

  activateAccount(partnerId: string) {
    this.http
      .get<{ success: boolean; message: string }>(`https://marketspase-96hm2qxb.b4a.run/auth/activation/${partnerId}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.activationSuccess = true;
          } else {
            this.activationError = true;
            this.errorMessage = response.message;
          }
          this.loading = false;
        },
        error: (error) => {
          this.activationError = true;
          this.errorMessage = 'An error occurred during activation.';
          console.error('Activation error:', error);
          this.loading = false;
        },
      });
  }
}