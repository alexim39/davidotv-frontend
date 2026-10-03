import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router'; // <-- import Router, NavigationEnd
import { OfflineBannerComponent } from './shared/components/offline-banner/offline-banner.component';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav.component';
import { ThemeService } from './core/services/theme.service';

@Component({
selector: 'async-root',
imports: [RouterModule, OfflineBannerComponent, BottomNavComponent],
template: `
  <div class="container">
      <async-offline-banner />
      <router-outlet />
      <async-bottom-nav />
  </div>
`,
styles: `
.container {
  animation: fadeInAnimation ease 3s;
}
/* Bottom-nav clearance: 64px bar + notch safe-area, mobile only. */
@media (max-width: 767.98px) {
  .container {
    padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  }
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
  // Injecting ThemeService runs its effect: applies the persisted (default
  // dark) theme to <body> on boot. Without this, `dark-mode` is never set
  // and the light body fallback washes out all dark component text.
  private readonly theme = inject(ThemeService);
}