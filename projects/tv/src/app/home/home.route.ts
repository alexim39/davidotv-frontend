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
            { path: 'official', loadChildren: () => import('../videos/official/official.route').then(r => r.OfficialRoutes) },      
            { path: 'events', loadChildren: () => import('../event/event.route').then(r => r.EventRoutes) },      
            { path: 'library', loadChildren: () => import('../library/library.route').then(r => r.LibraryRoutes) },      
            { path: 'history', loadChildren: () => import('../history/history.route').then(r => r.HistoryRoutes) },     
            { path: 'search', loadChildren: () => import('../home/search/search.route').then(r => r.SearchRoutes) },    
            { path: 'upload', loadChildren: () => import('../fan-content/upload/upload.route').then(r => r.UploadRoutes) },
            { path: 'forum', loadChildren: () => import('../forum/forum.route').then(r => r.ForumRoutes) },  
            { path: 'feed', loadChildren: () => import('../feed/feed.route').then(r => r.FeedRoutes) },  
            { path: 'faq', loadChildren: () => import('../faq/faq.route').then(r => r.FaqRoutes) },    
            { path: 'about', loadChildren: () => import('../home/about/about.route').then(r => r.AboutRoutes) },    
            { path: 'contact', loadChildren: () => import('../home/contacts/contact.route').then(r => r.ContactRoutes) }, 
            { path: 'store', loadChildren: () => import('./../store/store.route').then(r => r.StoreRoutes) },   
            { path: 'auth', loadChildren: () => import('./../auth/auth.route').then(r => r.AuthRoutes) },   
            { path: 'settings', loadChildren: () => import('../settings/settings.route').then(r => r.SettingsRoutes) }, 
            { path: 'chat', loadChildren: () => import('../chatroom/chatroom.route').then(r => r.ChatroomRoutes) }, 
            { path: 'audio', loadChildren: () => import('../audio/audio.route').then(r => r.AudioRoutes) }, 
            { path: 'payment', loadChildren: () => import('../payments/payment-route').then(r => r.PaymentRoutes) },   
        ]
    }
];