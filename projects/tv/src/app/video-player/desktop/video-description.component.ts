import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
@Component({
selector: 'app-video-discription',
imports: [RouterModule, MatButtonModule],
template: `

<div class="video-description">
    <h2>Davido - New Hit Single (Official Video)</h2>
    <div class="creator-info">
    <img [src]="'https://randomuser.me/api/portraits/men/0.jpg'" alt="Davido" class="creator-avatar">
    <div class="creator-details">
        <h3>Davido</h3>
        <p>12.5M subscribers</p>
    </div>
    <button mat-raised-button color="warn" class="subscribe-btn">
        SUBSCRIBE
    </button>
    </div>
    <div class="description-text" [class.expanded]="descriptionExpanded">
    <p>
        Official music video for Davido's latest hit single. 

        Directed by Director X
        Produced by Speroach Beatz
        Lyrics by Davido
        
        Follow Davido:
        Facebook: /davidoofficial
        
        #Davido #NewSingle #Afrobeats
    </p>
    <button mat-button (click)="descriptionExpanded = !descriptionExpanded" class="show-more-btn">
        Show {{ descriptionExpanded ? 'less' : 'more' }}
    </button>
    </div>
</div>

   
`,
styles: `

/* Video Description */
.video-description {
  padding: 16px 0;
  border-bottom: 1px solid #3f3f3f;
}

.video-description h2 {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0 0 16px 0;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.creator-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.creator-details {
  flex: 1;
}

.creator-details h3 {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.creator-details p {
  font-size: 0.8rem;
  margin: 0;
}

.description-text {
  margin-left: 64px;
  position: relative;
}

.description-text p {
  margin: 0 0 8px 0;
  line-height: 1.5;
  white-space: pre-line;
}

.show-more-btn {
  font-weight: 500;
  padding: 0;
  min-width: auto;
}

`
})
export class VideoDiscriptionComponent {
      descriptionExpanded = false;

}