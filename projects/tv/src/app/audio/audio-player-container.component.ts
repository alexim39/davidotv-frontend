import { Component } from '@angular/core';
import { AudioPlayerComponent } from './audio-player.component';

@Component({
selector: 'async-audio-player-container',
imports: [AudioPlayerComponent],
template: `
    <async-audio-player/>
`,
styles: [`
`]
})
export class AudioPlayerContainerComponent {}