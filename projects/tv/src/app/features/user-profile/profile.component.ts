import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { UserProfileService } from './user-profile.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'async-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatIconModule, SkeletonLoaderComponent],
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
          </div>
          <label class="upload-btn rose-btn">
            <mat-icon>photo_camera</mat-icon> Change photo
            <input type="file" hidden accept="image/*" (change)="onAvatar($event)"/>
          </label>
        </div>

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
    .form{ padding:18px; border-radius:var(--dt-radius-sheet); background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); display:grid; gap:12px; }
    .sec{ margin:0; color:#F8F7F8; font-size:14px; font-weight:700; }
    .rose-btn{ background:linear-gradient(135deg,#BE123C,#E11D48 50%,#FB7185); color:white; border-radius:var(--dt-radius-pill); }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly svc = inject(UserProfileService);
  private readonly fb = inject(FormBuilder);
  profile = this.svc.profile;
  loading = this.svc.loading;

  form = this.fb.nonNullable.group({ bio: [''], jobTitle: [''] });

  ngOnInit(): void {
    this.svc.fetchMe().subscribe(p=>{
      const data = (p as any)?.data ?? p;
      if(data?.personalInfo){ this.form.patchValue({ bio: data.personalInfo.bio ?? '', jobTitle: data.personalInfo.jobTitle ?? '' }); }
    });
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
