import { Routes } from '@angular/router';
import { SystemSettingContainerComponent } from './system/system-container.component';
import { AccountContainerComponent } from './account/account-container.component';
import { AppReveiwSettingContainerComponent } from './social-media-pages/app-review-container.component';

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
        component: AppReveiwSettingContainerComponent,
        title: "App Review - Reveiw and testify about DavidoTV",
      },
    ],
  },
];