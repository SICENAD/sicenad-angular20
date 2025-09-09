import { inject, Injectable } from "@angular/core";
import { catchError, concatMap, map, Observable, of, switchMap, tap } from "rxjs";
import { ApiService } from "./apiService";
import { UtilService } from "./utilService";
import { FicheroRecurso } from "@interfaces/models/ficheroRecurso";
import { FicheroSolicitud } from "@interfaces/models/ficheroSolicitud";

@Injectable({ providedIn: 'root' })
export class FicheroService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);

  private ficherosRecurso: FicheroRecurso[] = [];
  private ficheroRecurso: FicheroRecurso | null = null;
  private documentacionCenad: FicheroSolicitud[] = [];
  private documentacionUnidad: FicheroSolicitud[] = [];
  private ficheroSolicitudCenad: FicheroSolicitud | null = null;
  private ficheroSolicitudUnidad: FicheroSolicitud | null = null;

  getFicherosRecurso(): FicheroRecurso[] {
    return this.ficherosRecurso;
  }
  getFicheroRecurso(): FicheroRecurso | null {
    return this.ficheroRecurso;
  }
  getDocumentacionCenad(): FicheroSolicitud[] {
    return this.documentacionCenad;
  }
  getDocumentacionUnidad(): FicheroSolicitud[] {
    return this.documentacionUnidad;
  }
  getFicheroSolicitudCenad(): FicheroSolicitud | null {
    return this.ficheroSolicitudCenad;
  }
  getFicheroSolicitudUnidad(): FicheroSolicitud | null {
    return this.ficheroSolicitudUnidad;
  }

  getAllFicherosDeRecurso(idRecurso: string): Observable<FicheroRecurso[]> {
    const endpoint = `/recursos/${idRecurso}/ficheros?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { ficheros: FicheroRecurso[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.ficheros.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getFicheroRecursoSeleccionado(idFichero: string): Observable<FicheroRecurso | null> {
    const endpoint = `/ficheros/${idFichero}`;
    return this.apiService.peticionConToken<FicheroRecurso>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  crearFicheroRecurso(nombre: string, descripcion: string, archivo: File | null, idCategoriaFichero: string, idCenad: string, idRecurso: string): Observable<any> {
    const endpoint = `/cartografias`;
    const body = {
      nombre: nombre.toUpperCase(),
      descripcion,
      recurso: `${this.apiService.getUrlApi()}/recursos/${idRecurso}`,
      categoriaFichero: `${this.apiService.getUrlApi()}/categorias_fichero/${idCategoriaFichero}`,
      cenad: `${this.apiService.getUrlApi()}/cenads/${idCenad}`
    };
    return this.apiService.peticionConToken<any>(endpoint, 'POST', body).pipe(
      switchMap(resCrear => {
        const idFichero = resCrear.idString;
        if (!archivo) return of(true);
        const endpointUpload = `/files/${idCenad}/subirDocRecurso/${idRecurso}`;
        return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
          switchMap((nombreArchivo: string) => {
            if (!nombreArchivo) return of(false);
            const endpointCartografia = `${endpoint}/${idFichero}`;
            return this.apiService.peticionConToken<any>(endpointCartografia, 'PATCH', { nombreArchivo }).pipe(
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
    let nombreArchivo = nombreArchivoActual || '';
    const endpointFichero = `/ficheros/${idFichero}`;
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion,
      categoriaFichero: `${this.apiService.getUrlApi()}/categorias_fichero/${idCategoriaFichero}`
    };
    const patchFichero = (): Observable<string | null> => {
      if (nombreArchivo) body.nombreArchivo = nombreArchivo;
      return this.apiService.peticionConToken<any>(endpointFichero, 'PATCH', body).pipe(
        tap(() => {
          this.utilService.toast(`Se ha editado el fichero ${nombre}`, 'success');
        }),
        map(() => nombreArchivo),
        catchError(err => { console.error(err); return of(null); })
      );
    };
    if (!archivo) return patchFichero();
    const endpointUpload = `/files/${idCenad}/subirDocRecurso/${idRecurso}`;
    return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
      concatMap(nuevoFichero => {
        if (!nuevoFichero) return of(null);
        if (nombreArchivo) {
          const endpointBorrar = `/files/${idCenad}/borrarDocRecurso/${idRecurso}/${nombreArchivo}`;
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

  deleteFicheroRecurso(nombreArchivo: string, idFichero: string, idCenad: string, idRecurso: string): Observable<any> {
    const endpointFichero = `/ficheros/${idFichero}`;
    const endpointArchivo = `/files/${idCenad}/borrarDocRecurso/${idRecurso}/${nombreArchivo}`;
    return this.apiService.borrarArchivo(endpointArchivo).pipe(
      switchMap(() => this.apiService.peticionConToken<any>(endpointFichero, 'DELETE')),
      tap(res => {
        this.ficheroRecurso = res;
        this.utilService.toast(`Se ha eliminado la cartografía ${this.ficheroRecurso?.nombre}`, 'success');
      }),
      map(() => true),
      catchError(err => { console.error(err); return of(false); })
    );
  }

  getArchivoRecurso(nombreArchivo: string, idCenad: string, idRecurso: string): Observable<void> {
    const endpoint = `/files/${idCenad}/docRecursos/${idRecurso}/${nombreArchivo}`;
    return this.apiService.descargarArchivo(endpoint, nombreArchivo);
  }
}


