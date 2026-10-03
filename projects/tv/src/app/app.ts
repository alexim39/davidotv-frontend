import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router'; // <-- import Router, NavigationEnd
import { OfflineBannerComponent } from './shared/components/offline-banner/offline-banner.component';
import { ThemeService } from './core/services/theme.service';

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
export class App {
  // Injecting ThemeService runs its effect: applies the persisted (default
  // dark) theme to <body> on boot. Without this, `dark-mode` is never set
  // and the light body fallback washes out all dark component text.
  private readonly theme = inject(ThemeService);
}