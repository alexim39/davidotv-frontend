// new-private-chat-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { User } from '../chat.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
selector: 'app-new-private-chat-dialog',
imports: [MatDialogModule, MatFormFieldModule, FormsModule, MatInputModule, MatIconModule, MatListModule, CommonModule, MatButtonModule],
template: `
<!-- new-private-chat-dialog.component.html -->
<h2 mat-dialog-title>Start a new chat</h2>
<mat-dialog-content>
  <mat-form-field appearance="outline" class="full-width">
    <mat-label>Search fans</mat-label>
    <input matInput placeholder="Type to search">
    <mat-icon matSuffix>search</mat-icon>
  </mat-form-field>

  <mat-nav-list>
    <mat-list-item *ngFor="let user of users" (click)="dialogRef.close(user)">
      <img matListAvatar [src]="user.avatar" [alt]="user.name">
      <h3 matLine>{{ user.name }}</h3>
      <p matLine>
        <span [style.color]="user.isOnline ? 'green' : 'gray'">
          {{ user.isOnline ? 'Online' : 'Offline' }}
        </span>
      </p>
      <mat-icon *ngIf="user.location === data.currentUser.location" matTooltip="Same location">location_on</mat-icon>
    </mat-list-item>
  </mat-nav-list>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button (click)="onNoClick()">Cancel</button>
</mat-dialog-actions>
`,
styles: [`
    // new-private-chat-dialog.component.scss
.full-width {
  width: 100%;
  margin-bottom: 16px;
}

mat-nav-list {
  padding-top: 0;

  mat-list-item {
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background-color: rgba(143, 0, 69, 0.1);
    }

    mat-icon[matListAvatar] {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    h3 {
      font-weight: 500;
    }

    p {
      color: #666;
      font-size: 0.8rem;
    }

    mat-icon:not([matListAvatar]) {
      color: #8f0045;
    }
  }
}
`]
})
export class NewPrivateChatDialogComponent {
  users: User[] = [
    { id: 'user2', name: 'Chioma Lover', avatar: 'assets/avatars/user2.jpg', location: 'ng', isOnline: true },
    { id: 'user3', name: 'OBO Fan', avatar: 'assets/avatars/user3.jpg', location: 'us', isOnline: false },
    { id: 'user4', name: '30BG Member', avatar: 'assets/avatars/user4.jpg', location: 'gb', isOnline: true }
  ];

  constructor(
    public dialogRef: MatDialogRef<NewPrivateChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentUser: User }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}