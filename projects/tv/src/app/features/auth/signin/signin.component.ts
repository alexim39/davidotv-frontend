import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule, Router } from '@angular/router';
import { AuthStateService } from '../../../core/services/auth-state.service';

/**
 * Premium obsidian sign-in - glassmorphism + rose gradient CTA.
 * Zoneless: signals for loading/error.
 */
@Component({
  selector: 'async-signin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatIconModule, MatCardModule, RouterModule],
  template: `
    <div class="auth-wrap obsidian-bg">
      <div class="glass-card auth-card">
        <h1 class="title">Welcome back</h1>
        <p class="subtitle">Sign in to DavidoTV — the home of Afrobeat</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" autocomplete="email"/>
            <mat-icon matPrefix>mail</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Password</mat-label>
            <input matInput [type]="hide() ? 'password':'text'" formControlName="password"/>
            <button mat-icon-button matSuffix type="button" (click)="hide.set(!hide())"><mat-icon>{{ hide() ? 'visibility_off':'visibility' }}</mat-icon></button>
          </mat-form-field>

          @if (error()) { <p class="error">{{ error() }}</p> }

          <button mat-flat-button class="rose-btn full" type="submit" [disabled]="form.invalid || loading()">
            @if (loading()) { Signing in… } @else { Sign in }
          </button>
        </form>

        <p class="hint">No account? <a routerLink="/auth/signup">Create one</a> • <a routerLink="/auth/forgot-password">Forgot?</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrap { min-height: 100vh; display:grid; place-items:center; padding:24px; background:#0B0B0C; }
    .auth-card { max-width: 440px; width:100%; padding:32px; background: rgba(255,255,255,0.06); backdrop-filter: blur(16px); border:1px solid rgba(255,255,255,0.10); border-radius:var(--dt-radius-sheet); }
    .title { font-size:28px; font-weight:800; margin:0 0 6px; color:#F8F7F8; }
    .subtitle { color:#A1A1AA; margin:0 0 20px; font-size:14px; }
    .form { display:grid; gap:12px; }
    .full { width:100%; }
    .rose-btn { background: linear-gradient(135deg,#BE123C,#E11D48 50%,#FB7185); color:white; height:48px; border-radius:var(--dt-radius-pill); font-weight:600; box-shadow:0 8px 24px rgba(225,29,72,0.35); }
    .error { color:#FB7185; font-size:13px; margin:0; }
    .hint { margin-top:16px; text-align:center; color:#71717A; font-size:13px; }
    .hint a { color:#FB7185; text-decoration:none; }
  `]
})
export class SigninComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthStateService);
  private readonly router = inject(Router);

  hide = signal(true);
  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login({ email, password }).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/']); },
      error: (e) => { this.loading.set(false); this.error.set(e?.message ?? 'Sign in failed'); }
    });
  }
}
