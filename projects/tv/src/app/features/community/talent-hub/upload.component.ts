import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TalentService } from './talent.service';

/**
 * Secure multipart upload (audio/video) - stores via Multer on BE.
 * Premium obsidian + glassmorphism, micro-interactions.
 */
@Component({
  selector: 'async-talent-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="upload-wrap obsidian-bg">
      <div class="glass-surface card">
        <h2 class="title">Next Global Star ✨</h2>
        <p class="sub">Upload your track — Davido's team listens to top-voted uploads daily.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <mat-form-field appearance="outline"><mat-label>Track title</mat-label><input matInput formControlName="title"/></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Artist name</mat-label><input matInput formControlName="artistName"/></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Genre</mat-label><input matInput formControlName="genre" placeholder="Afrobeats / Amapiano / R&B"/></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Story behind the track</mat-label><textarea matInput rows="3" formControlName="description"></textarea></mat-form-field>

          <label class="drop" [class.dragover]="dragOver()" (dragover)="onDragOver($event)" (dragleave)="dragOver.set(false)" (drop)="onDrop($event)">
            <mat-icon>cloud_upload</mat-icon>
            <span>{{ file()?.name ?? 'Drag audio/video here or click to browse (mp3, wav, mp4, mov ≤ 100MB)' }}</span>
            <input type="file" hidden (change)="onFile($event)" accept="audio/*,video/*"/>
          </label>

          @if (error()) { <p class="err">{{error()}}</p> }
          @if (success()) { <p class="ok">✅ Uploaded! You've entered the queue.</p> }
          @if (uploading()) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }

          <button mat-flat-button class="rose-btn" type="submit" [disabled]="form.invalid || !file() || uploading()">
            {{ uploading() ? 'Uploading…' : 'Submit to Talent Hub' }}
          </button>
          <p class="hint">By uploading you agree to community guidelines. Plays, likes & shares rank you higher.</p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .upload-wrap{ min-height:70vh; display:grid; place-items:center; padding:24px; background:#0B0B0C; }
    .card{ max-width:640px; width:100%; padding:28px; border-radius:20px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10); backdrop-filter: blur(16px); }
    .title{ margin:0; font-size:24px; font-weight:800; color:#F8F7F8; }
    .sub{ color:#A1A1AA; font-size:13px; margin:6px 0 16px; }
    .form{ display:grid; gap:12px; }
    .drop{ display:grid; place-items:center; gap:8px; padding:22px; border:1.5px dashed rgba(255,255,255,0.18); border-radius:16px; text-align:center; color:#A1A1AA; cursor:pointer; transition: border-color 180ms, background 180ms; }
    .drop.dragover{ border-color:#FB7185; background:rgba(251,113,133,0.08); }
    .rose-btn{ height:48px; border-radius:999px; background:linear-gradient(135deg,#BE123C,#E11D48 50%,#FB7185); color:white; font-weight:600; box-shadow:0 8px 24px rgba(225,29,72,0.35); }
    .err{ color:#FB7185; font-size:13px; margin:0; }
    .ok{ color:#4ADE80; font-size:13px; margin:0; }
    .hint{ color:#71717A; font-size:11px; text-align:center; }
  `]
})
export class TalentUploadComponent {
  private readonly fb = inject(FormBuilder);
  private readonly talent = inject(TalentService);

  dragOver = signal(false);
  file = signal<File | null>(null);
  uploading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    artistName: ['', Validators.required],
    genre: ['Afrobeats', Validators.required],
    description: ['']
  });

  onFile(e: Event): void {
    const f = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.setFile(f);
  }
  onDragOver(e: DragEvent): void { e.preventDefault(); this.dragOver.set(true); }
  onDrop(e: DragEvent): void {
    e.preventDefault(); this.dragOver.set(false);
    const f = e.dataTransfer?.files?.[0] ?? null;
    this.setFile(f);
  }
  private setFile(f: File | null): void {
    this.error.set(null); this.success.set(false);
    if (!f) { this.file.set(null); return; }
    const okType = /^(audio|video)\//.test(f.type);
    const okSize = f.size <= 100 * 1024 * 1024;
    if (!okType) this.error.set('Only audio/video files allowed');
    else if (!okSize) this.error.set('File must be ≤ 100MB');
    else this.file.set(f);
  }

  submit(): void {
    if (this.form.invalid || !this.file()) return;
    this.uploading.set(true); this.error.set(null); this.success.set(false);
    const fd = new FormData();
    Object.entries(this.form.getRawValue()).forEach(([k,v])=> fd.append(k, v));
    fd.append('file', this.file()!);
    // cover optional - omit for brevity

    this.talent.upload(fd).subscribe({
      next: () => { this.uploading.set(false); this.success.set(true); this.form.reset({ genre:'Afrobeats' } as any); this.file.set(null); },
      error: (e) => { this.uploading.set(false); this.error.set(e?.message ?? 'Upload failed'); }
    });
  }
}
