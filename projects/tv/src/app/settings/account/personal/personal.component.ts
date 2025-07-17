import { ChangeDetectorRef, Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { SettingsService } from '../../settings.service';
import { UserInterface } from '../../../common/services/user.service';
import { ProfileImageUploaderComponent } from '../profile-image.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'async-personal-infor',
  providers: [SettingsService],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    ProfileImageUploaderComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss']
})
export class PersonalInfoComponent implements OnInit, OnDestroy {
 private subscriptions: Subscription[] = [];
  private snackBar = inject(MatSnackBar);
  private settingsService = inject(SettingsService);
  private cdr = inject(ChangeDetectorRef);

  @Input() user!: UserInterface;
  profileForm!: FormGroup;

  minDate = new Date(1900, 0, 1);
  maxDate = new Date();
  isLoading = false;

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate = new Date();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && !changes['user'].firstChange) {
      this.updateFormWithUserData();
    }
  }

 private initializeForm(): void {
    this.profileForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      email: new FormControl(
        { value: '', disabled: true }, 
        [Validators.required, Validators.email]
      ),
      phone: new FormControl(this.user?.personalInfo?.phone || '', [
        Validators.required,
        Validators.pattern(/^(\+?\d{1,3}[- ]?)?\d{6,14}$/)
      ]),
      address: new FormControl('', [
        Validators.maxLength(200)
      ]),
      bio: new FormControl('', [
        Validators.maxLength(500)
      ]),
      dob: new FormControl(null),
      userId: new FormControl('')
    });

    // Update form if user data is already available
    if (this.user) {
      this.updateFormWithUserData();
    }
  }

  private updateFormWithUserData(): void {
    this.profileForm.patchValue({
      name: this.user?.name || '',
      lastname: this.user?.lastname || '',
      email: this.user?.email || '',
      phone: this.user?.personalInfo?.phone || '',
      address: this.user?.personalInfo?.address || '',
      bio: this.user?.personalInfo?.bio || '',
      dob: this.user?.personalInfo?.dob || null,
      userId: this.user?._id || ''
    });
    this.cdr.markForCheck(); // Ensure UI updates with new data
  }

  onAccountStatusChange(event: MatSlideToggleChange): void {
    if (event.checked) {
      this.isLoading = true;
      const formData = {
        state: event.checked,
        partnerId: this.user._id 
      };

      this.subscriptions.push(
        this.settingsService.activateAccount(formData).subscribe({
          next: (response) => {
            this.showNotification(response.message);
            this.isLoading = false;
          },
          error: (error: HttpErrorResponse) => {
            this.handleError(error);
            this.isLoading = false;
            this.cdr.markForCheck(); // Only needed here because error might occur outside Angular zone
          }
        })
      );
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.showNotification('Please fill all required fields correctly');
      return;
    }

    this.isLoading = true;
    const profileData = this.profileForm.value;

    this.subscriptions.push(
      this.settingsService.updateProfile(profileData).subscribe({
        next: (response) => {
          this.showNotification(response.message, 'success');
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error);
          this.isLoading = false;
          this.cdr.markForCheck(); // Only needed here because error might occur outside Angular zone
        }
      })
    );
  }

  private showNotification(message: string, panelClass: string = 'error'): void {
    this.snackBar.open(message, 'Close', { 
      duration: 5000,
      panelClass: [`snackbar-${panelClass}`]
    });
  }

  private handleError(error: HttpErrorResponse): void {
    const errorMessage = error.error?.message || 'Server error occurred, please try again.';
    this.showNotification(errorMessage);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}