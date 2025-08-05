import { Injectable } from '@angular/core';
import { ApiService } from '../../common/services/api.service';


@Injectable()
export class UploadService {
   constructor(private apiService: ApiService) {}

  uploadVideo(videoData: any) {
    /* const user = await this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const videoWithUser = {
      ...videoData,
      userId: user.uid,
      username: user.displayName || 'Anonymous',
      userPhoto: user.photoURL || ''
    };

    return this.firestore.collection('videos').add(videoWithUser); */
  }
}