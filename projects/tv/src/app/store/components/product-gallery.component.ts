import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
selector: 'app-product-gallery',
standalone: true,
imports: [CommonModule],
template: `
<div class="product-gallery">
  <div class="main-image">
    <img [src]="images[selectedImageIndex]" [alt]="'Product image ' + (selectedImageIndex + 1)">
    
    <button class="nav-button prev" (click)="prevImage()">
      <i class="icon-chevron-left"></i>
    </button>
    
    <button class="nav-button next" (click)="nextImage()">
      <i class="icon-chevron-right"></i>
    </button>
    
    <div *ngIf="videoUrl" class="video-badge">
      <i class="icon-play"></i> Video Available
    </div>
  </div>
  
  <div class="thumbnail-container">
    <div *ngFor="let image of images; let i = index" 
         class="thumbnail" 
         [class.active]="i === selectedImageIndex"
         (click)="selectImage(i)">
      <img [src]="image" [alt]="'Thumbnail ' + (i + 1)">
    </div>
    
    <div *ngIf="videoUrl" class="thumbnail video-thumbnail">
      <i class="icon-play"></i>
    </div>
  </div>
</div>
`,
styles: [`
.product-gallery {
  .main-image {
    position: relative;
    aspect-ratio: 1/1;
    margin-bottom: 10px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #f9f9f9;
      border-radius: 8px;
    }
    
    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.8);
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s ease;
      
      i {
        font-size: 20px;
        color: #333;
      }
      
      &.prev {
        left: 15px;
      }
      
      &.next {
        right: 15px;
      }
    }
    
    &:hover .nav-button {
      opacity: 1;
    }
    
    .video-badge {
      position: absolute;
      bottom: 15px;
      right: 15px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 5px;
      
      i {
        font-size: 16px;
      }
    }
  }
  
  .thumbnail-container {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 5px;
    scrollbar-width: thin;
    
    .thumbnail {
      width: 70px;
      height: 70px;
      flex-shrink: 0;
      border: 2px solid transparent;
      border-radius: 4px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.2s ease;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      &.active {
        border-color: #2196F3;
      }
      
      &:hover:not(.active) {
        border-color: #ddd;
      }
      
      &.video-thumbnail {
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        
        i {
          font-size: 24px;
          color: #666;
        }
      }
    }
  }
}
    `]
})
export class ProductGalleryComponent {
  @Input() images: string[] = [];
  @Input() videoUrl?: string;
  
  selectedImageIndex = 0;
  
  selectImage(index: number) {
    this.selectedImageIndex = index;
  }
  
  nextImage() {
    this.selectedImageIndex = (this.selectedImageIndex + 1) % this.images.length;
  }
  
  prevImage() {
    this.selectedImageIndex = (this.selectedImageIndex - 1 + this.images.length) % this.images.length;
  }
}