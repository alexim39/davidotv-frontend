import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface TalentUpload {
  _id: string;
  artistName: string;
  title: string;
  genre: string;
  description?: string;
  fileUrl: string;
  coverUrl?: string;
  duration?: number;
  uploader: { _id: string; username: string; avatar?: string };
  plays: number;
  likes: string[]; // userIds
  likeCount: number;
  shareCount: number;
  callUpStatus: 'pending' | 'reviewed' | 'called_up' | 'flagged';
  reviewedBy?: string;
  createdAt: string;
}

export interface PaginatedTalent { data: TalentUpload[]; total: number; page: number; limit: number; }

/**
 * Community talent hub - Next Global Star.
 * Handles upload + curated admin queue + engagement mechanics.
 */
@Injectable({ providedIn: 'root' })
export class TalentService {
  private readonly api = inject(ApiService);
  readonly uploads = signal<TalentUpload[]>([]);
  readonly loading = signal(false);

  list(params: { page?: number; limit?: number; sort?: string; genre?: string; status?: string } = {}): Observable<PaginatedTalent> {
    let hp = new HttpParams();
    Object.entries(params).forEach(([k,v]) => { if(v!=null) hp = hp.set(k, String(v)); });
    this.loading.set(true);
    return this.api.get<PaginatedTalent>('talent-upload', hp).pipe(
      tap(res => { this.uploads.set(res.data); this.loading.set(false); })
    );
  }

  curatedQueue(page = 1, limit = 12): Observable<PaginatedTalent> {
    const params = new HttpParams().set('sort', '-likeCount,-plays,-createdAt').set('page', String(page)).set('limit', String(limit));
    return this.api.get<PaginatedTalent>('talent-upload/curated', params);
  }

  upload(formData: FormData): Observable<{ data: TalentUpload }> {
    return this.api.upload<{ data: TalentUpload }>('talent-upload', formData);
  }

  like(id: string): Observable<any> { return this.api.post(`talent-upload/${id}/like`, {}); }
  share(id: string): Observable<any> { return this.api.post(`talent-upload/${id}/share`, {}); }
  play(id: string): Observable<any> { return this.api.post(`talent-upload/${id}/play`, {}); }
  comment(id: string, text: string): Observable<any> { return this.api.post(`talent-upload/${id}/comments`, { text }); }

  /** Admin: trigger Call-Up */
  callUp(id: string): Observable<any> { return this.api.post(`talent-upload/${id}/call-up`, {}); }
  flag(id: string, reason: string): Observable<any> { return this.api.post(`talent-upload/${id}/flag`, { reason }); }
}
