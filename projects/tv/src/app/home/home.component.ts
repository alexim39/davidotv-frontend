
import { Component } from '@angular/core';
import { TrendingComponent } from './trending.component';
import { MerchandiseComponent } from './merchandise.component';
import { CommunityComponent } from './community.component';
import { VideoItem } from '../videos/videos.service';
import { BannerComponent } from './banner.component';
import { NotificationBannerComponent } from './notification-banner.component';

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
  <async-trending [videos]="trendingVideos"/>
  <async-merchandise [featuredMerch]="featuredMerch"/>
  <async-community [fanPosts]="fanPosts"/>
        
  `,
  styles: [``]
})
export class HomeComponent {

    trendingVideos: VideoItem[] = [
    {
      id: 'NnWe5Lhi0G8',
      title: 'Davido - Feel',
      thumbnail: 'https://img.youtube.com/vi/NnWe5Lhi0G8/hqdefault.jpg',
      channel: 'Davido Official',
      channelIcon: 'https://example.com/channel-icon.jpg',
      views: '1.2M views',
      date: '2 days ago'
    },

    {
      thumbnail: 'https://img.youtube.com/vi/anPYTDj0Lrc/hqdefault.jpg',
      title: 'Davido - Jowo (Official Video)',
      channel: 'Davido Official',
      channelIcon: './img/davido-banner.png',
      views: '5.2M views',
      date: '2 weeks ago',
      id: 'anPYTDj0Lrc'
    },
    {
      thumbnail: 'https://img.youtube.com/vi/l6QMJniQWxQ/hqdefault.jpg',
      title: 'Davido Performs Live at Wireless Festival',
      channel: 'Festival Highlights',
      channelIcon: './img/davido-banner.png',
      views: '1.8M views',
      date: '3 weeks ago',
      id: 'l6QMJniQWxQ'
    },
    {
      thumbnail: 'https://img.youtube.com/vi/7adDm9YACpE/hqdefault.jpg',
      title: 'Davido Performs Live at Wireless Festival',
      channel: 'Festival Highlights',
      channelIcon: './img/davido-banner.png',
      views: '1.8M views',
      date: '3 weeks ago',
      id: '7adDm9YACpE'
    },
    {
      thumbnail: 'https://img.youtube.com/vi/helEv0kGHd4/hqdefault.jpg',
      title: 'Davido Performs Live at Wireless Festival',
      channel: 'Festival Highlights',
      channelIcon: './img/davido-banner.png',
      views: '1.8M views',
      date: '3 weeks ago',
      id: 'helEv0kGHd4'
    },
    {
      thumbnail: 'https://img.youtube.com/vi/3Iyuym-Gci0/hqdefault.jpg',
      title: 'Davido Performs Live at Wireless Festival',
      channel: 'Festival Highlights',
      channelIcon: './img/davido-banner.png',
      views: '1.8M views',
      date: '3 weeks ago',
      id: '3Iyuym-Gci0'
    },
    {
      thumbnail: 'https://img.youtube.com/vi/1x5tIv6GC1o/hqdefault.jpg',
      title: 'Davido Performs Live at Wireless Festival',
      channel: 'Festival Highlights',
      channelIcon: './img/davido-banner.png',
      views: '1.8M views',
      date: '3 weeks ago',
      id: '1x5tIv6GC1o'
    },
    {
      thumbnail: 'https://img.youtube.com/vi/fpAopipfdAs/hqdefault.jpg',
      title: 'Davido Performs Live at Wireless Festival',
      channel: 'Festival Highlights',
      channelIcon: './img/davido-banner.png',
      views: '1.8M views',
      date: '3 weeks ago',
      id: 'fpAopipfdAs'
    },
    {
      thumbnail: 'https://img.youtube.com/vi/SbgKpHi-Cao/hqdefault.jpg',
      title: 'Davido Performs Live at Wireless Festival',
      channel: 'Festival Highlights',
      channelIcon: './img/davido-banner.png',
      views: '1.8M views',
      date: '3 weeks ago',
      id: 'SbgKpHi-Cao'
    },
    {
      thumbnail: 'https://img.youtube.com/vi/8ORvJcpe2Oc/hqdefault.jpg',
      title: 'Davido Performs Live at Wireless Festival',
      channel: 'Festival Highlights',
      channelIcon: './img/davido-banner.png',
      views: '1.8M views',
      date: '3 weeks ago',
      id: '8ORvJcpe2Oc'
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