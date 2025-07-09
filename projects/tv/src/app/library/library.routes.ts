import { Routes } from "@angular/router";
import { LibraryComponent } from "./library.component";
import { PlaylistDetailComponent } from "./playlist/details/playlist-detail.component";


export const LibraryRoutes: Routes = [
  // other routes
  //{ path: 'forum', loadChildren: () => import('./forum/forum.module').then(m => m.ForumModule) },
  //{ path: 'forum/:threadId', loadChildren: () => import('./forum/forum.module').then(m => m.ForumModule) }
  //  {
  //       path: '',
  //       redirectTo: 'videos',
  //       pathMatch: 'full'
  //   },
    {
        path: '',
        component: LibraryComponent,
        title: "Library - Fans music library - Save and Share",
    },
    {
      path: 'playlist/:playlistId',
      component: PlaylistDetailComponent,
      title: "Playlist - Fans music library - Save and Share",
    },

 
];


