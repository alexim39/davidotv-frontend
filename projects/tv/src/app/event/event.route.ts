import { Routes } from "@angular/router";
import { EventsMapComponent } from "./events-map.component";
import { EventsListComponent } from "./events-list.component";
import { EventComponent } from "./event.component";


export const EventRoutes: Routes = [
  {
    path: '',
    component: EventComponent,
    title: "DavidoTV - Events management system",
     children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: EventsListComponent },
      { path: 'map', component: EventsMapComponent },
      //{ path: 'create', component: EventCreateComponent },
      //{ path: ':id', component: EventDetailComponent }
    ]
  }
];