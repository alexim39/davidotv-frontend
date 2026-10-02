import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // <-- import Router, NavigationEnd
import { OfflineBannerComponent } from './shared/components/offline-banner/offline-banner.component';

@Component({
selector: 'async-root',
imports: [RouterModule, OfflineBannerComponent],
template: `
  <div class="container">
      <async-offline-banner />
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
export class App {}