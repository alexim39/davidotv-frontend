import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';

/**
 * Lightweight infinite-scroll trigger via IntersectionObserver.
 * Zoneless-friendly: no scroll listeners.
 * Usage: <div asyncIntersection (intersecting)="loadMore()">
 */
@Directive({ selector: '[asyncIntersection]', standalone: true })
export class IntersectionDirective implements OnInit, OnDestroy {
  @Input() intersectionRootMargin = '200px';
  @Input() intersectionThreshold = 0.01;
  @Output() intersecting = new EventEmitter<void>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    this.observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) this.intersecting.emit();
      },
      { rootMargin: this.intersectionRootMargin, threshold: this.intersectionThreshold }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
