import { Component } from '@angular/core';
import { MusicPlayerComponent } from './audio-player.component';

@Component({
selector: 'async-audio-player-container',
imports: [MusicPlayerComponent],
template: `
    <async-music-player/>
`,
styles: [`
`]
})
export class AudioPlayerContainerComponent {}