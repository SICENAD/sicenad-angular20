import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(), // Provee HttpClient a toda la app
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-top-right', // posición de los toasts
      timeOut: 2000,                    // duración en ms
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
    }),]
}

