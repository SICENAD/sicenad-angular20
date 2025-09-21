import { ApplicationConfig, provideBrowserGlobalErrorListeners, Provider, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { UtilsStore } from '@stores/utils.store';
import { firstValueFrom } from 'rxjs';
import { tokenApiInterceptor } from '@shared/interceptors/tokenApi.interceptor';
import { globalHttpErrorInterceptor } from '@shared/interceptors/globalHttpError.interceptor';
import { filesInterceptor } from '@shared/interceptors/files.interceptor';
import {
  CalendarDateFormatter,
  CalendarEventTitleFormatter,
  CalendarUtils,
  CalendarA11y,
  //CalendarMonthViewComponent,
  //CalendarWeekViewComponent,
  //CalendarDayViewComponent,
  //CalendarMonthViewHeaderComponent,
  DateAdapter
} from 'angular-calendar';
// Usamos las clases por defecto de angular-calendar
import {
  CalendarDateFormatter as DefaultCalendarDateFormatter,
  CalendarEventTitleFormatter as DefaultCalendarEventTitleFormatter,
  CalendarUtils as DefaultCalendarUtils,
  CalendarA11y as DefaultCalendarA11y
} from 'angular-calendar';import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenApiInterceptor, filesInterceptor, globalHttpErrorInterceptor])), // Provee HttpClient a toda la app
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
  ]
};

/**
 * Configuración global de angular-calendar
 * para proyectos standalone sin NgModule
 */
export function provideAngularCalendar(): Provider[] {
  return [
    { provide: DateAdapter, useFactory: adapterFactory },
    { provide: CalendarDateFormatter, useClass: DefaultCalendarDateFormatter },
    { provide: CalendarEventTitleFormatter, useClass: DefaultCalendarEventTitleFormatter },
    { provide: CalendarUtils, useClass: DefaultCalendarUtils },
    { provide: CalendarA11y, useClass: DefaultCalendarA11y }
  ];
}
