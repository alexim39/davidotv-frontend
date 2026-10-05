import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TalentService, TalentUpload } from './talent.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ShortNumberPipe } from '../../../shared/pipes/short-number.pipe';
import { IntersectionDirective } from '../../../shared/directives/intersection.directive';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { EnterChallengeDialogComponent } from '../../challenges/enter-dialog.component';
import { CalledUpWallComponent } from './called-up-wall/called-up-wall.component';

/**
 * Public talent feed - TikTok/Spotify inspired vertical list with play + like/share.
 * Tiered ranking via likeCount/plays (BE sort).
 */
@Component({
  selector: 'async-talent-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatDialogModule, MatSnackBarModule, MatChipsModule, SkeletonLoaderComponent, ShortNumberPipe, IntersectionDirective, CalledUpWallComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="feed obsidian-bg">
      <div class="hero glass-surface">
        <h2 class="hero-title">Next Global Star</h2>
        <p class="hero-sub">Discover underground Afrobeat. Your likes & shares push talent to Davido's curated queue.</p>
        <a mat-flat-button class="rose-btn" routerLink="upload"><mat-icon>upload</mat-icon> Upload your track</a>
        <a mat-stroked-button routerLink="/challenges" class="ghost"><mat-icon>emoji_events</mat-icon> Challenges</a>
        <a mat-stroked-button routerLink="curated" class="ghost">Curated (Admin)</a>
      </div>

      <mat-chip-listbox class="genres" aria-label="Filter by genre">
        @for (g of genres; track g) {
          <mat-chip-option [selected]="genre() === g" (click)="setGenre(g)">{{ g }}</mat-chip-option>
        }
      </mat-chip-listbox>

      <mat-chip-listbox class="sorts" aria-label="Sort uploads">
        @for (s of sorts; track s.value) {
          <mat-chip-option [selected]="sort() === s.value" (click)="setSort(s.value)">{{ s.label }}</mat-chip-option>
        }
      </mat-chip-listbox>

      @if (loading() && items().length===0) { <async-skeleton-loader [count]="6"/> }
      @else {
        <async-called-up-wall />
        <div class="grid">
          @for (t of items(); track t._id) {
            <div class="card glass-surface">
              <div class="cover" [style.background]="t.coverUrl ? 'url('+t.coverUrl+') center/cover' : 'linear-gradient(135deg,#1A1A1E,#BE123C)'">
                <button class="play-fab" (click)="play(t)"><mat-icon>play_arrow</mat-icon></button>
              </div>
              <div class="body">
                <h3 class="t-title">{{t.title}}</h3>
                <p class="artist">{{t.artistName}} • &#64;{{t.uploader.username}}</p>
                <audio controls [src]="t.fileUrl" preload="metadata" (play)="play(t)"></audio>
                <div class="eng">
                  <button mat-stroked-button (click)="like(t)"><mat-icon [style.color]="likedSet().has(t._id) ? '#FB7185':''">favorite</mat-icon> {{t.likeCount | shortNumber}}</button>
                  <button mat-stroked-button (click)="toggleComments(t._id)" [attr.aria-expanded="commentsOpen() === t._id">
                    <mat-icon>comment</mat-icon> {{ commentCount(t) | shortNumber }}
                  </button>
                  <button mat-stroked-button (click)="share(t)"><mat-icon>share</mat-icon> {{t.shareCount | shortNumber}}</button>
                  @if (isMine(t)) {
                    <button mat-stroked-button (click)="enterChallenge(t)"><mat-icon>emoji_events</mat-icon> Enter</button>
                  }
                  <span class="plays"><mat-icon>headphones</mat-icon> {{t.plays | shortNumber}} plays</span>
                </div>
                @if (commentsOpen() === t._id) {
                  <div class="thread">
                    @for (c of commentsOf(t); track $index) {
                      <div class="tcomment">
                        <span class="cauthor">{{ c.author }}</span>
                        <span class="ctext">{{ c.text }}</span>
                      </div>
                    } @empty {
                      <p class="tempty">No comments yet — say what this sound does to you.</p>
                    }
                    <div class="composer">
                      <mat-form-field appearance="outline" class="composer-field">
                        <mat-label>{{ authed() ? 'Support with words' : 'Sign in to comment' }}</mat-label>
                        <input matInput [(ngModel)]="commentDraft" maxlength="500"
                               [disabled]="!authed()" (keyup.enter)="sendComment(t)" aria-label="Comment text" />
                      </mat-form-field>
                      <button mat-flat-button class="rose-btn" (click)="sendComment(t)"
                              [disabled]="!authed() || !commentDraft.trim() || postingComment()">
                        {{ postingComment() ? 'Posting…' : 'Post' }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
        <div asyncIntersection (intersecting)="loadMore()" class="sentinel"></div>
        @if (loadingMore()) { <async-skeleton-loader [count]="3"/> }
      }
    </section>
  `,
  styles: [`
    .feed{ padding:24px; background:#0B0B0C; min-height:70vh; }
    .hero{ padding:22px; border-radius:var(--dt-radius-sheet); background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10); backdrop-filter:blur(16px); display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin-bottom:18px; }
    .hero-title{ margin:0; font-size:22px; font-weight:800; color:#F8F7F8; flex:1 1 100%; }
    .hero-sub{ color:#A1A1AA; font-size:13px; margin:0; flex:1 1 100%; }
    .rose-btn{ background:linear-gradient(135deg,#BE123C,#E11D48 50%,#FB7185); color:white; border-radius:var(--dt-radius-pill); }
    .ghost{ border-color:rgba(255,255,255,0.18); color:#F8F7F8; border-radius:var(--dt-radius-pill); }
    .grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px; }
    .genres{ display:flex; gap:8px; overflow-x:auto; padding:2px 2px 4px; margin-bottom:8px; }
    .sorts{ display:flex; gap:8px; overflow-x:auto; padding:2px 2px 4px; margin-bottom:16px; }
    .card{ overflow:hidden; border-radius:var(--dt-radius-sheet); background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); backdrop-filter:blur(14px); }
    .cover{ height:160px; display:grid; place-items:center; position:relative; }
    .play-fab{ width:56px; height:56px; border-radius:50%; border:0; background:rgba(255,255,255,0.92); display:grid; place-items:center; cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,0.35); }
    .body{ padding:14px; display:grid; gap:8px; }
    .t-title{ margin:0; color:#F8F7F8; font-size:16px; font-weight:700; }
    .artist{ margin:0; color:#A1A1AA; font-size:12px; }
    audio{ width:100%; }
    .eng{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .plays{ margin-left:auto; color:#71717A; font-size:12px; display:flex; gap:6px; align-items:center; }
    .thread{ display:grid; gap:8px; padding:12px 14px 14px; border-top:1px solid var(--dt-line); }
    .tcomment{ display:flex; gap:8px; align-items:baseline; font-size:13px; }
    .cauthor{ color:var(--dt-accent-3); font-weight:700; flex-shrink:0; }
    .ctext{ color:var(--dt-text-2); margin:0; }
    .tempty{ margin:0; font-size:12px; color:var(--dt-text-3); }
    .composer{ display:flex; gap:8px; align-items:flex-start; }
    .composer-field{ flex:1; }
    .sentinel{ height:1px; }
  `]
})
export class TalentFeedComponent implements OnInit {
  private readonly talent = inject(TalentService);
  private readonly analytics = inject(AnalyticsService);
  private readonly auth = inject(AuthStateService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  items = signal<TalentUpload[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  page = signal(1);
  readonly genres = ['All', 'Afrobeats', 'Amapiano', 'Hip-Hop', 'R&B', 'Gospel', 'Highlife', 'Fuji'];
  genre = signal('All');
  readonly sorts = [
    { label: 'Top', value: '-likeCount,-plays' },
    { label: 'Newest', value: '-createdAt' },
  ];
  sort = signal('-likeCount,-plays');

  setSort(v: string): void {
    if (this.sort() === v) return;
    this.sort.set(v);
    this.items.set([]);
    this.page.set(1);
    this.loadMore();
  }
  commentsOpen = signal<string | null>(null);
  commentDraft = '';
  postingComment = signal(false);
  /** Signal so OnPush re-renders the heart state (a plain Set never surfaces). */
  likedSet = signal<Set<string>>(new Set());

  ngOnInit(): void { this.loadMore(); }

  setGenre(g: string): void {
    if (this.genre() === g) return;
    this.genre.set(g);
    this.items.set([]);
    this.page.set(1);
    this.loadMore();
  }

  loadMore(): void {
    if (this.loadingMore()) return;
    const p = this.page();
    const isFirst = p === 1;
    if (isFirst) this.loading.set(true); else this.loadingMore.set(true);
    const g = this.genre();
    this.talent.list({ page: p, limit: 9, sort: this.sort(), genre: g === 'All' ? undefined : g }).subscribe({
      next: (res:any)=> {
        const data: TalentUpload[] = res?.data ?? res ?? [];
        this.items.update(v=> [...v, ...data]);
        this.page.update(v=>v+1);
        this.loading.set(false); this.loadingMore.set(false);
      },
      error: ()=> { this.loading.set(false); this.loadingMore.set(false); }
    });
  }
  like(t: TalentUpload): void {
    if (this.likedSet().has(t._id)) return;
    this.analytics.track('like', t._id);
    this.talent.like(t._id).subscribe({
      next: () => {
        this.patchItem(t._id, { likeCount: (t.likeCount || 0) + 1 });
        this.likedSet.update((s) => new Set(s).add(t._id));
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'Like failed. Please try again.';
        this.snack.open(msg, 'Close', { duration: 3000 });
      }
    });
  }
  share(t: TalentUpload): void {
    this.analytics.track('share', t._id);
    this.talent.share(t._id).subscribe({
      next: () => this.patchItem(t._id, { shareCount: (t.shareCount || 0) + 1 }),
      error: () => {}
    });
    if (navigator.share) {
      navigator.share({ title: t.title, text: `${t.title} by ${t.artistName} — Next Global Star on DavidoTV`, url: location.href }).catch(()=>{});
    }
  }
  play(t: TalentUpload): void {
    this.analytics.track('talent_view', t._id);
    this.talent.play(t._id).subscribe({
      next: () => this.patchItem(t._id, { plays: (t.plays || 0) + 1 }),
      error: () => {}
    });
  }
  /** Immutable patch so OnPush re-renders counts (plain mutation never surfaces). */
  private patchItem(id: string, patch: Partial<TalentUpload>): void {
    this.items.update((list) => list.map((i) => (i._id === id ? { ...i, ...patch } : i)));
  }
  authed(): boolean {
    return !!this.auth.user();
  }
  /** Embedded comments if the backend includes them, else session-posted ones. */
  commentsOf(t: TalentUpload): { author: string; text: string }[] {
    const embedded = (t as unknown as { comments?: unknown }).comments;
    const base = Array.isArray(embedded) ? embedded : [];
    return base.map((c: any) => ({
      author: String(c?.author?.username ?? c?.author?.name ?? c?.author ?? 'Fan'),
      text: String(c?.text ?? c?.content ?? c?.body ?? ''),
    })).filter((c) => c.text);
  }
  commentCount(t: TalentUpload): number {
    return this.commentsOf(t).length;
  }
  toggleComments(id: string): void {
    this.commentDraft = '';
    this.commentsOpen.update((open) => (open === id ? null : id));
  }
  sendComment(t: TalentUpload): void {
    const text = this.commentDraft.trim();
    if (!this.authed()) {
      this.snack.open('Sign in to comment.', 'Dismiss', { duration: 3000 });
      return;
    }
    if (!text || this.postingComment()) return;
    this.postingComment.set(true);
    this.talent.comment(t._id, text).subscribe({
      next: (res: any) => {
        const saved = res?.data ?? res;
        const me = this.auth.user();
        const author = (me as unknown as { username?: string } | null)?.username ?? 'You';
        const echoed = {
          author: String(saved?.author?.username ?? saved?.author ?? author),
          text: String(saved?.text ?? saved?.content ?? text),
        };
        const current = (t as unknown as { comments?: unknown[] }).comments;
        this.patchItem(t._id, { comments: [...(Array.isArray(current) ? current : []), echoed] } as Partial<TalentUpload>);
        this.commentDraft = '';
        this.postingComment.set(false);
      },
      error: (err) => {
        this.postingComment.set(false);
        this.snack.open(err?.message ?? 'Could not post comment.', 'Dismiss', { duration: 3000 });
      },
    });
  }
  /** Own uploads only — the backend enforces ownership too. */
  isMine(t: TalentUpload): boolean {
    const me = this.auth.user();
    return !!me && t.uploader?.username === me.username;
  }
  enterChallenge(t: TalentUpload): void {
    const me = this.auth.user();
    if (!me) {
      this.snack.open('Sign in to enter challenges.', 'Dismiss', { duration: 3000 });
      return;
    }
    this.dialog.open(EnterChallengeDialogComponent, {
      width: '420px',
      data: { uploadId: t._id, uploadTitle: t.title },
    });
  }
}
