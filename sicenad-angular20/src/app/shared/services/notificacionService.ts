import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { UtilService } from "./utilService";
import { IdiomaService } from "./idiomaService";

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);

  notificarCambioEstado(idSolicitud: string): Observable<any> {
    const endpoint = `/notificar/${idSolicitud}`;
    return this.apiService.request<any>(endpoint, 'GET').pipe(
      map(res => !!res),
          tap(async () => {
        const mensaje = await this.idiomaService.tVars('notificacionCambioEstado', { id: idSolicitud });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
}
