import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeviceService } from '../common/services/device.service';
import { VideoPlayerComponent } from './desktop/video-player.component';
import { MobileVideoPlayerComponent } from './mobile/mobile-video-player.component';

@Component({
  selector: 'video-player-index',
  imports: [RouterModule, VideoPlayerComponent, MobileVideoPlayerComponent],
  template: `
    @switch (deviceService.type()) {
        @case ('mobile') {
            <!-- <mobile-notice /> -->
             <async-mobile-video-player/>
        }
        @case ('tablet') {
            <!-- <tablet-notice /> -->
            <async-mobile-video-player/>
        }
        @default {
            <!-- desktop -->
             <async-video-player/>
        }
    }
  `,
  styles: ``
})
export class VideoPlayerIndex {
  protected readonly deviceService = inject(DeviceService);
}