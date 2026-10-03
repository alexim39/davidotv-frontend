import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MediaService } from '../../media.service';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ShortNumberPipe } from '../../../../shared/pipes/short-number.pipe';
import { timeAgo as timeAgoUtil } from '../../../../common/utils/time.util';

export interface VideoCommentView {
  id: string;
  text: string;
  authorName: string;
  authorAvatar?: string;
  authorId?: string;
  createdAt?: string | Date;
  likeCount: number;
  liked?: boolean;
  replies: VideoCommentView[];
}

/**
 * Watch-page comments: list + post + like + reply + delete-own.
 * List is embedded in the video payload (no separate list endpoint);
 * mutations apply locally on success. Shapes are defensive — the comment
 * payload is backend-owned and has drifted before.
 */
@Component({
  selector: 'async-video-comments',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSnackBarModule,
    EmptyStateComponent, ShortNumberPipe,
  ],
  template: `
    <section class="comments" aria-labelledby="comments-title">
      <h2 id="comments-title" class="chead">{{ comments().length }} Comments</h2>

      <div class="composer">
        <mat-form-field appearance="outline" class="composer-field">
          <mat-label>{{ authed() ? 'Add a comment' : 'Sign in to comment' }}</mat-label>
          <input matInput [(ngModel)]="draft" maxlength="1000"
                 [disabled]="!authed()" (keyup.enter)="post()" aria-label="Comment text" />
        </mat-form-field>
        <button mat-flat-button class="rose-btn" (click)="post()"
                [disabled]="!authed() || !draft.trim() || posting()">
          {{ posting() ? 'Posting…' : 'Post' }}
        </button>
      </div>
      @if (!authed()) {
        <p class="signin-hint">Please sign in to join the discussion.</p>
      }

      @if (comments().length === 0) {
        <async-empty-state
          icon="forum" title="No comments yet"
          message="Be the first to share your take on this video." />
      }

      <div class="list">
        @for (c of comments(); track c.id) {
          <article class="comment">
            <img class="avatar" [src]="c.authorAvatar || '/img/avatar.png'" [alt]="c.authorName" loading="lazy" />
            <div class="cbody">
              <p class="chead-row"><strong>{{ c.authorName }}</strong><span class="time">{{ timeAgo(when(c)) }}</span></p>
              <p class="ctext">{{ c.text }}</p>
              <div class="cactions">
                <button mat-button (click)="like(c)" [attr.aria-pressed]="c.liked" aria-label="Like comment">
                  <mat-icon [style.color]="c.liked ? '#FB7185' : ''">{{ c.liked ? 'favorite' : 'favorite_border' }}</mat-icon>
                  <span>{{ c.likeCount | shortNumber }}</span>
                </button>
                <button mat-button (click)="toggleReply(c.id)" aria-label="Reply to comment">
                  <mat-icon>reply</mat-icon><span>Reply</span>
                </button>
                @if (isMine(c)) {
                  <button mat-button color="warn" (click)="remove(c)" aria-label="Delete comment">
                    <mat-icon>delete</mat-icon>
                  </button>
                }
              </div>
              @if (replyOpen() === c.id) {
                <div class="reply-box">
                  <mat-form-field appearance="outline" class="composer-field">
                    <mat-label>Write a reply</mat-label>
                    <input matInput [(ngModel)]="replyDraft" maxlength="1000" aria-label="Reply text" />
                  </mat-form-field>
                  <button mat-stroked-button class="ghost-btn" (click)="sendReply(c)" [disabled]="!replyDraft.trim() || posting()">
                    Reply
                  </button>
                </div>
              }
              @if (c.replies.length > 0) {
                <div class="replies">
                  @for (r of c.replies; track r.id) {
                    <article class="comment reply">
                      <img class="avatar" [src]="r.authorAvatar || '/img/avatar.png'" [alt]="r.authorName" loading="lazy" />
                      <div class="cbody">
                        <p class="chead-row"><strong>{{ r.authorName }}</strong><span class="time">{{ timeAgo(when(r)) }}</span></p>
                        <p class="ctext">{{ r.text }}</p>
                      </div>
                    </article>
                  }
                </div>
              }
            </div>
          </article>
        }
      </div>
    </section>
  `,
  styles: [`
    .comments { max-width: 1100px; margin: 4px auto 0; padding: 0 20px 8px; display: grid; gap: var(--dt-space-3); }
    .chead { margin: 0; font-size: 18px; font-weight: 800; color: var(--dt-text-1); }
    .composer { display: flex; gap: var(--dt-space-2); align-items: flex-start; }
    .composer-field { flex: 1; }
    .rose-btn, .ghost-btn { min-height: var(--dt-target); border-radius: var(--dt-radius-pill); }
    .ghost-btn { color: var(--dt-text-1); border-color: var(--dt-line-strong); }
    .signin-hint { margin: 0; font-size: 13px; color: var(--dt-text-3); }
    .list { display: grid; gap: var(--dt-space-3); }
    .comment { display: flex; gap: var(--dt-space-2); }
    .avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    .cbody { flex: 1; display: grid; gap: 2px; min-width: 0; }
    .chead-row { margin: 0; display: flex; gap: 8px; align-items: baseline; font-size: 13px; color: var(--dt-text-1); }
    .time { font-size: 12px; color: var(--dt-text-3); }
    .ctext { margin: 0; font-size: 14px; color: var(--dt-text-2); line-height: 1.5; white-space: pre-line; }
    .cactions { display: flex; gap: 2px; align-items: center; margin-left: -8px; }
    .cactions button { min-height: var(--dt-target); color: var(--dt-text-2); }
    .reply-box { display: flex; gap: var(--dt-space-2); align-items: flex-start; margin-top: var(--dt-space-2); }
    .replies { display: grid; gap: var(--dt-space-2); margin-top: var(--dt-space-2); padding-left: var(--dt-space-3); border-left: 2px solid var(--dt-line); }
  `]
})
export class VideoCommentsComponent implements OnChanges {
  @Input() videoId = '';
  @Input() initial: unknown[] = [];

  private readonly media = inject(MediaService);
  private readonly auth = inject(AuthStateService);
  private readonly snack = inject(MatSnackBar);

  comments = signal<VideoCommentView[]>([]);
  draft = '';
  replyDraft = '';
  replyOpen = signal<string | null>(null);
  posting = signal(false);

  timeAgo = timeAgoUtil;

  /** Guarded date (build-strict nullability; missing dates read as now). */
  when(c: VideoCommentView): string | Date {
    return c.createdAt ?? new Date();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initial']) {
      this.comments.set(this.normalizeList(this.initial));
    }
  }

  authed(): boolean {
    return !!this.auth.user();
  }

  isMine(c: VideoCommentView): boolean {
    const me = this.auth.user() as unknown as { _id?: string; id?: string } | null;
    const mine = me?._id ?? me?.id;
    return !!mine && !!c.authorId && c.authorId === mine;
  }

  post(): void {
    const text = this.draft.trim();
    if (!this.authed()) {
      this.snack.open('Sign in to comment.', 'Dismiss', { duration: 3000 });
      return;
    }
    if (!text || this.posting()) return;
    this.posting.set(true);
    this.media.addVideoComment(this.videoId, text).subscribe({
      next: (res: any) => {
        const saved = res?.data ?? res;
        this.comments.update((list) => [this.normalizeOne(saved, text), ...list]);
        this.draft = '';
        this.posting.set(false);
      },
      error: (e) => {
        this.posting.set(false);
        this.snack.open(e?.message ?? 'Could not post comment.', 'Dismiss', { duration: 3000 });
      },
    });
  }

  like(c: VideoCommentView): void {
    if (!this.authed()) {
      this.snack.open('Sign in to like comments.', 'Dismiss', { duration: 3000 });
      return;
    }
    if (c.liked) return;
    this.media.likeVideoComment(this.videoId, c.id).subscribe({
      next: () => this.patch(c.id, { liked: true, likeCount: c.likeCount + 1 }),
      error: (e) => this.snack.open(e?.message ?? 'Like failed.', 'Dismiss', { duration: 3000 }),
    });
  }

  toggleReply(id: string): void {
    if (!this.authed()) {
      this.snack.open('Sign in to reply.', 'Dismiss', { duration: 3000 });
      return;
    }
    this.replyDraft = '';
    this.replyOpen.update((open) => (open === id ? null : id));
  }

  sendReply(parent: VideoCommentView): void {
    const text = this.replyDraft.trim();
    if (!text || this.posting()) return;
    this.posting.set(true);
    this.media.replyVideoComment(this.videoId, parent.id, text).subscribe({
      next: (res: any) => {
        const saved = res?.data ?? res;
        this.patch(parent.id, { replies: [...parent.replies, this.normalizeOne(saved, text)] });
        this.replyDraft = '';
        this.replyOpen.set(null);
        this.posting.set(false);
      },
      error: (e) => {
        this.posting.set(false);
        this.snack.open(e?.message ?? 'Could not post reply.', 'Dismiss', { duration: 3000 });
      },
    });
  }

  remove(c: VideoCommentView): void {
    this.media.deleteVideoComment(this.videoId, c.id).subscribe({
      next: () => this.comments.update((list) => list.filter((i) => i.id !== c.id)),
      error: (e) => this.snack.open(e?.message ?? 'Delete failed.', 'Dismiss', { duration: 3000 }),
    });
  }

  private patch(id: string, p: Partial<VideoCommentView>): void {
    this.comments.update((list) => list.map((i) => (i.id === id ? { ...i, ...p } : i)));
  }

  private normalizeList(raw: unknown): VideoCommentView[] {
    const list = Array.isArray(raw) ? raw : [];
    return list.map((c) => this.normalizeOne(c));
  }

  private normalizeOne(c: any, fallbackText = ''): VideoCommentView {
    const author = c?.author ?? c?.user ?? {};
    const likes = c?.likeCount ?? (Array.isArray(c?.likes) ? c.likes.length : c?.likes) ?? 0;
    return {
      id: String(c?._id ?? c?.id ?? `${Date.now()}`),
      text: String(c?.text ?? c?.content ?? c?.body ?? fallbackText),
      authorName: String(author?.name ?? author?.username ?? c?.authorName ?? 'Fan'),
      authorAvatar: author?.avatar ?? c?.authorAvatar,
      authorId: author?._id ? String(author._id) : author?.id ? String(author.id) : undefined,
      createdAt: c?.createdAt ?? c?.date,
      likeCount: Number(likes) || 0,
      liked: !!(c?.isLiked ?? c?.liked),
      replies: Array.isArray(c?.replies) ? c.replies.map((r: any) => this.normalizeOne(r)) : [],
    };
  }
}
