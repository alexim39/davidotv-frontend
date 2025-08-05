import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
//import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../../common/pipes/truncate.pipe';
import { UploadService } from './upload.service';

import { ViewChild, ElementRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [MatIconModule, MatButtonModule, MatInputModule, TruncatePipe, MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressBarModule, CommonModule, ReactiveFormsModule, MatSnackBarModule ],
  providers: [UploadService],
  template: `

<div class="upload-container">
  <div class="upload-header">
    <h1>Upload Your Davido Content</h1>
    <p>Share your Davido remixes, covers, arts, and fan videos with the world</p>
  </div>

  <div class="upload-stepper">
    <div class="step active">
      <div class="step-number">1</div>
      <div class="step-label">Select Video</div>
    </div>
    <div class="step" [class.active]="selectedFile">
      <div class="step-number">2</div>
      <div class="step-label">Details</div>
    </div>
    <div class="step" [class.active]="uploadProgress > 0">
      <div class="step-number">3</div>
      <div class="step-label">Publish</div>
    </div>
  </div>

  <div class="upload-content" *ngIf="!selectedFile">
    <div class="upload-dropzone" 
         [class.dragging]="isDragging"
         (dragover)="onDragOver($event)"
         (dragleave)="onDragLeave($event)"
         (drop)="onDrop($event)">
      <div class="dropzone-content">
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <h3>Drag and drop your video file here</h3>
        <p>Or</p>
        <button mat-flat-button color="primary" (click)="fileInput.click()">
          Select File
        </button>
        <input #fileInput type="file" accept="video/*" hidden (change)="onFileSelected($event)">
        <p class="file-requirements">MP4, WebM or MOV. Max 500MB.</p>
      </div>
    </div>
  </div>

  <div class="upload-content" *ngIf="selectedFile && !isUploading">
    <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">
      <div class="video-preview-section">
        <div class="video-preview">
          <video *ngIf="videoPreview" [src]="videoPreview" controls></video>
        </div>
        <div class="video-details">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter your video title">
            <mat-hint>Make it catchy and descriptive</mat-hint>
            <mat-error *ngIf="uploadForm.get('title')?.hasError('required')">
              Title is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="4"
                     placeholder="Tell viewers about your video"></textarea>
            <mat-hint>Include hashtags like #Davido #Remix #FanVideo</mat-hint>
          </mat-form-field>

          <div class="thumbnail-upload">
            <h4>Thumbnail</h4>
            <div class="thumbnail-preview" *ngIf="thumbnailPreview">
              <img [src]="thumbnailPreview" alt="Video thumbnail">
              <button mat-stroked-button (click)="triggerThumbnailInput()">
                Change Thumbnail
              </button>
              <input #thumbnailInput type="file" accept="image/*" hidden (change)="onThumbnailSelected($event)">
            </div>
            <div class="thumbnail-placeholder" *ngIf="!thumbnailPreview">
              <p>No thumbnail selected</p>
              <button mat-stroked-button (click)="triggerThumbnailInput()">
                Select Thumbnail
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="additional-options">
        <h3>Additional Options</h3>
        <div class="options-grid">
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              <mat-option *ngFor="let category of categories" [value]="category">
                {{category}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Visibility</mat-label>
            <mat-select formControlName="visibility">
              <mat-option value="public">Public</mat-option>
              <mat-option value="unlisted">Unlisted</mat-option>
              <mat-option value="private">Private</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-checkbox formControlName="allowComments">Allow comments</mat-checkbox>
          <mat-checkbox formControlName="allowRemixes">Allow remixes</mat-checkbox>
        </div>
      </div>

      <div class="form-actions">
        <button mat-stroked-button type="button" (click)="selectedFile = null">
          Cancel
        </button>
        <button mat-flat-button color="primary" type="submit" [disabled]="uploadForm.invalid">
          Upload Video
        </button>
      </div>
    </form>
  </div>

  <div class="upload-progress" *ngIf="isUploading">
    <div class="progress-content">
      <mat-progress-bar mode="determinate" [value]="uploadProgress"></mat-progress-bar>
      <h3>Uploading your video... {{uploadProgress | number:'1.0-0'}}%</h3>
      <p>Your video is being processed. This may take a few minutes.</p>
      <div class="uploading-preview">
        <img *ngIf="thumbnailPreview" [src]="thumbnailPreview" alt="Uploading video thumbnail">
        <div class="video-info">
          <h4>{{uploadForm.get('title')?.value}}</h4>
          <p>{{uploadForm.get('description')?.value | truncate:100}}</p>
        </div>
      </div>
    </div>
  </div>
</div>


`,
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  @ViewChild('thumbnailInput') thumbnailInput!: ElementRef<HTMLInputElement>;
  uploadForm: FormGroup;
  isDragging = false;
  uploadProgress = 0;
  isUploading = false;
  thumbnailPreview: string | ArrayBuffer | null = null;
  videoPreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  categories = [
    'Music Remix',
    'Dance Cover',
    'Lyric Video',
    'Fan Tribute',
    'Live Performance',
    'Mashup',
    'Parody',
    'Reaction Video'
  ];

  constructor(
    private fb: FormBuilder,
    //private storage: AngularFireStorage,
    private uploadService: UploadService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(5000)]],
      category: ['', Validators.required],
      visibility: ['public', Validators.required],
      allowComments: [true],
      allowRemixes: [true]
    });
  }

  ngOnInit(): void {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFiles(input.files);
    }
  }

  private handleFiles(files: FileList): void {
    const file = files[0];
    if (!file) return;

    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      this.snackBar.open('Please upload a valid video file (MP4, WebM, QuickTime)', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      this.snackBar.open('Video file size should not exceed 500MB', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.selectedFile = file;
    this.previewVideo(file);

    // Auto-generate thumbnail from video (simplified - in real app you'd use a service)
    setTimeout(() => {
      this.generateThumbnail(file);
    }, 1000);
  }

  private previewVideo(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.videoPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  private generateThumbnail(file: File): void {
    // In a real app, you'd extract a frame from the video
    // For demo purposes, we'll just use a placeholder
    this.thumbnailPreview = 'assets/images/thumbnail-placeholder.jpg';
  }

  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.thumbnailPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerThumbnailInput(): void {
    this.thumbnailInput.nativeElement.click();
  }

onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
        this.snackBar.open('Please fill all required fields and select a video file', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
        });
        return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    const formData = this.uploadForm.value;

    // Simulate upload progress
    const progressInterval = setInterval(() => {
        if (this.uploadProgress < 100) {
        this.uploadProgress += 10;
        } else {
        clearInterval(progressInterval);

        // Simulate getting a video URL (in a real app, you'd upload to your backend and get a URL)
        const fakeVideoUrl = URL.createObjectURL(this.selectedFile!);

        const videoData = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            visibility: formData.visibility,
            allowComments: formData.allowComments,
            allowRemixes: formData.allowRemixes,
            videoUrl: fakeVideoUrl,
            thumbnailUrl: this.thumbnailPreview as string,
            uploadDate: new Date().toISOString(),
            views: 0,
            likes: 0,
            comments: []
        };

        try {
            this.uploadService.uploadVideo(videoData);
            this.snackBar.open('Video uploaded successfully!', 'Close', {
                duration: 5000,
                panelClass: ['success-snackbar']
            });
            this.router.navigate(['/']);
        } catch (error: any) {
            this.snackBar.open('Error uploading video: ' + error.message, 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
            });
            this.isUploading = false;
        }
        }
    }, 200); // Simulate upload progress every 200ms
    }
}