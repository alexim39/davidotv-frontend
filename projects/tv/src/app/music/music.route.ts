import { Routes } from "@angular/router";
import { MusicContainerComponent } from "./music.container.component";


export const MusicRoutes: Routes = [
  {
    path: '',
    redirectTo: 'player',
    pathMatch: 'full'
  },
  {
    path: 'player',
    component: MusicContainerComponent,
    title: "DavidoTV - Music video player"
  }
];