import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Solicitud } from "@interfaces/models/solicitud";
import { UtilService } from "./utilService";

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);

  getAll(idCenad: string): Observable<Solicitud[]> {
    const endpoint = `/cenads/${idCenad}/solicitudes?size=1000`;
    return this.apiService.request<{ _embedded: { solicitudes: Solicitud[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.solicitudes.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getSolicitudesPorEstado(idCenad: string, estado: string): Observable<Solicitud[]> {
    const endpoint = `/cenads/${idCenad}/solicitudesEstado/${estado}?size=1000`;
    return this.apiService.request<{ _embedded: { solicitudes: Solicitud[] } }>(endpoint, 'GET').pipe(
      map(res => {
        console.log(`Solicitudes recibidas con estado ${estado}:`, res);
        return res._embedded?.solicitudes.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || [];
      }),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getSolicitudesDeRecurso(idRecurso: string): Observable<Solicitud[]> {
    const endpoint = `/recursos/${idRecurso}/solicitudes?size=1000`;
    return this.apiService.request<{ _embedded: { solicitudes: Solicitud[] } }>(endpoint, 'GET').pipe(
      map(res => {
        console.log(`Solicitudes recibidas para el recurso ${idRecurso}:`, res);
        return res._embedded?.solicitudes.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || [];
      }),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getSolicitudSeleccionada(idSolicitud: string): Observable<Solicitud | null> {
    const endpoint = `/solicitudes/${idSolicitud}`;
    return this.apiService.request<Solicitud>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  crearSolicitud(
    observaciones: string,
    unidadUsuaria: string,
    jefeUnidadUsuaria: string,
    pocEjercicio: string,
    tlfnRedactor: string,
    fechaSolicitud: Date,
    fechaHoraInicioRecurso: Date,
    fechaHoraFinRecurso: Date,
    estado: string,
    idRecurso: string,
    idUsuarioNormal: string
  ): Observable<any> {
    const endpoint = `/solicitudes`;
    const body: any = {
      observaciones: observaciones,
      unidadUsuaria: unidadUsuaria,
      jefeUnidadUsuaria: jefeUnidadUsuaria,
      pocEjercicio: pocEjercicio,
      tlfnRedactor: tlfnRedactor,
      fechaSolicitud: this.utilService.localDateTimeToIso(fechaSolicitud),
      fechaUltModSolicitud: this.utilService.localDateTimeToIso(fechaSolicitud),
      fechaHoraInicioRecurso: this.utilService.localDateTimeToIso(fechaHoraInicioRecurso),
      fechaHoraFinRecurso: this.utilService.localDateTimeToIso(fechaHoraFinRecurso),
      estado: estado,
      recurso: `${this.apiService.getUrlApi()}/recursos/${idRecurso}`,
      usuarioNormal: `${this.apiService.getUrlApi()}/usuarios_normal/${idUsuarioNormal}`
    };
    return this.apiService.request<any>(endpoint, 'POST', body).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha creado la solicitud`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarSolicitud(
    observaciones: string,
    jefeUnidadUsuaria: string,
    pocEjercicio: string,
    tlfnRedactor: string,
    fechaHoraInicioRecurso: Date,
    fechaHoraFinRecurso: Date,
    estado: string,
    idSolicitud: string,
    observacionesCenad: string,
    fechaFinDocumentacion: Date
  ): Observable<any> {
    const endpoint = `/solicitudes/${idSolicitud}`;
    const fechaFinDocumentacionCondicional = fechaFinDocumentacion ? this.utilService.localDateTimeToIso(fechaFinDocumentacion) : null;
    const body: any = {
        observaciones: observaciones,
        observacionesCenad: observacionesCenad,
        jefeUnidadUsuaria: this.utilService.toTitleCase(jefeUnidadUsuaria),
        pocEjercicio: pocEjercicio,
        tlfnRedactor: tlfnRedactor,
        fechaFinDocumentacion: fechaFinDocumentacionCondicional,
        fechaUltModSolicitud: this.utilService.localDateTimeToIso(new Date()),
        fechaHoraInicioRecurso: this.utilService.localDateTimeToIso(fechaHoraInicioRecurso),
        fechaHoraFinRecurso: this.utilService.localDateTimeToIso(fechaHoraFinRecurso),
        estado: estado
    };
    return this.apiService.request<any>(endpoint, 'PATCH', body).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha modificado la solicitud`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  deleteSolicitud(idSolicitud: string): Observable<any> {
    const endpoint = `/solicitudes/${idSolicitud}`;
    return this.apiService.request<any>(endpoint, 'DELETE').pipe(
      tap(res => {
        let solicitud = res;
        this.utilService.toast(`Se ha eliminado la solicitud ${solicitud?.id}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
}
