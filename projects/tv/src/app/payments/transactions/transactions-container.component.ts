import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, DestroyRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, EMPTY, switchMap, tap, catchError } from 'rxjs';
import { TransactionsComponent } from './transactions.component';
import { PaymentService, TransactionInterface } from '../payment.service';
import { UserInterface, UserService } from '../../common/services/user.service';

/**
 * Container component for user transactions
 * Manages user authentication state and transaction data retrieval
 */
@Component({
  selector: 'async-withdraw-container',
  imports: [CommonModule, TransactionsComponent],
  providers: [PaymentService],
  template: `
    <async-transactions 
      *ngIf="user && transactions" 
      [user]="user" 
      [transactions]="transactions"
      [isLoading]="isLoading" />
    
    <div *ngIf="!user && !isLoading" class="no-user-message">
      Please log in to view your transactions.
    </div>
    
    <div *ngIf="isLoading" class="loading-message">
      Loading transactions...
    </div>
    
    <div *ngIf="error" class="error-message">
      {{ error }}
    </div>
  `,
  styles: [`
    .no-user-message,
    .loading-message,
    .error-message {
      padding: 16px;
      text-align: center;
      border-radius: 4px;
      margin: 16px 0;
    }
    
    .loading-message {
      background-color: #f0f8ff;
      color: #0066cc;
    }
    
    .error-message {
      background-color: #ffe6e6;
      color: #cc0000;
    }
    
    .no-user-message {
      background-color: #fff3cd;
      color: #856404;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionContainerComponent implements OnInit, OnDestroy {
  user: UserInterface | null = null;
  transactions: TransactionInterface | null = null;
  isLoading = false;
  error: string | null = null;

  private readonly userService = inject(UserService);
  private readonly paymentService = inject(PaymentService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadUserAndTransactions();
  }

  ngOnDestroy(): void {
    // Cleanup is handled by takeUntilDestroyed
  }

  /**
   * Loads user data and their associated transactions
   * Uses reactive pattern with proper error handling
   */
  private loadUserAndTransactions(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck(); // Mark for check since we're using OnPush

    this.userService.getCurrentUser$
      .pipe(
        tap(user => {
          this.user = user;
          this.transactions = null; // Reset transactions when user changes
          this.cdr.markForCheck();
        }),
        switchMap(user => {
          if (!user?._id) {
            this.isLoading = false;
            this.cdr.markForCheck();
            return EMPTY;
          }
          return this.loadTransactionsForUser(user._id);
        }),
        catchError(error => {
          console.error('Error loading user or transactions:', error);
          this.error = 'Failed to load transactions. Please try again.';
          this.isLoading = false;
          this.cdr.markForCheck();
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  /**
   * Loads transactions for a specific user
   * @param userId - The user ID to load transactions for
   * @returns Observable of transaction data
   */
  private loadTransactionsForUser(userId: string): Observable<TransactionInterface> {
    return this.paymentService.getTransactions(userId)
      .pipe(
        tap((transactions: TransactionInterface) => {
          this.transactions = transactions;
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
        catchError(error => {
          console.error(`Error loading transactions for user ${userId}:`, error);
          this.error = 'Failed to load transactions. Please try again.';
          this.isLoading = false;
          this.cdr.markForCheck();
          return EMPTY;
        })
      );
  }
}