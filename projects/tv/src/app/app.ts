import { ViewportScroller } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router'; // <-- import Router, NavigationEnd
import { filter } from 'rxjs/operators'; // <-- import filter

@Component({
selector: 'async-root',
imports: [RouterModule],
template: `
  <div class="container" id="containerX">
      <router-outlet />
  </div>
`,
styles: `
.container {
  animation: fadeInAnimation ease 3s;
}
@keyframes fadeInAnimation {
  0% {
      opacity: 0;
  }
  100% {
      opacity: 1;
  }
}
`
})
export class App {
   readonly viewportScroller = inject(ViewportScroller);
   private router = inject(Router);

   constructor() {
     // Listen for route changes and scroll to top
     this.router.events
       .pipe(filter(event => event instanceof NavigationEnd))
       .subscribe(() => this.scrollToTop());
   }

   private scrollToTop() {
    // Scroll to specific element with id 'container' after navigation is complete
    const element = document.getElementById('container');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback to scrolling to top if element not found
      this.viewportScroller.scrollToPosition([0, 0]);
    }
  }
}