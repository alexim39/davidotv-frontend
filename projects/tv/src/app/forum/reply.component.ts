// reply.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { timeAgo as timeAgoUtil, } from '../common/utils/time.util';

@Component({
  selector: 'app-reply',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="reply">
      <div class="reply-main">
        <img class="reply-avatar" [src]="reply.author.avatar" [alt]="reply.author.name">
        
        <div class="reply-content">
          <div class="reply-header">
            <span class="reply-author">{{reply.author.name | titlecase}}</span>
            <span *ngIf="reply.author.isVerified" class="verified-badge">
              <mat-icon>verified</mat-icon>
            </span>
            <span class="reply-time">{{timeAgo(reply.createdAt)}}</span>
          </div>
          
          <div class="reply-text">{{reply.content}}</div>
          
          <div class="reply-actions">
            <button mat-button (click)="toggleLike()">
              <mat-icon [class.accent]="reply.isLiked">thumb_up</mat-icon>
              {{reply.likeCount}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reply {
      margin: 12px 0;
      padding: 12px;
      //background: rgba(0,0,0,0.02);
      border-radius: 8px;
      border-left: 3px solid #ddd;
      
      .reply-main {
        display: flex;
        gap: 12px;
      }
      
      .reply-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .reply-content {
        flex: 1;
        
        .reply-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          font-size: 13px;
          
          .reply-author {
            font-weight: 500;
          }
          
          .verified-badge {
            color: #1DA1F2;
            display: flex;
            align-items: center;
            
            mat-icon {
              font-size: 14px;
              width: 14px;
              height: 14px;
            }
          }
          
          .reply-time {
            color: #666;
            font-size: 11px;
          }
        }
        
        .reply-text {
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 6px;
        }
        
        .reply-actions {
          button {
            min-width: auto;
            padding: 0 6px;
            line-height: 20px;
            
            mat-icon {
              font-size: 14px;
              width: 14px;
              height: 14px;
              margin-right: 2px;
              
              &.accent {
                color: #3f51b5;
              }
            }
          }
        }
      }
    }
  `]
})
export class ReplyComponent {
  @Input() reply: any;
  
  toggleLike() {
    // Implement like functionality
  }
  
  timeAgo(date: string | Date): string {
    return timeAgoUtil(date);
  }
}