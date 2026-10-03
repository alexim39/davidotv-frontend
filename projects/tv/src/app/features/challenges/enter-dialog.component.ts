import { Component, OnInit, inject, signal, ChangeDetectionStrategy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ChallengeService, Challenge } from './challenge.service';

export interface EnterDialogData { uploadId: string; uploadTitle: string; }

/**
 * Enter one of your uploads into an active challenge.
 * Listed here inline (dialog lives next to the board feature).
 */
@Component({
  selector: 'async-enter-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSelectModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Enter "{{data.uploadTitle}}" in…</h2>
    <mat-dialog-content>
      @if (loading()) { <p class="hint">Loading active challenges…</p> }
      @else if (items().length === 0) {
        <p class="hint">No active challenges right now.</p>
      } @else {
        <mat-form-field appearance="outline" class="full">
          <mat-label>Challenge</mat-label>
          <mat-select [(value)]="selectedId">
            @for (c of items(); track c._id) {
              <mat-option [value]="c._id">{{c.title}} ({{c.entries.length}} entries)</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }
      @if (error()) { <p class="err">{{error()}}</p> }
      @if (done()) { <p class="ok">Entered ✓ — rally likes on the talent feed!</p> }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
      <button mat-flat-button class="rose-btn" [disabled]="!selectedId || busy() || done()" (click)="enter()">
        {{ busy() ? 'Entering…' : 'Enter challenge' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full{ width:100%; }
    .hint{ color:#A1A1AA; font-size:13px; }
    .err{ color:#FB7185; font-size:13px; }
    .ok{ color:#4ADE80; font-size:13px; }
    .rose-btn{ background:linear-gradient(135deg,#BE123C,#FB7185); color:white; border-radius:var(--dt-radius-pill); }
  `]
})
export class EnterChallengeDialogComponent implements OnInit {
  private readonly challenges = inject(ChallengeService);
  private readonly ref = inject(MatDialogRef<EnterChallengeDialogComponent>);
  readonly data = inject<EnterDialogData>(MAT_DIALOG_DATA);

  items = this.challenges.challenges;
  loading = this.challenges.loading;
  selectedId: string | null = null;
  busy = signal(false);
  done = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.challenges.list('active').subscribe();
  }

  enter(): void {
    if (!this.selectedId || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    this.challenges.enter(this.selectedId, this.data.uploadId).subscribe({
      next: () => { this.busy.set(false); this.done.set(true); },
      error: (e) => { this.busy.set(false); this.error.set(e?.message ?? 'Entry failed'); },
    });
  }
}
