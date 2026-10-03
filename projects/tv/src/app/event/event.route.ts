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
    ]
  },
  // Deep-linkable detail (EventComponent has no outlet, so this is a sibling).
  {
    path: ':id',
    loadComponent: () => import('./event-detail-page.component').then(m => m.EventDetailPageComponent),
    title: 'Event — DavidoTV'
  }
];