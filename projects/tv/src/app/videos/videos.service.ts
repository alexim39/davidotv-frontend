export interface VideoItem {
  id: {
    kind: 'youtube#video' | 'youtube#channel' | 'youtube#playlist';
    videoId?: string;
    channelId?: string;
    playlistId?: string;
  };

  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
        width: number;
        height: number;
      };
      medium: {
        url: string;
        width: number;
        height: number;
      };
      high: {
        url: string;
        width: number;
        height: number;
      };
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };

  // Custom properties for your app – optional
  title?: string;
  thumbnail?: string;
  channel?: string;
  channelIcon?: string;
  views?: string;
  date?: string;
  likes?: number;
  duration?: number;
}
