import { Routes } from "@angular/router";
import { ThreadListComponent } from "./thread-list.component";
import { ForumPageComponent } from "./forum-page.component";
import { ThreadDetailComponent } from "./thread-detail.component";


export const ForumRoutes: Routes = [
  // other routes
  //{ path: 'forum', loadChildren: () => import('./forum/forum.module').then(m => m.ForumModule) },
  //{ path: 'forum/:threadId', loadChildren: () => import('./forum/forum.module').then(m => m.ForumModule) }
  /*  {
        path: '',
        redirectTo: 'videos',
        pathMatch: 'full'
    }, */
    /* {
        path: '',
        component: ThreadListComponent,
        title: "DavidoTV - Fans Forum - Discuss and Share",
    } */

  {
    path: '',
    component: ForumPageComponent,
    children: [
      {
        path: 'create',
        outlet: 'modal',
        loadComponent: () => import('./create-thread.component').then(c => c.CreateThreadComponent)
      }
    ]
  },
  {
    path: 'thread/:threadId',
    component: ThreadDetailComponent,
    data: { 
      breadcrumb: 'Thread Details',
      animation: 'thread-detail' 
    }
  },
  {
    path: 'categories/:category',
    component: ForumPageComponent,
    data: { 
      filterByCategory: true,
      breadcrumb: 'Category'
    }
  },
  {
    path: 'tags/:tag',
    component: ForumPageComponent,
    data: { 
      filterByTag: true,
      breadcrumb: 'Tag'
    }
  },
  {
    path: 'search',
    component: ForumPageComponent,
    data: { 
      searchMode: true,
      breadcrumb: 'Search Results'
    }
  },
  {
    path: 'my-threads',
    component: ForumPageComponent,
    data: { 
      filterByUser: true,
      breadcrumb: 'My Threads'
    }
  }
];


/* 
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
]; */