import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, switchMap, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Solicitud } from "@interfaces/models/solicitud";
import { UtilService } from "./utilService";
import { IdiomaService } from "./idiomaService";
import { UtilsStore } from "@stores/utils.store";

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private utils = inject(UtilsStore);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private urlBasic = `${this.utils.urlApi()}/getbytitle('Solicitudes')/items`;

  getAll(idCenad: string): Observable<Solicitud[]> {
    const urlSolicitudes = `${this.urlBasic}?$select=Id,observaciones,observacionesCenad,jefeUnidadUsuaria,pocEjercicio,tlfnRedactor,estado,fechaSolicitud,fechaUltModSolicitud,fechaHoraInicioRecurso,fechaHoraFinRecurso,fechaFinDocumentacion,unidadUsuaria,cenad/nombre,recurso/Id,recurso/nombre,recurso/descripcion,usuarioNormal/Id,usuarioNormal/username&$expand=tipoFormulario&$expand=recurso&$expand=cenad&$expand=usuarioNormal&$filter=cenadId eq ${idCenad}`;
    return this.apiService.request<any>(urlSolicitudes, 'GET').pipe(
      map((res) => this.utilService.ensureArray<Solicitud>(res)),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getSolicitudesPorEstado(idCenad: string, estado: string): Observable<Solicitud[]> {
    const urlSolicitudes = `${this.urlBasic}?$select=Id,observaciones,observacionesCenad,jefeUnidadUsuaria,pocEjercicio,tlfnRedactor,estado,fechaSolicitud,fechaUltModSolicitud,fechaHoraInicioRecurso,fechaHoraFinRecurso,fechaFinDocumentacion,unidadUsuaria,cenad/nombre,recurso/Id,recurso/nombre,recurso/descripcion,usuarioNormal/Id,usuarioNormal/username&$expand=tipoFormulario&$expand=recurso&$expand=cenad&$expand=usuarioNormal&$filter=cenadId eq ${idCenad} and estado=${estado}`;
    return this.apiService.request<any>(urlSolicitudes, 'GET').pipe(
      map((res) => this.utilService.ensureArray<Solicitud>(res)),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getSolicitudesDeRecurso(idRecurso: string): Observable<Solicitud[]> {
    const urlSolicitudes = `${this.urlBasic}?$select=Id,observaciones,observacionesCenad,jefeUnidadUsuaria,pocEjercicio,tlfnRedactor,estado,fechaSolicitud,fechaUltModSolicitud,fechaHoraInicioRecurso,fechaHoraFinRecurso,fechaFinDocumentacion,unidadUsuaria,cenad/nombre,recurso/Id,recurso/nombre,recurso/descripcion,usuarioNormal/Id,usuarioNormal/username&$expand=tipoFormulario&$expand=recurso&$expand=cenad&$expand=usuarioNormal&$filter=recursoId eq ${idRecurso}`;
    return this.apiService.request<any>(urlSolicitudes, 'GET').pipe(
      map((res) => this.utilService.ensureArray<Solicitud>(res)),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getSolicitudesDeRecursoPorEstado(idRecurso: string, estado: string): Observable<Solicitud[]> {
    const urlSolicitudes = `${this.urlBasic}?$select=Id,observaciones,observacionesCenad,jefeUnidadUsuaria,pocEjercicio,tlfnRedactor,estado,fechaSolicitud,fechaUltModSolicitud,fechaHoraInicioRecurso,fechaHoraFinRecurso,fechaFinDocumentacion,unidadUsuaria,cenad/nombre,recurso/Id,recurso/nombre,recurso/descripcion,usuarioNormal/Id,usuarioNormal/username&$expand=tipoFormulario&$expand=recurso&$expand=cenad&$expand=usuarioNormal&$filter=recursoId eq ${idRecurso} and estado=${estado}`;
    return this.apiService.request<any>(urlSolicitudes, 'GET').pipe(
      map((res) => this.utilService.ensureArray<Solicitud>(res)),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getSolicitudSeleccionada(idSolicitud: string): Observable<Solicitud | null> {
    const urlSolicitud = `${this.urlBasic}(${idSolicitud})?$select=Id,observaciones,observacionesCenad,jefeUnidadUsuaria,pocEjercicio,tlfnRedactor,estado,fechaSolicitud,fechaUltModSolicitud,fechaHoraInicioRecurso,fechaHoraFinRecurso,fechaFinDocumentacion,unidadUsuaria,cenad/nombre,recurso/Id,recurso/nombre,recurso/descripcion,usuarioNormal/Id,usuarioNormal/username&$expand=tipoFormulario&$expand=recurso&$expand=cenad&$expand=usuarioNormal`;
    return this.apiService.getElemento(urlSolicitud).pipe(
      map((s) => {
        if (!s) throw new Error('Solicitud no encontrada');
        return s as Solicitud;
      }),
      catchError((err) => {
        console.error('Error obteniendo Solicitud seleccionada:', err);
        return of(null);
      })
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
    idUsuarioNormal: string,
    idCenad: string
  ): Observable<any> {
    const endpoint = 'Solicitudes';
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
      cenadId: idCenad,
      recursoId: idRecurso,
      usuarioNormalId: idUsuarioNormal
    };
    return this.apiService.request<any>(endpoint, 'POST', body).pipe(
      map((res) => !!res),
      tap(async () => {
        const mensaje = await this.idiomaService.tVars('solicitudes.solicitudCreada', { nombre });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
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
    const endpoint = 'Solicitudes';
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
      estado: estado,
      Id: idSolicitud
    };
    return this.apiService.request<any>(endpoint, 'PATCH', body).pipe(
      map((res) => !!res),
      tap(async () => {
        const mensaje = await this.idiomaService.tVars('solicitudes.solicitudModificada', {
          nombre: body.nombre,
        });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }

  deleteSolicitud(idSolicitud: string, nombreCenad: string): Observable<any> {
    const endpoint = 'Solicitudes';
    // Intentamos borrar la carpeta; si falla (404/409 u otro), lo registramos y continuamos
    return this.apiService.borrarCarpeta(`/${nombreCenad}/solicitudes/${idSolicitud}`).pipe(
      catchError((err) => {
        console.warn(
          `No se pudo borrar la carpeta de la solicitud ${idSolicitud}, se continúa con el borrado de la solicitud: ${err}`
        );
        return of(false);
      }),
      switchMap(() => this.apiService.request<any>(endpoint, 'DELETE', { Id: idSolicitud })
      ),
      tap(async (res) => {
        const mensaje = await this.idiomaService.tVars('solicitudes.solicitudEliminada', {
          id: idSolicitud,
        });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }
}
