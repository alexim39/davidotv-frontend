import { Routes } from "@angular/router";
import { HomeContainerComponent } from "./home-container.component";
import { HomeComponent } from "./home.component";
/* import { IndexComponent } from "./index.component";
import { IndexBodyComponent } from "./index-body.component";
import { SigninComponent } from "../auth/signin/signin.component"; */

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
                    /* {
                        path: 'signin',
                        component: SigninComponent,
                        title: "MarketSpase Platform Page - Auth verification",
                    } */
                //]
            },           
        ]
    }
];