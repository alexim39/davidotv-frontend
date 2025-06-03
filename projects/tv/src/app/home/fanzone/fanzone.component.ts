import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'async-fanzone',
  imports: [CommonModule, MatIconModule, MatCardModule, MatListModule, MatButtonModule, MatDividerModule],
  template: `
    <div class="fan-zone-container">
      <div class="header">
        <h1>🎉 Fan Zone</h1>
        <button mat-flat-button color="primary" class="upload-btn">
          <mat-icon>cloud_upload</mat-icon>
          Upload Yours
        </button>
      </div>

      <div class="body">
        <div class="media-gallery">
          <mat-card class="media-item" *ngFor="let item of media">
            <img mat-card-image [src]="item.image" [alt]="item.title" />
            <mat-card-content>
              <p>{{ item.title }}</p>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-list class="audio-section">
          <mat-list-item *ngFor="let track of audioTracks" class="audio-track">
            <div class="track-content">
              <span>{{ track }}</span>
              <button mat-icon-button>
                <mat-icon>play_arrow</mat-icon>
              </button>
            </div>
          </mat-list-item>
          <!-- <mat-divider *ngIf="!last" /> -->
        </mat-list>
      </div>
    </div>
  `,
  styles: [`
    .fan-zone-container {
      padding: 32px;
      max-width: 1200px;
      margin: auto;
      font-family: 'Roboto', sans-serif;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }

    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
    }

    .upload-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 48px;
    }

    .body {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
    }

    .media-gallery {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      flex: 2;
      min-width: 280px;
    }

    .media-item {
      max-width: 280px;
      width: 100%;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      transition: transform 0.2s ease;
      border-radius: 12px;
    }

    .media-item:hover {
      transform: translateY(-4px);
    }

    .media-item img {
      height: 200px;
      object-fit: cover;
    }

    mat-card-content {
      text-align: center;
      padding: 12px;
    }

    mat-card-content p {
      font-size: 1.1rem;
      margin: 0;
      color: #555;
    }

    .audio-section {
      flex: 1;
      min-width: 280px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      overflow: hidden;
    }

    .audio-track {
      padding: 16px;
      transition: background-color 0.2s;
      cursor: pointer;
    }

    .audio-track:hover {
      background-color: #f9f9f9;
    }

    .track-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .track-content span {
      font-size: 1rem;
      color: #333;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .body {
        flex-direction: column;
      }

      .media-gallery {
        justify-content: center;
      }

      .audio-section {
        width: 100%;
      }
    }
  `]
})
export class FanzoneComponent {
  media = [
    {
      image: './img/davido-banner.png',
      title: 'Art Prof'
    },
    {
      image: './img/davido-banner.png',
      title: 'Skit\'s Comedy'
    },
    {
      image: './img/davido-banner.png',
      title: 'Acoustt Cover'
    }
  ];

  audioTracks = ['Stand Strong', 'FIA', 'Fall'];
}
