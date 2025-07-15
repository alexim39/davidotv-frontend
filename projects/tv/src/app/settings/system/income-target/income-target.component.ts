/* import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { IncomeTargetInterface, SettingsService } from '../system.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'async-income-target',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
  <div class="income-target-container">
  <form [formGroup]="incomeTargetForm" (ngSubmit)="onSubmit()">
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Target Amount</mat-label>
      <input matInput type="number" formControlName="targetAmount" placeholder="Enter target amount" />
      <mat-hint class="current" *ngIf="partner">Current target amount: {{partner.incomeTarget.targetAmount | currency:'₦':'symbol':'1.2-2'}}</mat-hint>
      <mat-error *ngIf="incomeTargetForm.get('targetAmount')?.hasError('required')">
        Target amount is required.
      </mat-error>
      <mat-error *ngIf="incomeTargetForm.get('targetAmount')?.hasError('min')">
        Target amount must be at least 1000.
      </mat-error>
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Period</mat-label>
      <mat-select formControlName="period">
        <!-- <mat-option *ngFor="let period of periods" [value]="partner.incomeTarget.period">{{ period }}</mat-option> -->
        <mat-option value="Daily">Daily</mat-option>
        <mat-option value="Weekly">Weekly</mat-option>
        <mat-option value="Monthly">Monthly</mat-option>
        <mat-option value="Yearly">Yearly</mat-option>
      </mat-select>
      <mat-hint class="current" *ngIf="partner">Current period: {{partner.incomeTarget.period | titlecase}}</mat-hint>
      <mat-error *ngIf="incomeTargetForm.get('period')?.hasError('required')">
        Period is required.
      </mat-error>
    </mat-form-field>

    <div class="btn">
    <button mat-flat-button color="primary" type="submit"  [disabled]="incomeTargetForm.invalid">
      Save
    </button>
    </div>
  </form>
</div>
  `,
  styles: [`
.income-target-container {
    padding: 2em 1em;
  max-width: 400px;
  margin: 0 auto;
}

.full-width {
  width: 100%;
  margin-bottom: 16px;
  .current {
    font-size: 0.9em;
    color: #111;
  }
}
.btn {
  width: 60%;
  display: flex;
  justify-content: center;
  margin: 0 auto;
}
  `]
})
export class IncomeTargetComponent implements OnInit, OnDestroy, OnChanges {
  @Input() partner!: PartnerInterface;
  incomeTargetForm!: FormGroup;
  // periods = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
  subscriptions: Array<Subscription> = [];

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    // Initialize the form with default values to prevent undefined errors
    this.incomeTargetForm = this.fb.group({
      targetAmount: [this.partner?.incomeTarget?.targetAmount || 0, [Validators.required, Validators.min(1000)]],
      period: [this.partner?.incomeTarget?.period || 'Monthly', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['partner'] && changes['partner'].currentValue) {
      const incomeTarget = this.partner?.incomeTarget;
      if (incomeTarget) {
        this.incomeTargetForm.patchValue({
          targetAmount: incomeTarget.targetAmount || 0,
          period: incomeTarget.period || 'Monthly'
        });
      }
    }
  }

  onSubmit() {
    if (this.incomeTargetForm.valid) {
      const formData = this.incomeTargetForm.value;
      const payload: IncomeTargetInterface = {
        partnerId: this.partner._id,
        targetAmount: formData.targetAmount,
        period: formData.period
      };

      this.subscriptions.push(
        this.settingsService.setIncomeTarget(payload).subscribe({
          next: (res: any) => {
            Swal.fire({
              position: "bottom",
              icon: 'success',
              text: `Your income target has been set successfully`,
              confirmButtonColor: "rgb(5, 1, 17)",
              timer: 4000,
            });
          },
          error: (error: HttpErrorResponse) => {
            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'Server error occurred, please try again',
              showConfirmButton: false,
              timer: 4000
            });
          }
        })
      );
    }
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
} */