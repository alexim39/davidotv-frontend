import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
selector: 'async-music-merch',
imports: [CommonModule, MatToolbarModule, MatIconModule, MatCardModule, MatButtonModule, MatListModule, MatGridListModule, MatTabsModule, MatButtonModule],
template: `
    
    
<div class="container">
  <div class="music-section">
    <h1>Music & Lyrics</h1>
    <p class="support-text">Support Davido - Rock be Swag!</p>

    <mat-list role="list">
      <div *ngFor="let track of musicTracks; let last = last">
        <mat-list-item role="listitem" (click)="playSong(track)">
          {{ track.title }}
          <mat-icon matListItemIcon class="play-icon">play_arrow</mat-icon>
        </mat-list-item>
        <mat-divider *ngIf="!last"></mat-divider>
      </div>
    </mat-list>
  </div>

  <div class="merchandise-section">
    <img *ngFor="let img of merchandiseImages" [src]="img" alt="Merchandise Item" class="merch-image">
  </div>
</div>


`,
styles: [`
   
   

.container {
  display: flex; /* Use flexbox for side-by-side layout */
  justify-content: flex-start; /* Align content to the start */
  align-items: flex-start; /* Align content to the top */
  padding: 20px;
  max-width: 1200px; /* Limit width to resemble screenshot's spacing */
  margin: 0 auto; /* Center the container */
  gap: 40px; /* Space between the two sections */
}

.music-section {
  flex: 1; /* Allow music section to grow */
  min-width: 300px; /* Ensure it doesn't shrink too much */

  h1 {
    font-size: 2.5em; /* Large font size for heading */
    font-weight: bold; /* Bold as in screenshot */
    margin-bottom: 10px;
    color: black; /* Default black text */
  }

  .support-text {
    font-size: 1.1em;
    margin-bottom: 20px;
    color: #333; /* Slightly lighter than heading for contrast */
  }

  mat-list {
    .mat-mdc-list-item { /* Target the actual list item element */
      display: flex;
      justify-content: space-between; /* Space out title and icon */
      align-items: center;
      padding: 12px 0; /* Vertical padding for list items */
      font-size: 1.1em; /* Font size for song titles */
      color: #333; /* Darker text for titles */
      cursor: pointer; /* Indicate it's clickable */
      transition: background-color 0.2s ease-in-out; /* Smooth hover */

      &:hover {
        background-color: #f0f0f0; /* Light background on hover */
      }
    }

    .play-icon {
      font-size: 24px; /* Default size for play icon */
      color: #333; /* Icon color */
    }

    mat-divider {
      border-top-color: #eee; /* Light gray divider lines */
    }
  }
}

.merchandise-section {
  display: flex; /* Flexbox for horizontal images */
  gap: 15px; /* Space between images */
  flex-wrap: wrap; /* Allow images to wrap on smaller screens if needed */
  justify-content: flex-start; /* Align images to the start */
  flex-basis: auto; /* Allow section to size based on content */
  min-width: 400px; /* Minimum width to prevent images from stacking too early */

  .merch-image {
    width: 150px; /* Fixed width for each image, similar to screenshot */
    height: auto; /* Maintain aspect ratio */
    object-fit: contain; /* Ensure entire image is visible */
    border: 1px solid #ddd; /* Light border for definition */
    padding: 5px; /* Small padding inside border */
    background-color: white; /* White background for images */
  }
}

/* Basic responsiveness for smaller screens */
@media (max-width: 768px) {
  .container {
    flex-direction: column; /* Stack sections vertically on smaller screens */
    align-items: center; /* Center items when stacked */
    gap: 30px; /* Adjust gap for vertical stacking */
  }

  .music-section, .merchandise-section {
    width: 100%; /* Take full width */
    max-width: 500px; /* Limit max width for readability */
  }

  .merchandise-section {
    justify-content: center; /* Center images when stacked */
  }

  .merch-image {
    width: 120px; /* Slightly smaller images on small screens */
  }
}


`]
})
export class MusicMerchComponent {

  
  musicTracks = [
    { title: 'Stand Strong' },
    { title: 'FIA' },
    { title: 'Fall' },
  ];

  // Assuming you'd have actual image paths here
  merchandiseImages = [
    './img/cap.JPG', // Replace with your actual cap image
    './img/shirt.JPG', // Replace with your actual t-shirt image
    './img/hoodie.JPG' // Replace with your actual hoodie image
  ];

  constructor() { }

  ngOnInit(): void {
  }

  // A placeholder function if you want interactivity later,
  // but for replication, just showing the structure.
  playSong(track: any) {
    console.log(`Playing: ${track.title}`);
  }

}