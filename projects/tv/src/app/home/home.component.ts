
import { Component } from '@angular/core';
import { TrendingComponent } from './trending.component';
import { MerchandiseComponent } from './merchandise.component';
import { CommunityComponent } from './community.component';

@Component({
  selector: 'async-home',
  imports: [
   TrendingComponent,
    MerchandiseComponent,
    CommunityComponent
  ],
  template: `


<async-trending [videos]="trendingVideos"/>
          
<async-merchandise [featuredMerch]="featuredMerch"/>
          
<async-community [fanPosts]="fanPosts"/>
          
          
  `,
  styles: [`

  `]
})
export class HomeComponent {

    trendingVideos = [
    {
      thumbnail: './img/davido-banner.png',
      title: 'Davido - Jowo (Official Video)',
      channel: 'Davido Official',
      channelIcon: './img/davido-banner.png',
      views: '5.2M views',
      date: '2 weeks ago'
    },
    {
      thumbnail: './img/davido-banner.png',
      title: 'Davido Performs Live at Wireless Festival',
      channel: 'Festival Highlights',
      channelIcon: './img/davido-banner.png',
      views: '1.8M views',
      date: '3 weeks ago'
    },
  ];

  featuredMerch = [
    {
      id: 1,
      image: './img/cap.JPG',
      name: 'Official Davido Cap',
      price: 29.99
    },
    {
      id: 2,
      image: './img/shirt.JPG',
      name: '30BG Logo T-Shirt',
      price: 24.99
    },
    {
      id: 3,
      image: './img/hoodie.JPG',
      name: 'Davido Tour Hoodie',
      price: 49.99
    },
  ];

  fanPosts = [
    {
      user: {
        name: 'SuperFan Ade',
        avatar: 'https://via.placeholder.com/40x40'
      },
      date: new Date(),
      content: 'Just met Davido backstage at the concert! He was so humble and took pictures with everyone #30BG',
      image: 'https://via.placeholder.com/600x300',
      likes: 245,
      comments: 32
    },
    {
      user: {
        name: 'Chioma Lover',
        avatar: 'https://via.placeholder.com/40x40'
      },
      date: new Date(Date.now() - 86400000),
      content: 'Who else is excited for the new album dropping next week? I already pre-ordered!',
      likes: 189,
      comments: 45
    }
  ];
  
}