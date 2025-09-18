import { inject, Injectable } from "@angular/core";
import { catchError, concatMap, map, Observable, of, switchMap, tap } from "rxjs";
import { ApiService } from "./apiService";
import { UtilService } from "./utilService";
import { FicheroRecurso } from "@interfaces/models/ficheroRecurso";
import { FicheroSolicitud } from "@interfaces/models/ficheroSolicitud";
import { Fichero } from "@interfaces/models/fichero";

@Injectable({ providedIn: 'root' })
export class FicheroService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);

  getAllFicheros(idRecurso: string | null, idSolicitud: string | null, isCenad: boolean | null): Observable<Fichero[]> {
    const endpoint = idRecurso ? `/recursos/${idRecurso}/ficheros?size=1000`
      : isCenad ? `/solicitudes/${idSolicitud}/documentacionCenad?size=1000`
        : `/solicitudes/${idSolicitud}/documentacionUnidad?size=1000`;
    return this.apiService.request<{ _embedded: { ficheros: Fichero[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.ficheros.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getFicheroSeleccionado(idFichero: string): Observable<Fichero | null> {
    const endpoint = `/ficheros/${idFichero}`;
    return this.apiService.request<Fichero>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  crearFichero(nombre: string, descripcion: string, archivo: File | null, idCategoriaFichero: string, idCenad: string, idRecurso: string | null, idSolicitud: string | null, isCenad: boolean | null): Observable<any> {
    const endpoint = `/ficheros`;
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion,
      categoriaFichero: `${this.apiService.getUrlApi()}/categorias_fichero/${idCategoriaFichero}`,
      cenad: `${this.apiService.getUrlApi()}/cenads/${idCenad}`
    };
    idRecurso && (body.recurso = `${this.apiService.getUrlApi()}/recursos/${idRecurso}`);
    if (idSolicitud) {
      isCenad ? (body.solicitudRecursoCenad = `${this.apiService.getUrlApi()}/solicitudes/${idSolicitud}`) : (body.solicitudRecursoUnidad = `${this.apiService.getUrlApi()}/solicitudes/${idSolicitud}`);
    }
    return this.apiService.request<any>(endpoint, 'POST', body).pipe(
      switchMap(resCrear => {
        const idFichero = resCrear.idString;
        if (!archivo) return of(true);
        const endpointUpload = body.recurso ? `/files/${idCenad}/subirDocRecurso/${idRecurso}` : `/files/${idCenad}/subirDocSolicitud/${idSolicitud}`;
        return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
          switchMap((nombreArchivo: string) => {
            if (!nombreArchivo) return of(false);
            const endpointCartografia = `${endpoint}/${idFichero}`;
            return this.apiService.request<any>(endpointCartografia, 'PATCH', { nombreArchivo }).pipe(
              tap(() => {
                this.utilService.toast(`Se ha creado el fichero ${nombre}`, 'success');
              }),
              map(() => true)
            );
          })
        );
      }),
      catchError(err => { console.error(err); return of(false); })
    );
  }

  editarFichero(
    nombre: string,
    descripcion: string,
    archivo: File | null,
    nombreArchivoActual: string,
    idCenad: string,
    idRecurso: string | null,
    idSolicitud: string | null,
    idCategoriaFichero: string,
    idFichero: string
  ): Observable<any> {
    let nombreArchivo = nombreArchivoActual || '';
    const endpointFichero = `/ficheros/${idFichero}`;
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion,
      categoriaFichero: `${this.apiService.getUrlApi()}/categorias_fichero/${idCategoriaFichero}`
    };
    const patchFichero = (): Observable<string | null> => {
      if (nombreArchivo) body.nombreArchivo = nombreArchivo;
      return this.apiService.request<any>(endpointFichero, 'PATCH', body).pipe(
        tap(() => {
          this.utilService.toast(`Se ha editado el fichero ${nombre}`, 'success');
        }),
        map(() => nombreArchivo),
        catchError(err => { console.error(err); return of(null); })
      );
    };
    if (!archivo) return patchFichero();

    const endpointUpload = idRecurso ? `/files/${idCenad}/subirDocRecurso/${idRecurso}` : `/files/${idCenad}/subirDocSolicitud/${idSolicitud}`;
    return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
      concatMap(nuevoFichero => {
        if (!nuevoFichero) return of(null);
        if (nombreArchivo) {
          const endpointBorrar = idRecurso ? `/files/${idCenad}/borrarDocRecurso/${idRecurso}/${nombreArchivo}` : `/files/${idCenad}/borrarDocSolicitud/${idSolicitud}/${nombreArchivo}`;
          return this.apiService.borrarArchivo(endpointBorrar).pipe(
            map(() => {
              nombreArchivo = nuevoFichero;
              return null;
            }),
            switchMap(() => patchFichero())
          );
        } else {
          nombreArchivo = nuevoFichero;
          return patchFichero();
        }
      })
    );
  }

  deleteFichero(nombreArchivo: string, idFichero: string, idCenad: string, idRecurso: string | null, idSolicitud: string | null): Observable<any> {
    const endpointFichero = `/ficheros/${idFichero}`;
    const endpointArchivo = idRecurso ? `/files/${idCenad}/borrarDocRecurso/${idRecurso}/${nombreArchivo}` : `/files/${idCenad}/borrarDocSolicitud/${idSolicitud}/${nombreArchivo}`;
    return this.apiService.borrarArchivo(endpointArchivo).pipe(
      switchMap(() => this.apiService.request<any>(endpointFichero, 'DELETE')),
      tap(res => {
        let fichero = res;
        this.utilService.toast(`Se ha eliminado el archivo ${fichero?.nombre}`, 'success');
      }),
      map(() => true),
      catchError(err => { console.error(err); return of(false); })
    );
  }

  getAllFicherosDeRecurso(idRecurso: string): Observable<FicheroRecurso[]> {
    return this.getAllFicheros(idRecurso, null, null) as Observable<FicheroRecurso[]>;
  }

  getAllDocumentacionSolicitudCenad(idSolicitud: string): Observable<FicheroSolicitud[]> {
    return this.getAllFicheros(null, idSolicitud, true) as Observable<FicheroSolicitud[]>;
  }

  getAllDocumentacionSolicitudUnidad(idSolicitud: string): Observable<FicheroSolicitud[]> {
    return this.getAllFicheros(null, idSolicitud, false) as Observable<FicheroSolicitud[]>;
  }

  getFicheroRecursoSeleccionado(idFichero: string): Observable<FicheroRecurso | null> {
    return this.getFicheroSeleccionado(idFichero) as Observable<FicheroRecurso | null>;
  }

  getFicheroSolicitudSeleccionado(idFichero: string): Observable<FicheroSolicitud | null> {
    return this.getFicheroSeleccionado(idFichero) as Observable<FicheroSolicitud | null>;
  }

  crearFicheroRecurso(nombre: string, descripcion: string, archivo: File | null, idCategoriaFichero: string, idCenad: string, idRecurso: string): Observable<any> {
    return this.crearFichero(nombre, descripcion, archivo, idCategoriaFichero, idCenad, idRecurso, null, null);
  }

  crearFicheroSolicitudCenad(nombre: string, descripcion: string, archivo: File | null, idCategoriaFichero: string, idCenad: string, idSolicitud: string): Observable<any> {
    return this.crearFichero(nombre, descripcion, archivo, idCategoriaFichero, idCenad, null, idSolicitud, true);
  }

  crearFicheroSolicitudUnidad(nombre: string, descripcion: string, archivo: File | null, idCategoriaFichero: string, idCenad: string, idSolicitud: string): Observable<any> {
    return this.crearFichero(nombre, descripcion, archivo, idCategoriaFichero, idCenad, null, idSolicitud, false);
  }

  editarFicheroRecurso(
    nombre: string,
    descripcion: string,
    archivo: File | null,
    nombreArchivoActual: string,
    idCenad: string,
    idRecurso: string,
    idCategoriaFichero: string,
    idFichero: string
  ): Observable<any> {
    return this.editarFichero(nombre, descripcion, archivo, nombreArchivoActual, idCenad, idRecurso, null, idCategoriaFichero, idFichero);
  }

  editarFicheroSolicitud(
    nombre: string,
    descripcion: string,
    archivo: File | null,
    nombreArchivoActual: string,
    idCenad: string,
    idSolicitud: string,
    idCategoriaFichero: string,
    idFichero: string
  ): Observable<any> {
    return this.editarFichero(nombre, descripcion, archivo, nombreArchivoActual, idCenad, null, idSolicitud, idCategoriaFichero, idFichero);
  }

  deleteFicheroRecurso(nombreArchivo: string, idFichero: string, idCenad: string, idRecurso: string): Observable<any> {
    return this.deleteFichero(nombreArchivo, idFichero, idCenad, idRecurso, null);
  }

  deleteFicheroSolicitud(nombreArchivo: string, idFichero: string, idCenad: string, idSolicitud: string): Observable<any> {
    return this.deleteFichero(nombreArchivo, idFichero, idCenad, null, idSolicitud);
  }

  getArchivo(nombreArchivo: string, idCenad: string, idRecurso: string | null, idSolicitud: string | null): Observable<void> {
    const endpoint = idRecurso ? `/files/${idCenad}/docRecursos/${idRecurso}/${nombreArchivo}` : `/files/${idCenad}/docSolicitudes/${idSolicitud}/${nombreArchivo}`;
    return this.apiService.descargarArchivo(endpoint, nombreArchivo);
  }

  getArchivoRecurso(nombreArchivo: string, idCenad: string, idRecurso: string): Observable<void> {
    return this.getArchivo(nombreArchivo, idCenad, idRecurso, null);
  }

  getArchivoSolicitud(nombreArchivo: string, idCenad: string, idSolicitud: string): Observable<void> {
    return this.getArchivo(nombreArchivo, idCenad, null, idSolicitud);
  }

  getImagen(nombreArchivo: string, idCenad: string, idRecurso: string | null, idSolicitud: string | null): Observable<Blob> {
    const endpoint = idRecurso ? `/files/${idCenad}/docRecursos/${idRecurso}/${nombreArchivo}` : `/files/${idCenad}/docSolicitudes/${idSolicitud}/${nombreArchivo}`;
    return this.apiService.mostrarArchivo(endpoint);
  }

  getImagenRecurso(nombreArchivo: string, idCenad: string, idRecurso: string): Observable<Blob> {
    return this.getImagen(nombreArchivo, idCenad, idRecurso, null);
  }

  getImagenSolicitud(nombreArchivo: string, idCenad: string, idSolicitud: string): Observable<Blob> {
    return this.getImagen(nombreArchivo, idCenad, null, idSolicitud);
  }
}
