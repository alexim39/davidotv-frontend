import { Component } from '@angular/core';
import { MusicComponent } from './music.component';

@Component({
selector: 'async-music-container',
imports: [MusicComponent],
template: `
    <async-music/>
`,
styles: [`
`]
})
export class MusicContainerComponent {}