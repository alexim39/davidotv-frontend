import { Routes } from "@angular/router";
import { HomeContainerComponent } from "./home-container.component";
import { HomeComponent } from "./home.component";
import { VideoPlayerComponent } from "../video-player/video-player.component";


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
            { path: 'videos', loadChildren: () => import('../videos/videos.route').then(r => r.VideosRoutes) },      
            { path: 'official', loadChildren: () => import('../official/official.route').then(r => r.OfficialRoutes) },      
            { path: 'events', loadChildren: () => import('../event/event.route').then(r => r.EventRoutes) },      
            { path: 'library', loadChildren: () => import('../library/library.routes').then(r => r.LibraryRoutes) },      
            { path: 'history', loadChildren: () => import('../history/history.route').then(r => r.HistoryRoutes) },     
            { path: 'search', loadChildren: () => import('../home/search/search.route').then(r => r.SearchRoutes) },    
            { path: 'upload', loadChildren: () => import('../upload/upload.route').then(r => r.UploadRoutes) },
            { path: 'forum', loadChildren: () => import('../forum/forum.routes').then(r => r.ForumRoutes) },  
            { path: 'faq', loadChildren: () => import('../faq/faq.route').then(r => r.FaqRoutes) },    
            { path: 'about', loadChildren: () => import('../home/about/about.route').then(r => r.AboutRoutes) },    
            { path: 'contact', loadChildren: () => import('../home/contacts/contact.route').then(r => r.ContactRoutes) }, 
            { path: 'store', loadChildren: () => import('./../store/store.route').then(r => r.StoreRoutes) },   
            { path: 'auth', loadChildren: () => import('./../auth/auth.route').then(r => r.AuthRoutes) },   
            { path: 'settings', loadChildren: () => import('./../settings/settings-routes').then(r => r.SettingsRoutes) }, 
        ]
    }
];