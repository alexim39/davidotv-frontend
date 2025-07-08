import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ContactFormData, ContactService } from './contacts.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * @title Customer feedback
 */
@Component({
  selector: 'async-contacts',
  providers: [ContactService],
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatProgressBarModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: "contacts.component.html",
  styleUrls: ['contacts.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy {

  contactForm: FormGroup = new FormGroup({}); // Default initialization
  subscriptions: Subscription[] = [];
  isSpinning = false;
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private contactService: ContactService
  ) { }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      reason: ['', Validators.required], // <-- add this line
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  /**
   * Scrolls the window to the top smoothly.
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Submits the contact form data to the backend.
   * Marks all form controls as touched, shows a spinner, and uses SweetAlert2 for notifications.
   */
  onSubmit(): void {
    this.isSpinning = true;
    // Mark all form controls as touched to trigger error messages
    this.markAllAsTouched();

    if (!this.contactForm.valid) {
      this.isSpinning = false;
      return;
    }

    const formData: ContactFormData = this.contactForm.value;
    const subscription = this.contactService.submit(formData).subscribe({
      next: (response: any) => {
       this.snackBar.open(response.message, 'Ok',{duration: 3000});
        this.isSpinning = false;
        this.cdr.markForCheck();
        // Uncomment if you want to navigate after a successful submission:
        // this.router.navigateByUrl('get-started/connected-economy');
      },
      error: (error: HttpErrorResponse) => {
        this.isSpinning = false;
        let errorMessage = 'Server error occurred, please try again.'; // default error message.
        if (error.error && error.error.message) {
          errorMessage = error.error.message; // Use backend's error message if available.
        }
        this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
        this.cdr.markForCheck();
      }
    });
    this.subscriptions.push(subscription);
  }

  /**
   * Marks all controls in the contact form as touched.
   */
  private markAllAsTouched(): void {
    Object.keys(this.contactForm.controls).forEach(controlName => {
      this.contactForm.get(controlName)?.markAsTouched();
    });
  }

  /**
   * Unsubscribes from all subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
