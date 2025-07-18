
import { Component } from '@angular/core';
import { TrendingComponent } from './trending/trending.component';
import { CommunityComponent } from './community/community.component';
import { BannerComponent } from './banner.component';
import { NotificationBannerComponent } from './notification-banner.component';
import { MerchandiseComponent } from './merch/merchandise.component';

@Component({
  selector: 'async-home',
  imports: [
   TrendingComponent,
    MerchandiseComponent,
    CommunityComponent,
    BannerComponent,
    NotificationBannerComponent

  ],
  template: `
  <!-- top banner notification -->
  <async-notification-banner/>
  <async-banner/>
  <async-trending/>
  <async-merchandise/>
  <async-community/>
        
  `,
  styles: [``]
})
export class HomeComponent {}