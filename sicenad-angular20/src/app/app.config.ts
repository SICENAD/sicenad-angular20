import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { UtilsStore } from '@stores/utils.store';
import { firstValueFrom } from 'rxjs';
import { tokenApiInterceptor } from '@shared/interceptors/tokenApi.interceptor';
import { globalHttpErrorInterceptor } from '@shared/interceptors/globalHttpError.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenApiInterceptor, globalHttpErrorInterceptor])), // Provee HttpClient a toda la app
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-top-right', // posición de los toasts
      timeOut: 2000,                    // duración en ms
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
    }),
    // 🔹 Inicialización asíncrona de properties.json
    {
      provide: 'APP_INITIALIZER',
      multi: true,
      useFactory: (utils: UtilsStore) => {
        return () => firstValueFrom(utils.cargarPropiedadesIniciales());
      },
      deps: [UtilsStore],
    },
  ]
};
