import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ForumService } from './forum.service';
import { MatInputModule } from '@angular/material/input';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserInterface, UserService } from '../common/services/user.service';

@Component({
  selector: 'app-create-thread',
  providers: [ForumService],
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    FormsModule, 
    MatButtonModule, 
    MatDialogModule, 
    MatInputModule, 
    MatChipsModule, 
    CommonModule,
    MatAutocompleteModule,
    MatIconModule
  ],
template: `
    <h2 mat-dialog-title>Create New Thread</h2>

    <mat-dialog-content>
      <form [formGroup]="threadForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Thread Title</mat-label>
          <input matInput formControlName="title" required>
          <mat-error *ngIf="threadForm.get('title')?.hasError('required')">
            Title is required
          </mat-error>
          <mat-error *ngIf="threadForm.get('title')?.hasError('maxlength')">
            Title must be less than 200 characters
          </mat-error>
        </mat-form-field>
       
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Content</mat-label>
          <textarea matInput formControlName="content" rows="8" required></textarea>
          <mat-error *ngIf="threadForm.get('content')?.hasError('required')">
            Content is required
          </mat-error>
          <mat-error *ngIf="threadForm.get('content')?.hasError('maxlength')">
            Content must be less than 5000 characters
          </mat-error>
        </mat-form-field>
       
        <div class="tags-section">
          <h4>Tags</h4>
          <mat-form-field appearance="outline">
            <mat-label>Add Tags</mat-label>
            <mat-chip-grid #chipGrid>
              <mat-chip-row *ngFor="let tag of tags" (removed)="removeTag(tag)">
                {{tag}}
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip-row>
              <input 
                placeholder="New tag..."
                #tagInput
                [formControl]="tagCtrl"
                [matChipInputFor]="chipGrid"
                [matAutocomplete]="auto"
                [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                (matChipInputTokenEnd)="addTag($event)">
            </mat-chip-grid>
            <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selected($event)">
              <mat-option *ngFor="let tag of filteredTags | async" [value]="tag">
                {{tag}}
              </mat-option>
            </mat-autocomplete>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button
              color="primary"
              (click)="onSubmit()"
              [disabled]="threadForm.invalid">
        Create Thread
      </button>
    </mat-dialog-actions>
`,
styles: [`
mat-dialog-content {
  height: auto;
  overflow-y: hidden;
  form {
    height: 100%;
  }
}
.full-width {
  width: 100%;
  margin-bottom: 20px;
}

.tags-section {
  margin-top: 20px;
  
  h4 {
    margin-bottom: 10px;
    font-weight: 500;
  }
  
  mat-chip-list {
    margin-bottom: 15px;
    
    input {
      width: 150px;
    }
  }
  
  .available-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #666;
    
    button {
      min-width: auto;
      padding: 0 8px;
      line-height: 24px;
      font-size: 12px;
    }
  }
}

mat-dialog-actions {
  padding: 20px 24px;
  border-top: 1px solid #eee;
}
 .mat-mdc-form-field {
      width: 100%;
    }
 `]
})
export class CreateThreadComponent implements OnInit {
 threadForm: FormGroup;
  tags: string[] = [];
  availableTags = ['music', 'tour', 'lyrics', 'news', 'discussion', 'videos', 'concert', 'album'];
  
  // Autocomplete properties
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl();
  filteredTags: Observable<string[]>;

  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);
  user: UserInterface | null = null;
  subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private forumService: ForumService,
    private dialogRef: MatDialogRef<CreateThreadComponent>
  ) {
    this.threadForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.maxLength(5000)]]
    });

    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => 
        tag ? this._filter(tag) : this.availableTags.slice()));
  }

  ngOnInit(): void {
      this.subscriptions.push(
      this.userService.getCurrentUser$.subscribe({
        next: (user) => {
          this.user = user;
          //console.log('current user ',this.user)
        }
      })
    )
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    
    // Add our tag
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
    this.tagCtrl.setValue(null);
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.tags.includes(event.option.viewValue)) {
      this.tags.push(event.option.viewValue);
    }
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.availableTags.filter(tag => 
      tag.toLowerCase().includes(filterValue) && !this.tags.includes(tag));
  }

  onSubmit() {
    if (this.threadForm.invalid) return;
    if (!this.user || !this.user._id) {
      this.snackBar.open('You need to sign in to make forum post', 'Close', { duration: 3000 });
    } else {

      const threadData = {
        title: this.threadForm.value.title,
        content: this.threadForm.value.content,
        tags: this.tags,
        authorId: this.user._id as string,
      };
      
      this.forumService.createThread(threadData).subscribe( {
        next: (thread) => {
          this.snackBar.open('Thread created successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(thread);
        },
        error: (error) => {
          console.error('Error creating thread:', error);
          this.snackBar.open('Failed to create thread. Please try again.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

    ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  } 
}