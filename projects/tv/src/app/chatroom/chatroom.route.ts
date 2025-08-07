import { Routes } from "@angular/router";
import { ChatRoomComponent } from "./chatroom.component";

export const ChatroomRoutes: Routes = [
  {
    path: '',
    redirectTo: 'rooms',
    pathMatch: 'full'
  },
  {
    path: 'rooms',
    component: ChatRoomComponent,
    title: "DavidoTV - Fans chatroom"
  }
];