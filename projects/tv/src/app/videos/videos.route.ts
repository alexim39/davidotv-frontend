import { Routes } from "@angular/router";
import { TrendingAllContainerComponent } from "./trending/trending-all-container.component";
import { VideosContainerComponent } from "./videos-container.component";


export const VideosRoutes: Routes = [
  {
    path: '',
    component: VideosContainerComponent,
    title: "DavidoTV - All Music Videos and Clips",
  },
  {
    path: 'trending',
    component: TrendingAllContainerComponent,
    title: "DavidoTV - All Trending Videos"
  }
];