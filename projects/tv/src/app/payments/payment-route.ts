import { Routes } from '@angular/router';
import { WithdrawalContainerComponent } from './withdrawal/withdrawal-container.component';
import { TransactionContainerComponent } from './transactions/transactions-container.component';

export const PaymentRoutes: Routes = [
  {
    path: '',
    redirectTo: 'withdrawal',
    pathMatch: 'full',
  },
  {
    path: '',
    children: [
      {
        path: 'withdrawal',
        component: WithdrawalContainerComponent,
        title: "Fund Withdrawal - Withdraw fund from your account",
      },
      {
        path: 'transactions',
        component: TransactionContainerComponent,
        title: "Transaction Details - Manage all your ads",
      },
    ],
  },
];