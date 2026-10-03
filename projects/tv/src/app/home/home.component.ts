
import { Component } from '@angular/core';
import { TrendingComponent } from './trending/trending.component';
import { ContinueWatchingComponent } from './continue-watching/continue-watching.component';
import { TalentSpotlightComponent } from './talent-spotlight/talent-spotlight.component';
import { CommunityComponent } from './community/community.component';
import { BannerComponent } from './banner.component';
import { NotificationBannerComponent } from './notification-banner.component';
import { MerchandiseComponent } from './merch/merchandise.component';

@Component({
  selector: 'async-home',
  imports: [
    TrendingComponent,
    ContinueWatchingComponent,
    TalentSpotlightComponent,
    MerchandiseComponent,
    CommunityComponent,
    BannerComponent,
    NotificationBannerComponent

  ],
  template: `
  <!-- top banner notification -->
  <async-notification-banner/>
  <async-banner/>
  <async-continue-watching/>
  <async-trending/>
  <async-talent-spotlight/>
  <async-merchandise/>
  <async-community/>
        
  `,
  styles: [``]
})
export class HomeComponent {}