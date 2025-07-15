import { Component, inject, Input, signal} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';  
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { SocialPageService } from '../social-media-page.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { UserInterface } from '../../../common/services/user.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'async-testimonial-writeup-settings',
  standalone: true,
  imports: [
    MatExpansionModule, 
    CommonModule, 
    MatSelectModule, 
    MatInputModule, 
    MatButtonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule,
    MatCardModule
  ],
  providers: [SocialPageService],
  template: `
  <div class="testimonial-settings">
    <h3 class="section-title">Share Your Experience</h3>
    <p class="section-description">Write a testimonial about your experience with Davidotv</p>

    <mat-card class="testimonial-form-card">
      <form [formGroup]="testimonialForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Your Testimonial</mat-label>
          <textarea 
            matInput 
            formControlName="message" 
            #message 
            maxlength="500" 
            rows="6"
            placeholder="Share your thoughts about Davidotv...">
          </textarea>
          <mat-hint align="start"><strong>Inspire others with your experience</strong></mat-hint>
          <mat-hint align="end">{{message.value.length}} / 500</mat-hint>
          <mat-error *ngIf="testimonialForm.get('message')?.hasError('required')">
            Testimonial is required
          </mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Country</mat-label>
            <mat-select formControlName="country" (selectionChange)="onCountryChange($event.value)">
              <mat-option *ngFor="let country of countries" [value]="country">{{ country }}</mat-option>
            </mat-select>
            <mat-error *ngIf="testimonialForm.get('country')?.hasError('required')">
              Country is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{isNigeria ? 'State' : 'Region'}}</mat-label>
            <mat-select *ngIf="isNigeria" formControlName="state">
              <mat-option *ngFor="let state of states" [value]="state">{{ state }}</mat-option>
            </mat-select>
            <input *ngIf="!isNigeria" matInput formControlName="state" placeholder="Enter your region">
            <mat-error *ngIf="testimonialForm.get('state')?.hasError('required')">
              {{isNigeria ? 'State' : 'Region'}} is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="testimonialForm.invalid">
            Publish Testimonial
          </button>
        </div>
      </form>
    </mat-card>
  </div>
  `,
  styles: [`
  .testimonial-settings {
    padding: 16px;

    .section-title {
      font-size: 18px;
      font-weight: 500;
      margin: 0 0 8px;
      color: #030303;
    }

    .section-description {
      font-size: 14px;
      color: #606060;
      margin: 0 0 24px;
    }

    .testimonial-form-card {
      padding: 24px;
      border-radius: 8px;

      form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .full-width {
        width: 100%;
      }

      .form-row {
        display: flex;
        gap: 16px;

        mat-form-field {
          flex: 1;
        }
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;

        button {
          padding: 0 24px;
          font-weight: 500;
        }
      }

      textarea {
        min-height: 150px;
        resize: vertical;
      }
    }
  }

  @media (max-width: 768px) {
    .testimonial-settings {
      padding: 8px;

      .testimonial-form-card {
        padding: 16px;

        .form-row {
          flex-direction: column;
          gap: 16px;
        }
      }
    }
  }
  `]
})
export class TestimonialWriteupSettingsComponent {
  @Input() user!: UserInterface;
  subscriptions: Array<Subscription> = [];
  
  testimonialForm!: FormGroup;  
  countries: string[] = [
    'Nigeria',
    'Ghana',
    'Kenya',
    'South Africa',
    'United States',
    'Egypt',
    'Morocco',
    'Algeria',
    'Ethiopia',
    'Tanzania',
    'Uganda',
    'Rwanda',
    'Senegal',
    'Cameroon',
    'Ivory Coast',
    'Zimbabwe',
    'Zambia',
    'Botswana',
    'Namibia',
    'Mozambique',
    'Madagascar',
    'Tunisia',
    'Libya',
    'Sudan',
    'Angola',
    'Democratic Republic of the Congo',
    'Somalia',
    'Mauritius',
    'Seychelles',
    'Cape Verde',
    'Gambia',
    'Burkina Faso',
    'Mali',
    'Niger',
    'Chad',
    'Malawi',
    'Eswatini',
    'Lesotho',
    'Djibouti',
    'Eritrea',
    'Central African Republic',
    'Equatorial Guinea',
    'Gabon',
    'Sao Tome and Principe',
    'Comoros',
    'Israel',
    'Jordan',
    'Lebanon',
    'Syria',
    'Saudi Arabia',
    'Yemen',
    'Oman',
    'United Arab Emirates',
    'Qatar',
    'Kuwait',
    'Bahrain'
  ];
  states: string[] = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 
    'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 
    'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT (Abuja)'
  ];
  isNigeria = true;

  constructor(
    private fb: FormBuilder,
    private socialPageService: SocialPageService,
  ) {}

  ngOnInit(): void {
    this.testimonialForm = this.fb.group({  
      message: [this.user?.testimonial?.message || '', [Validators.required]],
      country: ['Nigeria', [Validators.required]],
      state: ['', [Validators.required]],
    });

    this.isNigeria = this.testimonialForm.get('country')?.value === 'Nigeria';
  }

  onCountryChange(selectedCountry: string): void {
    this.isNigeria = selectedCountry === 'Nigeria';
    this.testimonialForm.get('state')?.reset();

    if (this.isNigeria) {
      this.testimonialForm.get('state')?.setValidators([Validators.required]);
    } else {
      this.testimonialForm.get('state')?.setValidators([Validators.required, Validators.minLength(2)]);
    }
    this.testimonialForm.get('state')?.updateValueAndValidity();
  }

  onSubmit() {  
    if (this.testimonialForm.valid) {  
      const updateObject = {
        message: this.testimonialForm.value.message,
        country: this.testimonialForm.value.country,
        state: this.testimonialForm.value.state,
        partnerId: this.user._id,
      };

      this.subscriptions.push(
        this.socialPageService.updateTestimonial(updateObject).subscribe({
          next: (response) => {
            // Handle success
          },
          error: (error: HttpErrorResponse) => {
            // Handle error
          }
        })
      );
    }  
  } 

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}