import { Routes } from "@angular/router";
import { OfficialContainerComponent } from "./official.container.component";


export const OfficialRoutes: Routes = [
  {
    path: '',
    redirectTo: 'videos',
    pathMatch: 'full'
  },
  {
    path: 'videos',
    component: OfficialContainerComponent,
    title: "DavidoTV - Official videos from Davido"
  }
];