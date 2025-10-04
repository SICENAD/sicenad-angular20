import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, Provider, provideZoneChangeDetection, isDevMode, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { UtilsStore } from '@stores/utils.store';
import { firstValueFrom, Observable } from 'rxjs';
import { tokenApiInterceptor } from '@shared/interceptors/tokenApi.interceptor';
import { globalHttpErrorInterceptor } from '@shared/interceptors/globalHttpError.interceptor';
import { filesInterceptor } from '@shared/interceptors/files.interceptor';
import {
  CalendarDateFormatter,
  CalendarEventTitleFormatter,
  CalendarUtils,
  CalendarA11y,
  DateAdapter
} from 'angular-calendar';
// Usamos las clases por defecto de angular-calendar
import {
  CalendarEventTitleFormatter as DefaultCalendarEventTitleFormatter,
  CalendarUtils as DefaultCalendarUtils,
  CalendarA11y as DefaultCalendarA11y
} from 'angular-calendar'; import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import localeRu from '@angular/common/locales/ru';
import { CustomDateFormatter } from '@shared/customFormat/customDateFormatter';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

registerLocaleData(localeEs, 'es');
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeIt, 'it');
registerLocaleData(localeRu, 'ru');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenApiInterceptor, filesInterceptor
      //, globalHttpErrorInterceptor  // no lo quiero usar de momento
    ])), // Provee HttpClient a toda la app
    provideAnimations(),
    provideAngularCalendar(), // Configuración global de angular-calendar
    // Configuración global de ngx-toastr
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
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }), provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ]
};

/**
 * Configuración global de angular-calendar
 * para proyectos standalone sin NgModule
 */
export function provideAngularCalendar(): Provider[] {
  return [
    { provide: DateAdapter, useFactory: adapterFactory },
    { provide: CalendarDateFormatter, useClass: CustomDateFormatter },
    { provide: CalendarEventTitleFormatter, useClass: DefaultCalendarEventTitleFormatter },
    { provide: CalendarUtils, useClass: DefaultCalendarUtils },
    { provide: CalendarA11y, useClass: DefaultCalendarA11y },
    { provide: LOCALE_ID, useValue: 'es' }
  ];
}

/**
 * Configuración global de traducciones
 */
export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return {
    getTranslation: (lang: string): Observable<any> => {
      return http.get(`/languages/${lang}.json`);
    }
  };
}
