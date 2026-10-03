import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { UserProfileService } from './user-profile.service';
import { MembershipService } from '../membership/membership.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'async-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatIconModule, SkeletonLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="profile obsidian-bg">
      @if (loading()) { <async-skeleton-loader [count]="2"/> }
      @else {
        @if (profile(); as p) {
        <div class="header glass-surface">
          <img [src]="p.avatar ?? 'img/avatar.png'" alt="avatar" class="avatar"/>
          <div>
            <h2 class="name">{{p.name}} {{p.lastname}} <span class="handle">&#64;{{p.username}}</span></h2>
            <p class="email">{{p.email}} • {{p.role}}</p>
            <p class="tier">
              @if (tier(); as t) {
                <span class="tier-badge"><mat-icon>verified</mat-icon> {{ t }}</span>
              } @else {
                <span class="tier-free">Free fan</span>
              }
              <a routerLink="/membership" class="tier-link">{{ tier() ? 'Manage' : 'Go premium' }}</a>
            </p>
          </div>
          <label class="upload-btn rose-btn" tabindex="0" role="button"
                 aria-label="Change profile photo"
                 (keydown.enter)="avatarInput.click()" (keydown.space)="$event.preventDefault(); avatarInput.click()">
            <mat-icon aria-hidden="true">photo_camera</mat-icon> Change photo
            <input #avatarInput type="file" hidden accept="image/*" (change)="onAvatar($event)"/>
          </label>
        </div>

        <nav class="shelves glass-surface" aria-label="Your shelves">
          <a routerLink="/library"><mat-icon>video_library</mat-icon><span>Library</span></a>
          <a routerLink="/history"><mat-icon>history</mat-icon><span>History</span></a>
          <a routerLink="/store/orders"><mat-icon>receipt_long</mat-icon><span>Orders</span></a>
          <a routerLink="/store/wishlist"><mat-icon>favorite</mat-icon><span>Wishlist</span></a>
          <a routerLink="/notifications"><mat-icon>notifications</mat-icon><span>Alerts</span></a>
        </nav>

        <form [formGroup]="form" (ngSubmit)="save()" class="form glass-surface">
          <h3 class="sec">Personal</h3>
          <mat-form-field appearance="outline"><mat-label>Bio</mat-label><textarea matInput rows="3" formControlName="bio"></textarea></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Job title</mat-label><input matInput formControlName="jobTitle"/></mat-form-field>
          <button mat-flat-button class="rose-btn" type="submit">Save changes</button>
        </form>
        }
      }
    </section>
  `,
  styles: [`
    .profile{ padding:24px; background:#0B0B0C; min-height:70vh; display:grid; gap:16px; }
    .header{ display:flex; gap:16px; align-items:center; flex-wrap:wrap; padding:18px; border-radius:var(--dt-radius-sheet); background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10); backdrop-filter:blur(16px); }
    .avatar{ width:72px; height:72px; border-radius:50%; object-fit:cover; border:2px solid rgba(251,113,133,0.5); }
    .name{ margin:0; color:#F8F7F8; font-size:18px; font-weight:700; }
    .handle{ color:#FB7185; font-weight:600; }
    .email{ margin:4px 0 0; color:#A1A1AA; font-size:12px; }
    .upload-btn{ margin-left:auto; padding:10px 16px; border-radius:var(--dt-radius-pill); background:linear-gradient(135deg,#BE123C,#FB7185); color:white; cursor:pointer; display:flex; gap:8px; align-items:center; font-weight:600; }
    .tier{ display:flex; gap:8px; align-items:center; margin:6px 0 0; font-size:12px; }
    .tier-badge{ display:inline-flex; gap:4px; align-items:center; background:var(--dt-gradient); color:#fff; font-weight:700; padding:4px 10px; border-radius:var(--dt-radius-pill); text-transform:capitalize; }
    .tier-badge mat-icon{ font-size:14px; width:14px; height:14px; }
    .tier-free{ color:var(--dt-text-3); }
    .tier-link{ color:var(--dt-accent-3); font-weight:600; text-decoration:none; min-height:var(--dt-target); display:inline-flex; align-items:center; }
    .shelves{ display:flex; flex-wrap:wrap; gap:8px; padding:14px 18px; border-radius:var(--dt-radius-sheet); background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); }
    .shelves a{ display:inline-flex; gap:8px; align-items:center; color:var(--dt-text-1); text-decoration:none; font-size:13px; font-weight:600; padding:10px 14px; min-height:var(--dt-target); border:1px solid var(--dt-line); border-radius:var(--dt-radius-pill); }
    .shelves mat-icon{ font-size:18px; width:18px; height:18px; color:var(--dt-accent-3); }
    .form{ padding:18px; border-radius:var(--dt-radius-sheet); background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); display:grid; gap:12px; }
    .sec{ margin:0; color:#F8F7F8; font-size:14px; font-weight:700; }
    .rose-btn{ background:linear-gradient(135deg,#BE123C,#E11D48 50%,#FB7185); color:white; border-radius:var(--dt-radius-pill); }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly svc = inject(UserProfileService);
  private readonly membership = inject(MembershipService);
  private readonly fb = inject(FormBuilder);
  profile = this.svc.profile;
  loading = this.svc.loading;

  form = this.fb.nonNullable.group({ bio: [''], jobTitle: [''] });

  ngOnInit(): void {
    this.svc.fetchMe().subscribe(p=>{
      const data = (p as any)?.data ?? p;
      if(data?.personalInfo){ this.form.patchValue({ bio: data.personalInfo.bio ?? '', jobTitle: data.personalInfo.jobTitle ?? '' }); }
    });
    this.membership.fetchStatus().subscribe({ error: () => {} });
  }

  /** Paid tier name, or null for free fans (upgrade path shown instead). */
  tier(): string | null {
    const t = this.membership.status()?.tier;
    return t && t !== 'free' ? t : null;
  }
  save(): void {
    const { bio, jobTitle } = this.form.getRawValue();
    this.svc.update({ personalInfo: { bio, jobTitle } } as any).subscribe();
  }
  onAvatar(e: Event): void {
    const f = (e.target as HTMLInputElement).files?.[0];
    if(f) this.svc.uploadAvatar(f).subscribe();
  }
}
