import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService, YoutubeVideo } from '../media.service';
import { VideoCardComponent } from '../../../shared/components/video-card/video-card.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'async-feature-official',
  standalone: true,
  imports: [CommonModule, VideoCardComponent, SkeletonLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="official obsidian-bg">
      <div class="hero glass-surface">
        <h2>Official Music</h2>
        <p>Direct from Davido's verified channels — curated by our YouTube pipeline.</p>
      </div>
      @if (loading()) { <async-skeleton-loader [count]="6"/> }
      @else {
        <div class="grid">
          @for (v of videos(); track v.youtubeVideoId) {
            <async-video-card [data]="{
              youtubeVideoId: v.youtubeVideoId,
              title: v.title,
              channel: v.channel,
              views: v.views,
              duration: v.duration,
              isOfficialContent: true
            }"/>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .official{padding:24px;background:#0B0B0C;min-height:60vh}
    .hero{padding:20px;border-radius:var(--dt-radius-sheet);background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10);backdrop-filter:blur(16px);margin-bottom:18px}
    .hero h2{margin:0;color:#F8F7F8;font-size:22px;font-weight:800}
    .hero p{margin:6px 0 0;color:#A1A1AA;font-size:13px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
  `]
})
export class OfficialComponent implements OnInit {
  private readonly media = inject(MediaService);
  videos = signal<YoutubeVideo[]>([]);
  loading = signal(true);
  ngOnInit(): void {
    this.media.getOfficial(12,0).subscribe({
      next: (res:any)=>{ this.videos.set(res?.data ?? []); this.loading.set(false); },
      error: ()=> this.loading.set(false)
    });
  }
}
