import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable, tap } from 'rxjs';

export interface UserProfile {
  _id: string;
  username: string;
  name: string;
  lastname: string;
  email: string;
  avatar?: string;
  personalInfo?: any;
  professionalInfo?: any;
  role: string;
}

/**
 * Domain service for user-profile feature.
 */
@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly api = inject(ApiService);
  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(false);

  fetchMe(): Observable<{ data: UserProfile }> {
    this.loading.set(true);
    return this.api.get<{ data: UserProfile }>('user/me').pipe(
      tap(res => { this.profile.set(res.data); this.loading.set(false); })
    );
  }

  update(payload: Partial<UserProfile>): Observable<any> {
    return this.api.put('user/profile', payload).pipe(tap((res:any)=> this.profile.set(res.data ?? payload as UserProfile)));
  }

  uploadAvatar(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('avatar', file);
    return this.api.upload('user/avatar', fd);
  }
}
