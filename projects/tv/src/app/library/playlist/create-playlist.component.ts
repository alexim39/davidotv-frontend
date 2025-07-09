import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { LibraryService } from '../library.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserInterface, UserService } from '../../common/services/user.service';
import { Subscription } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface CreatePlaylistData {
    title: string;
    visibility: 'public' | 'private';
}

@Component({
    selector: 'app-create-playlist-dialog',
    standalone: true,
    providers: [LibraryService],
    imports: [
        CommonModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatProgressBarModule
    ],
    template: `
        <h2 mat-dialog-title>Create Playlist</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" mat-dialog-content>
            <mat-form-field appearance="fill" class="full-width">
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" required />
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
                <mat-label>Visibility</mat-label>
                <mat-select formControlName="visibility" required>
                    <mat-option value="public">Public</mat-option>
                    <mat-option value="private">Private</mat-option>
                </mat-select>
            </mat-form-field>

            <mat-progress-bar mode="indeterminate" *ngIf="isSubmitting"></mat-progress-bar>

            <mat-form-field appearance="fill" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>

            <div mat-dialog-actions align="end">
                <button mat-button type="button" (click)="onCancel()">Cancel</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Create</button>
            </div>
        </form>

    `,
    styles: [`
        .full-width { width: 100%; }
        [mat-dialog-actions] { margin-top: 16px; }
    `]
})
export class CreatePlaylistDialogComponent implements OnInit, OnDestroy {
    form: FormGroup;
    private snackBar = inject(MatSnackBar);
    private userService = inject(UserService);
    currentUser: UserInterface | null = null;
    subscriptions: Subscription[] = [];
    isSubmitting = false;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CreatePlaylistDialogComponent, CreatePlaylistData>,
        private libraryService: LibraryService
    ) {
        this.form = this.fb.group({
            title: ['', Validators.required],
            visibility: ['public', Validators.required],
            description: [''] // Optional field
        });

    }

     ngOnInit() {
        this.subscriptions.push(
            this.userService.getCurrentUser$.subscribe({
                next: (user) => {
                this.currentUser = user;
                //console.log('current user ',this.currentUser)
                }
            })
        )
    }

    ngOnDestroy() {
        // unsubscribe list
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    } 

    onSubmit() {
        if (this.form.valid) {
            if (!this.currentUser) return;

            const { title, visibility, description } = this.form.value;

            const payload = {
            title,
            content: description || '',
            visibility, // Assuming visibility is used as a tag
            userId: this.currentUser?._id // Replace with actual user ID logic
            };

            this.libraryService.createPlaylist(payload).subscribe({
            next: (response) => {
                this.snackBar.open(response.message, 'Ok',{duration: 3000});
                this.dialogRef.close(response); // Optionally return the created playlist
            },
            error: (error) => {

                let errorMessage = 'Server error occurred, please try again.'; // default error message.
                if (error.error && error.error.message) {
                    errorMessage = error.error.message; // Use backend's error message if available.
                }  
                this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
                this.isSubmitting = false;
            }
            });
        }
    }


    onCancel() {
        this.dialogRef.close();
    }
}