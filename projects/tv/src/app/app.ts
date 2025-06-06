import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
selector: 'async-root',
imports: [RouterOutlet],
template: `<router-outlet />`
})
export class App {}
