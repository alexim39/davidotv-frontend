import { Routes } from '@angular/router';
import { SystemSettingContainerComponent } from './system/system-container.component';
import { AccountContainerComponent } from './account/account-container.component';
import { SocialMediaPageSettingContainerComponent } from './social-media-pages/social-media-page-container.component';

export const SettingsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'setting',
    pathMatch: 'full',
  },
  {
    path: '',
    children: [
      {
        path: 'system',
        component: SystemSettingContainerComponent,
        title: "System Setting - Configure the look and feel",
      },
      {
        path: 'account',
        component: AccountContainerComponent,
        title: "Account Setting - Configure your profile settings",
      },
      {
        path: 'share-reviews',
        component: SocialMediaPageSettingContainerComponent,
        title: "Socal Media Setting - Configure your social profile settings",
      },
    ],
  },
];