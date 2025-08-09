import { 
  Component, 
  Input, 
  OnInit, 
  AfterViewInit, 
  ViewChild, 
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { TransactionInterface } from '../payment.service';
import { UserInterface } from '../../common/services/user.service';
import { HelpDialogComponent } from '../../common/help-dialog.component';

interface TransactionRow {
  transactionId: string;
  dateOfPayment: string;
  amount: number;
  paymentMethod: string;
  purpose: string;
  paymentStatus: 'pending' | 'success' | 'rejected';
  transactionType: string;
  date: string;
}

// Interface for the actual transaction data from the API
interface ApiTransactionData {
  amount: number;
  reference: string;
  status: string;
  paymentStatus?: boolean;
  date: Date;
  paymentMethod?: string;
  purpose?: string;
  transactionType?: string;
}

/**
 * Component for displaying and managing user transactions
 * Provides filtering, sorting, and responsive design
 */
@Component({
  selector: 'async-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSortModule,
    RouterModule
  ],
  template: `
    <div class="transactions-container">
      <header class="transactions-header">
      <nav class="breadcrumb">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="scrollToTop()">
          <mat-icon>home</mat-icon> Dashboard
        </a>
        <mat-icon>chevron_right</mat-icon>
        <a routerLink="/dashboard/payment/withdrawal" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="scrollToTop()">Payment</a>
        <mat-icon>chevron_right</mat-icon>
        <span class="current">Transaction History</span>
      </nav>

      <div class="header-content">
        <h1>
          <mat-icon class="header-icon">receipt_long</mat-icon>
          Transaction History
          <button mat-icon-button class="help-button" (click)="showDescription()" matTooltip="Help" aria-label="Help">
            <mat-icon>help_outline</mat-icon>
          </button>
        </h1>
        <p>View and manage your transaction history</p>
      </div>
    </header>

      <div class="transactions-content">
        <!-- Summary Card -->
        <mat-card class="summary-card">
          <div class="card-header">
            <h2>
              <mat-icon class="summary-icon">analytics</mat-icon>
              Transaction Summary
            </h2>
          </div>
          
          <div class="summary-content">
            <div class="summary-item">
              <div class="summary-label">Total Transactions</div>
              <div class="summary-value">{{ totalTransactions() }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Successful</div>
              <div class="summary-value success">{{ successfulTransactions() }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Pending</div>
              <div class="summary-value pending">{{ pendingTransactions() }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Rejected</div>
              <div class="summary-value rejected">{{ rejectedTransactions() }}</div>
            </div>
          </div>
        </mat-card>

        <!-- Transactions Table Card -->
        <mat-card class="table-card">
          <div class="card-header">
            <h2>
              <mat-icon class="table-icon">table_view</mat-icon>
              All Transactions
            </h2>
            
            <div class="search-section">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search transactions</mat-label>
                <input 
                  matInput 
                  [formControl]="searchControl"
                  placeholder="Search by ID, amount, method..."
                  autocomplete="off">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <div class="table-container" *ngIf="!isEmptyRecord(); else noDataTemplate">
            <!-- Desktop Table -->
            <div class="desktop-table" *ngIf="!isHandset()">
              <table mat-table [dataSource]="dataSource" matSort class="transactions-table">
                <!-- Transaction ID Column -->
                <ng-container matColumnDef="transactionId">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Transaction ID</th>
                  <td mat-cell *matCellDef="let transaction">
                    <span class="transaction-id">{{ transaction.transactionId }}</span>
                  </td>
                </ng-container>

                <!-- Date Column -->
                <ng-container matColumnDef="dateOfPayment">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                  <td mat-cell *matCellDef="let transaction">
                    {{ transaction.dateOfPayment | date:'MMM d, y, h:mm a' }}
                  </td>
                </ng-container>

                <!-- Amount Column -->
                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
                  <td mat-cell *matCellDef="let transaction">
                    <span class="amount">₦{{ transaction.amount | number:'1.2-2' }}</span>
                  </td>
                </ng-container>

                <!-- Payment Method Column -->
                <ng-container matColumnDef="paymentMethod">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Payment Method</th>
                  <td mat-cell *matCellDef="let transaction">
                    <mat-chip class="method-chip">{{ transaction.paymentMethod }}</mat-chip>
                  </td>
                </ng-container>

                <!-- Purpose Column -->
                <ng-container matColumnDef="purpose">
                  <th mat-header-cell *matHeaderCellDef>Purpose</th>
                  <td mat-cell *matCellDef="let transaction">
                    {{ transaction.purpose }}
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="paymentStatus">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                  <td mat-cell *matCellDef="let transaction">
                    <mat-chip 
                      [class]="getStatusClass(transaction.paymentStatus)"
                      class="status-chip">
                      <mat-icon class="status-icon">{{ getStatusIcon(transaction.paymentStatus) }}</mat-icon>
                      {{ transaction.paymentStatus | titlecase }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Transaction Type Column -->
                <ng-container matColumnDef="transactionType">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                  <td mat-cell *matCellDef="let transaction">
                    <mat-chip class="type-chip">{{ transaction.transactionType }}</mat-chip>
                  </td>
                </ng-container>

                <!-- Action Column -->
                <ng-container matColumnDef="action">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let transaction">
                    <button 
                      mat-icon-button 
                      matTooltip="View Details"
                      (click)="viewTransactionDetails(transaction)">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr 
                  mat-row 
                  *matRowDef="let transaction; columns: displayedColumns;"
                  [class]="getRowClass(transaction.paymentStatus)">
                </tr>
              </table>
            </div>

            <!-- Mobile Card Layout -->
            <div class="mobile-cards" *ngIf="isHandset()">
              <mat-card *ngFor="let transaction of paginatedData()" class="transaction-card">
                <mat-card-header>
                  <div class="transaction-header">
                    <span class="transaction-id">{{ transaction.transactionId }}</span>
                    <mat-chip 
                      [class]="getStatusClass(transaction.paymentStatus)"
                      class="status-chip">
                      {{ transaction.paymentStatus | titlecase }}
                    </mat-chip>
                  </div>
                </mat-card-header>
                
                <mat-card-content>
                  <div class="transaction-details">
                    <div class="detail-row">
                      <span class="label">Amount:</span>
                      <span class="value amount">₦{{ transaction.amount | number:'1.2-2' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Date:</span>
                      <span class="value">{{ transaction.dateOfPayment | date:'MMM d, y' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Method:</span>
                      <span class="value">{{ transaction.paymentMethod }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Type:</span>
                      <span class="value">{{ transaction.transactionType }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Purpose:</span>
                      <span class="value">{{ transaction.purpose }}</span>
                    </div>
                  </div>
                </mat-card-content>
                
                <mat-card-actions>
                  <button 
                    mat-button 
                    color="primary"
                    (click)="viewTransactionDetails(transaction)">
                    <mat-icon>visibility</mat-icon> View Details
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>

            <!-- Paginator -->
            <mat-paginator 
              #paginator
              [length]="totalTransactions()"
              [pageSize]="pageSize()"
              [pageSizeOptions]="[5, 10, 25, 50]"
              showFirstLastButtons
              aria-label="Select page of transactions">
            </mat-paginator>
          </div>

          <!-- No Data Template -->
          <ng-template #noDataTemplate>
            <div class="no-data">
              <mat-icon class="no-data-icon">inbox</mat-icon>
              <h3>No Transactions Found</h3>
              <p>{{ hasSearchFilter() ? 'No transactions match your search criteria.' : 'You haven\'t made any transactions yet.' }}</p>
              <button 
                *ngIf="hasSearchFilter()" 
                mat-button 
                color="primary" 
                (click)="clearSearch()">
                Clear Search
              </button>
            </div>
          </ng-template>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .transactions-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .transactions-header {
      margin-bottom: 24px;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 14px;
      //color: #666;
    }

    .breadcrumb a {
      display: flex;
      align-items: center;
      gap: 4px;
      text-decoration: none;
      color: #8f0045;
      transition: color 0.2s;
    }

    .breadcrumb a:hover {
      color: #8f0045;
    }

    .breadcrumb .current {
      //color: #333;
      font-weight: 500;
    }

    .header-main h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      //color: #333;
    }

    .transactions-icon {
      color: #8f0045;
      font-size: 32px;
    }

    .help {
      margin-left: auto;
    }

    .header-main p {
      margin: 0;
      //color: #666;
      font-size: 16px;
    }

    .transactions-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .summary-card,
    .table-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 12px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .card-header h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      //color: #333;
    }

    .summary-icon,
    .table-icon {
      color: #8f0045;
    }

    .summary-content {
      padding: 24px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .summary-item {
      text-align: center;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #333;
    }

    .summary-label {
      font-size: 14px;
      //color: #666;
      margin-bottom: 8px;
    }

    .summary-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .summary-value.success {
      color: #4caf50;
    }

    .summary-value.pending {
      color: #ff9800;
    }

    .summary-value.rejected {
      color: #f44336;
    }

    .search-section {
      flex: 1;
      max-width: 400px;
    }

    .search-field {
      width: 100%;
    }

    .table-container {
      padding: 0 24px 24px;
    }

    .desktop-table {
      overflow-x: auto;
      margin-bottom: 16px;
    }

    .transactions-table {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
    }

    .transactions-table th {
      //background-color: #f5f5f5;
      font-weight: 600;
      //color: #333;
    }

    .transaction-id {
      font-family: monospace;
      font-size: 12px;
      //background: #e3f2fd;
      padding: 4px 8px;
      border-radius: 4px;
      color: #8f0045;
    }

    .amount {
      font-weight: 600;
      color: #2e7d32;
    }

    .method-chip,
    .type-chip {
      font-size: 12px;
      //background-color: #e0e0e0;
      //color: #333;
    }

    .status-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-chip.pending {
      //background-color: #fff3e0;
      color: #ef6c00;
    }

    .status-chip.success {
      //background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-chip.rejected {
      //background-color: #ffebee;
      color: #c62828;
    }

    .status-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .pending {
      background-color: rgba(255, 243, 224, 0.3);
    }

    .success {
      background-color: rgba(232, 245, 232, 0.3);
    }

    .rejected {
      background-color: rgba(255, 235, 238, 0.3);
    }

    /* Mobile Cards */
    .mobile-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 16px;
    }

    .transaction-card {
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    }

    .transaction-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .transaction-details {
      margin-top: 16px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      //color: #666;
      font-size: 14px;
    }

    .value {
      font-weight: 500;
      //color: #333;
      font-size: 14px;
    }

    /* No Data State */
    .no-data {
      text-align: center;
      padding: 48px 24px;
      //color: #666;
    }

    .no-data-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      //color: #bbb;
      margin-bottom: 16px;
    }

    .no-data h3 {
      margin: 0 0 8px 0;
      //color: #333;
    }

    .no-data p {
      margin: 0 0 16px 0;
      font-size: 14px;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .transactions-container {
        padding: 16px;
      }

      .card-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .search-field {
        max-width: none;
      }

      .summary-content {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .summary-item {
        padding: 12px;
      }

      .summary-value {
        font-size: 20px;
      }
    }

    @media (max-width: 480px) {
      .summary-content {
        grid-template-columns: 1fr;
      }
      
      .header-main h1 {
        font-size: 24px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) user!: UserInterface;
  @Input({ required: true }) transactions!: TransactionInterface;
  @Input() isLoading = false;

  // Injected services
  private readonly dialog = inject(MatDialog);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);

  // ViewChild references
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Reactive state
  readonly isHandset = signal<boolean>(false);
  readonly isEmptyRecord = signal<boolean>(false);
  readonly pageSize = signal<number>(10);
  readonly currentPage = signal<number>(0);
  
  // Form controls
  readonly searchControl = new FormControl('');
  readonly searchTerm = signal<string>('');

  // Table configuration
  readonly displayedColumns: string[] = [
    'transactionId', 
    'dateOfPayment', 
    'amount', 
    'paymentMethod', 
    'purpose', 
    'paymentStatus', 
    'transactionType', 
    'action'
  ];

  readonly dataSource = new MatTableDataSource<TransactionRow>([]);

  // Computed values
  readonly totalTransactions = computed(() => this.dataSource.data.length);
  
  readonly successfulTransactions = computed(() => 
    this.dataSource.data.filter(t => t.paymentStatus === 'success').length
  );
  
  readonly pendingTransactions = computed(() => 
    this.dataSource.data.filter(t => t.paymentStatus === 'pending').length
  );
  
  readonly rejectedTransactions = computed(() => 
    this.dataSource.data.filter(t => t.paymentStatus === 'rejected').length
  );

  readonly paginatedData = computed(() => {
    const data = this.dataSource.filteredData;
    const pageSize = this.pageSize();
    const currentPage = this.currentPage();
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  });

  readonly hasSearchFilter = computed(() => this.searchTerm().trim().length > 0);

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngAfterViewInit(): void {
    this.setupTableFeatures();
  }

  private initializeComponent(): void {
    this.validateInputs();
    this.setupResponsiveObserver();
    this.setupSearchFunctionality();
    this.processTransactionData();
  }

  private validateInputs(): void {
    if (!this.user?._id) {
      console.error('TransactionsComponent: User is required');
      return;
    }

    if (!this.transactions) {
      console.warn('TransactionsComponent: No transactions provided');
      this.isEmptyRecord.set(true);
      return;
    }

    console.log('TransactionsComponent initialized with:', {
      userId: this.user._id,
      transactionCount: this.transactions.data?.length || 0
    });
  }

  private setupResponsiveObserver(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.isHandset.set(result.matches);
      });
  }

  private setupSearchFunctionality(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(searchTerm => {
        this.searchTerm.set(searchTerm || '');
        this.applyFilter();
      });
  }

  private processTransactionData(): void {
    if (!this.transactions?.data || !Array.isArray(this.transactions.data)) {
      this.isEmptyRecord.set(true);
      return;
    }

    // Map API data to component interface and sort by date (newest first)
    const mappedTransactions: TransactionRow[] = this.transactions.data
      .map(this.mapApiDataToTransactionRow.bind(this))
      .sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

    this.dataSource.data = mappedTransactions;
    this.isEmptyRecord.set(mappedTransactions.length === 0);
  }

  /**
   * Maps API transaction data to the component's TransactionRow interface
   */
  private mapApiDataToTransactionRow(apiData: ApiTransactionData): TransactionRow {
    return {
      transactionId: apiData.reference || 'N/A',
      dateOfPayment: apiData.date ? new Date(apiData.date).toISOString() : new Date().toISOString(),
      amount: apiData.amount || 0,
      paymentMethod: apiData.paymentMethod || 'Unknown',
      purpose: apiData.purpose || 'Not specified',
      paymentStatus: this.normalizePaymentStatus(apiData.status, apiData.paymentStatus),
      transactionType: apiData.transactionType || 'Transaction',
      date: apiData.date ? new Date(apiData.date).toISOString() : new Date().toISOString()
    };
  }

  /**
   * Normalizes different status formats to the expected enum values
   */
  private normalizePaymentStatus(status?: string, paymentStatus?: boolean): 'pending' | 'success' | 'rejected' {
    // Handle boolean paymentStatus
    if (typeof paymentStatus === 'boolean') {
      return paymentStatus ? 'success' : 'rejected';
    }

    // Handle string status
    if (typeof status === 'string') {
      const normalizedStatus = status.toLowerCase();
      
      if (['success', 'completed', 'successful', 'paid'].includes(normalizedStatus)) {
        return 'success';
      }
      
      if (['rejected', 'failed', 'error', 'declined'].includes(normalizedStatus)) {
        return 'rejected';
      }
      
      // Default to pending for any other status
      return 'pending';
    }

    // Default fallback
    return 'pending';
  }

  private setupTableFeatures(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      
      // Update current page signal when paginator changes
      this.paginator.page
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(pageEvent => {
          this.currentPage.set(pageEvent.pageIndex);
          this.pageSize.set(pageEvent.pageSize);
        });
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;
    }

    // Setup custom filter predicate
    this.dataSource.filterPredicate = (data: TransactionRow, filter: string) => {
      const searchTerm = filter.toLowerCase();
      return (
        data.transactionId.toLowerCase().includes(searchTerm) ||
        data.amount.toString().includes(searchTerm) ||
        data.paymentMethod.toLowerCase().includes(searchTerm) ||
        data.purpose.toLowerCase().includes(searchTerm) ||
        data.paymentStatus.toLowerCase().includes(searchTerm) ||
        data.transactionType.toLowerCase().includes(searchTerm)
      );
    };
  }

  private applyFilter(): void {
    const filterValue = this.searchTerm().trim().toLowerCase();
    this.dataSource.filter = filterValue;
    
    if (this.paginator) {
      this.paginator.firstPage();
      this.currentPage.set(0);
    }
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchTerm.set('');
    this.applyFilter();
  }

  // Status utility methods
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'successful':
      case 'paid':
        return 'success';
      case 'pending':
      case 'processing':
        return 'pending';
      case 'rejected':
      case 'failed':
      case 'error':
      case 'declined':
        return 'rejected';
      default:
        return 'pending';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'successful':
      case 'paid':
        return 'check_circle';
      case 'pending':
      case 'processing':
        return 'schedule';
      case 'rejected':
      case 'failed':
      case 'error':
      case 'declined':
        return 'error';
      default:
        return 'schedule';
    }
  }

  getRowClass(status: string): string {
    return this.getStatusClass(status);
  }

  // Action methods
  viewTransactionDetails(transaction: TransactionRow): void {
    // Implement transaction details dialog
    console.log('Viewing transaction details:', transaction);
    // You can open a dialog here with transaction details
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showDescription(): void {
    this.dialog.open(HelpDialogComponent, {
      data: {
        help: 'In this section, you can view and track all your transaction history. Use the search feature to find specific transactions, and click on any transaction to view more details.'
      },
    });
  }
}