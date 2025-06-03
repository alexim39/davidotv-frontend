import { Component } from '@angular/core';
import { NavbarComponent } from './navbar.component';
import { MerchCardComponent } from './music-merch/merch-card.component';
import { FooterComponent } from './footer.component';
import { CommonModule } from '@angular/common';
import { BannerComponent } from './banner.component';
import { TrendingComponent } from './trending/trending.component';
import { FanzoneComponent } from './fanzone/fanzone.component';
import { MusicMerchComponent } from './music-merch/music-merch.component';

@Component({
selector: 'async-home',
imports: [CommonModule, NavbarComponent, MerchCardComponent, BannerComponent, TrendingComponent, MusicMerchComponent, FanzoneComponent, FooterComponent],
template: `
    
<div class="home">
  <async-navbar/>
  <async-banner/>

  <async-trending-container/>
  <async-fanzone/>
  <async-music-merch/>


  <async-footer/>
</div>

`,
styles: [`

.home {
  .hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    background: #000;
    color: #fff;

    img {
      max-width: 400px;
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1.5rem 0;
  }

  .video-grid, .fan-grid, .merch-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .music-lyrics ul {
    list-style: none;
    padding: 0;
    li {
      margin: 0.5rem 0;
    }
  }
}

`]
})
export class HomeComponent {
  videos = [
    { title: 'Dance Cover', author: 'Henry12', views: '31K', likes: '12K', thumbnail: 'assets/videos/dance.jpg' },
    { title: 'Vocal Cover', author: 'Ainnaodi', views: '2.5K', likes: '43K', thumbnail: 'assets/videos/vocal.jpg' },
    { title: 'Freestyle', author: 'Ado2', views: '4.8K', likes: '47K', thumbnail: 'assets/videos/freestyle.jpg' },
    { title: 'Somebody Baby Remix', author: 'StarboyL', views: '6K', likes: '19K', thumbnail: 'assets/videos/somebody.jpg' },
  ];

  arts = [
    { title: 'Art profile', image: 'assets/fanzone/art.jpg' },
    { title: "Skit's Comedy", image: 'assets/fanzone/skit.jpg' },
    { title: 'Acoustic Cover', image: 'assets/fanzone/acoustic.jpg' }
  ];

  songs = [
    { title: 'Stand Strong' },
    { title: 'FIA' },
    { title: 'Fall' },
  ];

  merch = [
    { name: 'OBO Cap', image: 'assets/merch/obo-cap.png' },
    { name: 'Davido Tee', image: 'assets/merch/davido-shirt.png' },
    { name: '30BG Hoodie', image: 'assets/merch/30bg-hoodie.png' }
  ];
}