import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // <-- import Router, NavigationEnd

@Component({
selector: 'async-root',
imports: [RouterModule],
template: `
  <div class="container">
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