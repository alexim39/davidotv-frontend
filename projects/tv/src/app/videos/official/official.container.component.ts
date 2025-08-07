import { Component } from '@angular/core';
import { OfficialComponent } from './official.component';

@Component({
selector: 'async-official-container',
imports: [OfficialComponent],
template: `
    <async-official/>
`,
styles: [`
`]
})
export class OfficialContainerComponent {}