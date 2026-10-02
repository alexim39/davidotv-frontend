import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// FE-01 payments domain migrated: transport via core. Errors are NORMALIZED
// {status,message,requestId} — consumers must read error.message.
import { ApiService } from '../core/services/api.service';

export interface TransactionInterface {
  message: string;
  data: Array<{
    amount: number;
    reference: string;
    status: string;
    paymentStatus?: boolean;
    date: Date;
  }>;
}

// saved-account.model.ts
export interface SavedAccountInterface {
  _id: string;
  bank: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface WithdrawalRequestData {
  bank: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  userId: string;
  saveAccount: boolean;
}

@Injectable()
export class PaymentService {
  
  constructor(private apiService: ApiService) {}
  
   /**
   * Submits the  form data to the backend.
   * @param formObject The form data.
   * @returns An observable of the submitted form data.
   */
   getTransactions(userId: string): Observable<any> {
    return this.apiService.get<any>(`transaction/${userId}`);
  }
  
  /**
   * Submits the form data to the backend.
   * @param formObject The form data.
   * @returns An observable of the submitted form data.
   */
   withdrawRequest(formObject: WithdrawalRequestData): Observable<any> {
    return this.apiService.post<any>('transaction/withdraw-request', formObject);
  }

   /**
    * SEC-03: bank list + account resolution are proxied through the backend
    * (GET transaction/banks*) so the Paystack secret never ships in the bundle.
    */
   getBanks(): Observable<{ status: boolean; data: Array<{ code: string; name: string }> }> {
     return this.apiService.get<any>('transaction/banks');
   }

   resolveAccount(accountNumber: string, bankCode: string): Observable<{ status: boolean; data: { account_name: string } }> {
     const params = new HttpParams()
       .set('account_number', accountNumber)
       .set('bank_code', bankCode);
     return this.apiService.get<any>('transaction/banks/resolve', params);
   }

  
   /**
   * Submits the form data to the backend.
   * @param formObject The form data.
   * @returns An observable of the submitted form data.
   */
   removeSavedAccount( accountId: string, userId: string,): Observable<any> {
    return this.apiService.delete<any>(`transaction/saved-accounts/${userId}/${accountId}`);
  }


   /**
   * Get data to the backend.
   * @param formObject The form data.
   * @returns An observable of the submitted form data.
   */
   getBalance( userId: string,): Observable<any> {
    return this.apiService.get<any>(`transaction/saved-accounts/${userId}`);
  }
}
