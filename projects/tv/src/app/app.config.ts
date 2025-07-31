/* import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { firebaseConfig } from './firebase-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    importProvidersFrom(
      // Initialize Firebase App with your configuration
      provideFirebaseApp(() => initializeApp(firebaseConfig)), 
      // Provide Firebase Authentication
      provideAuth(() => getAuth())
    ),
    provideAnimations(),
    provideHttpClient()
  ]
}; */

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

// Firebase imports
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { firebaseConfig } from './firebase-config';

export const appConfig: ApplicationConfig = {
  providers: [
    // Your existing providers
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(), // Note: For newer Angular, ensure this is the correct zoneless API you intend to use.
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),

    // Directly add Firebase providers here! No importProvidersFrom needed.
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
};
