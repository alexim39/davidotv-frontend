import { Component } from '@angular/core';
import { VideosComponent } from './videos.component';

@Component({
selector: 'async-videos-container',
imports: [VideosComponent],
template: `
<async-videos/>
`,
styles: [`
`]
})
export class VideosContainerComponent {}