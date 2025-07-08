import {Component} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { AboutStoryComponent } from './about.story.component';
import { AboutApproachComponent } from './about.approach.component';
import { AboutAsyncComponent } from './about.async.component';
import { AboutTrainingComponent } from './about.training.component';
import { MissionCorevaluesComponent } from './about.mission.component';

/** @title Simple form field */
@Component({
  selector: 'async-about',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule,MatIconModule, MatSelectModule, AboutTrainingComponent, AboutAsyncComponent, AboutStoryComponent, AboutApproachComponent, MissionCorevaluesComponent],
  template: `
    <div class="about-wrapper">
      <async-about-async/>
      <async-about-training/>
      <async-about-story/>
      <async-about-approach/>
      <async-mission-corevalues/>
    </div>
  `,
  styles: [`
    .about-wrapper {
      display: flex;
      flex-direction: column;
}

/* Extra small devices (phones, 750px and down) */
@media only screen and (max-width: 750px) {
  .about-wrapper {

  }
}
  `],
})
export class AboutComponent {}
