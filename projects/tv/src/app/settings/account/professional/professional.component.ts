import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { SettingsService } from '../../settings.service';
import { UserInterface } from '../../../common/services/user.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'async-professional-info',
  standalone: true,
  providers: [SettingsService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './professional.component.html',
  styleUrls: ['./professional.component.scss']
})
export class ProfessionalInfoComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private settingsService = inject(SettingsService);
  private snackBar = inject(MatSnackBar);

  @Input() user!: UserInterface;
  professionalForm!: FormGroup;
  isLoading = false;

  educationOptions = [
    'Basic Education Certificate (Primary School)',
    'WASSCE',
    'NECO',
    'GCE',
    'ND',
    'HND',
    'B.Sc., B.A., B.Eng.',
    'M.Sc., M.A., M.B.A.',
    'Ph.D.',
    'NCE',
    'None'
  ];

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.professionalForm = new FormGroup({
      jobTitle: new FormControl(this.user?.jobTitle || '', [
        Validators.required,
        Validators.maxLength(50)
      ]),
      educationBackground: new FormControl(this.user?.educationBackground || '', [
        Validators.required
      ]),
      hobby: new FormControl(this.user?.hobby || '', [
        Validators.required,
        Validators.maxLength(50)
      ]),
      skill: new FormControl(this.user?.skill || '', [
        Validators.required,
        Validators.maxLength(50)
      ]),
      id: new FormControl(this.user?._id || '')
    });
  }

  onSubmit(): void {
    if (this.professionalForm.invalid) {
      this.professionalForm.markAllAsTouched();
      this.showNotification('Please fill all required fields correctly');
      return;
    }

    this.isLoading = true;
    const professionalData = this.professionalForm.value;

    this.subscriptions.push(
      this.settingsService.updateProfession(professionalData).subscribe({
        next: (response) => {
          this.showNotification('Professional information updated successfully!', 'success');
          this.isLoading = false;
        },
        error: (error) => {
          this.showNotification('Failed to update professional information. Please try again.');
          this.isLoading = false;
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}