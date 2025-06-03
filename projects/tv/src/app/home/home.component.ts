import { Component } from '@angular/core';
import { NavbarComponent } from './navbar.component';
import { FooterComponent } from './footer.component';
import { CommonModule } from '@angular/common';
import { BannerComponent } from './banner.component';
import { TrendingComponent } from './trending/trending.component';
import { FanzoneComponent } from './fanzone/fanzone.component';
import { MusicMerchComponent } from './music-merch/music-merch.component';

@Component({
selector: 'async-home',
imports: [CommonModule, NavbarComponent, BannerComponent, TrendingComponent, MusicMerchComponent, FanzoneComponent, FooterComponent],
template: `
    
<div class="home">
  <async-navbar/>
  <async-banner/>
  <async-trending/>
  <async-fanzone/>
  <async-music-merch/>
  <async-footer/>
</div>

`,
styles: [``]
})
export class HomeComponent {
}