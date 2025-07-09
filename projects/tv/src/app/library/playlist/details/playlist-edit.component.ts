import { ChangeDetectorRef, Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlaylistInterface } from '../../library.service';
import { LibraryService } from '../../library.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-playlist-edit-dialog',
  standalone: true,
  providers: [LibraryService],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Playlist</h2>
    <mat-dialog-content>
      <form (ngSubmit)="onSubmit()" #editForm="ngForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput name="title" [(ngModel)]="playlist.title" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput name="description" [(ngModel)]="playlist.description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Visibility</mat-label>
          <mat-select name="isPublic" [(ngModel)]="playlist.isPublic">
            <mat-option [value]="true">Public</mat-option>
            <mat-option [value]="false">Private</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tags</mat-label>
          <mat-chip-grid #chipGrid>
            <mat-chip-row *ngFor="let tag of playlist.tags" (removed)="removeTag(tag)">
              {{ tag }}
              <button matChipRemove>
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip-row>
            <input 
              placeholder="New tag..." 
              [matChipInputFor]="chipGrid" 
              [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
              [matChipInputAddOnBlur]="true"
              (matChipInputTokenEnd)="addTag($event)">
          </mat-chip-grid>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="!editForm.valid"
        (click)="onSubmit()">
        Save Changes
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 16px 24px;
    }
    
    mat-dialog-actions {
      padding: 8px 24px 24px;
      gap: 8px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class PlaylistEditDialogComponent {
  playlist: PlaylistInterface;
  separatorKeysCodes: number[] = [13, 188]; // Enter and comma
  isSaving = false; // Loading state
  private snackBar = inject(MatSnackBar);

 constructor(
    public dialogRef: MatDialogRef<PlaylistEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { playlist: PlaylistInterface },
    private libraryService: LibraryService,
    private cd: ChangeDetectorRef 
  ) {
    // Create a deep copy of the playlist to avoid modifying the original
    this.playlist = JSON.parse(JSON.stringify(data.playlist));
    if (!this.playlist.tags) {
      this.playlist.tags = [];
    }
  }

  addTag(event: any): void {
    const value = (event.value || '').trim();
    if (value && !this.playlist.tags?.includes(value)) {
      this.playlist.tags?.push(value);
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.playlist.tags?.indexOf(tag);
    if (index >= 0) {
      this.playlist.tags.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.playlist.title.trim() && !this.isSaving) {
      this.isSaving = true;
       this.cd.detectChanges();
      
      // Convert isPublic to boolean if it's not already
      this.playlist.isPublic = !!this.playlist.isPublic;
      
      this.libraryService.editPlaylist(this.playlist).subscribe({
        next: (response) => {
          //console.log('Playlist updated successfully:', updatedPlaylist);
          this.snackBar.open(response.message, 'Ok',{duration: 3000});
          this.dialogRef.close(response.data);
          this.isSaving = false;
           this.cd.detectChanges();
        },
        error: (error) => {
          //console.error('Error updating playlist:', error);
           let errorMessage = 'Server error occurred, please try again.'; // default error message.
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Use backend's error message if available.
            }  
            this.snackBar.open(errorMessage, 'Ok',{duration: 3000});
          this.isSaving = false;
           this.cd.detectChanges();
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}