import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { UtilService } from "./utilService";

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);

  notificarCambioEstado(idSolicitud: string): Observable<any> {
    const endpoint = `/notificar/${idSolicitud}`;
    return this.apiService.request<any>(endpoint, 'GET').pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha notificado el cambio de estado para la solicitud ${idSolicitud}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
}
