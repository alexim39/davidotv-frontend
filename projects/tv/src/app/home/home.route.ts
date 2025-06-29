import { Routes } from "@angular/router";
import { HomeContainerComponent } from "./home-container.component";
import { HomeComponent } from "./home.component";
import { VideoPlayerComponent } from "../videos/video-player/video-player.component";


export const HomeRoutes: Routes = [
    {
        path: '',
        component: HomeContainerComponent,
        children: [
            {
                path: '',
                component: HomeComponent,
                title: "DavidoTV - Centralized Video Platform for Davido",
                //children: [
                   /*  {
                        path: '',
                        redirectTo: 'signin',
                        pathMatch: 'full'
                    }, */
                  /*  { path: 'watch/:id', 
                    component: VideoPlayerComponent, 
                    title: 'Watch Video'
                   }, */
                //]
            }, 
            { 
                path: 'watch/:id', 
                component: VideoPlayerComponent, 
                title: 'Watch Video - DavidoTV',
            },    
            {   path: 'videos', 
                loadChildren: () => import('../videos/videos.route').then(r => r.VideosRoutes) 
            },      
            {   path: 'official', 
                loadChildren: () => import('../official/official.route').then(r => r.OfficialRoutes) 
            },      
            {   path: 'events', 
                loadChildren: () => import('../event/event.route').then(r => r.EventRoutes) 
            },      
            {
                path: 'library',
                loadComponent: () => import('../library/library.component').then(m => m.LibraryComponent),
            },      
            {
                path: 'history',
                loadComponent: () => import('../history/history.component').then(m => m.HistoryComponent),
            },     
            {
                path: 'search',
                loadComponent: () => import('../home/search/search-results.component').then(m => m.SearchResultsComponent),
            },    
            {
                path: 'upload',
                loadComponent: () => import('../upload/upload.component').then(m => m.UploadComponent),
            },
            {   path: 'forum', 
                loadChildren: () => import('../forum/forum.routes').then(r => r.ForumRoutes) 
            },  
            { path: 'faq', loadComponent: () => import('../faq/faq.component').then(c => c.faqsComponent) },    
        ]
    }
];