import { Routes } from "@angular/router";
import { AudioPlayerContainerComponent } from "./audio-player-container.component";


export const AudioRoutes: Routes = [
  {
    path: '',
    redirectTo: 'player',
    pathMatch: 'full'
  },
  {
    path: 'player',
    component: AudioPlayerContainerComponent,
    title: "DavidoTV - Audio music player"
  }
];