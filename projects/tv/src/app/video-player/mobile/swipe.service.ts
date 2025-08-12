import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

@Injectable({
  providedIn: 'root'
})
export class SwipeService {
  private swipeThreshold = 50; // Minimum distance to consider it a swipe
  private touchStartX = 0;
  private touchStartY = 0;
  private touchEndX = 0;
  private touchEndY = 0;
  private isSwiping = false;

  private swipeSubject = new Subject<SwipeDirection>();
  swipe$ = this.swipeSubject.asObservable();

  constructor(private ngZone: NgZone) {}

  setup(element: HTMLElement) {
    this.ngZone.runOutsideAngular(() => {
      element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
      element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
      element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    });
  }

  private handleTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.isSwiping = false;
  }

  private handleTouchMove(event: TouchEvent) {
    if (!this.isSwiping) {
      const xDiff = Math.abs(event.touches[0].clientX - this.touchStartX);
      const yDiff = Math.abs(event.touches[0].clientY - this.touchStartY);
      
      // Only consider it a swipe if movement is dominant in one direction
      if (xDiff > yDiff && xDiff > 10) {
        this.isSwiping = true;
      } else if (yDiff > xDiff && yDiff > 10) {
        this.isSwiping = true;
      }
    }
  }

  private handleTouchEnd(event: TouchEvent) {
    if (!this.isSwiping) return;

    this.touchEndX = event.changedTouches[0].clientX;
    this.touchEndY = event.changedTouches[0].clientY;
    
    const xDiff = this.touchStartX - this.touchEndX;
    const yDiff = this.touchStartY - this.touchEndY;

    // Horizontal swipe takes precedence
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (Math.abs(xDiff) > this.swipeThreshold) {
        this.ngZone.run(() => {
          this.swipeSubject.next(xDiff > 0 ? 'left' : 'right');
        });
      }
    } else {
      if (Math.abs(yDiff) > this.swipeThreshold) {
        this.ngZone.run(() => {
          this.swipeSubject.next(yDiff > 0 ? 'up' : 'down');
        });
      }
    }
  }

  cleanup(element: HTMLElement) {
    element.removeEventListener('touchstart', this.handleTouchStart);
    element.removeEventListener('touchmove', this.handleTouchMove);
    element.removeEventListener('touchend', this.handleTouchEnd);
  }
}