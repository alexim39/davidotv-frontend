import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
selector: 'app-review-stars',
standalone: true,
imports: [CommonModule],
template: `
<div class="star-rating">
  <span *ngFor="let star of stars" class="star" [class.filled]="star <= rating">★</span>
</div>
`,
styles: [`
.star-rating {
  display: inline-flex;
  
  .star {
    color: #ddd;
    font-size: 16px;
    
    &.filled {
      color: #FFC107;
    }
  }
}
`]
})
export class ReviewStarsComponent {
  @Input() rating = 0;
  @Input() maxStars = 5;
  
  get stars() {
    return Array(this.maxStars).fill(0).map((_, i) => i + 1);
  }
}