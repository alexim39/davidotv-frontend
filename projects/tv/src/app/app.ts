import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './home/home.component';

@Component({
selector: 'async-root',
imports: [RouterOutlet, HomeComponent],
template: `
<async-home/>
<router-outlet />
`,
styles: `
`
})
export class App {
  protected title = 'tv';
}
