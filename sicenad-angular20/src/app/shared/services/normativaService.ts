import { inject, Injectable } from "@angular/core";
import { catchError, concatMap, map, Observable, of, switchMap, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Normativa } from "@interfaces/models/normativa";
import { UtilsStore } from "@stores/utils.store";
import { UtilService } from "./utilService";

@Injectable({ providedIn: 'root' })
export class NormativaService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private utils = inject(UtilsStore)

  getAll(idCenad: string): Observable<Normativa[]> {
    const endpoint = `/cenads/${idCenad}/normativas?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { ficheros: Normativa[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.ficheros.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getNormativaSeleccionada(idNormativa: string): Observable<Normativa | null> {
    const endpoint = `/ficheros/${idNormativa}`;
    return this.apiService.peticionConToken<Normativa>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  crearNormativa(
    nombre: string,
    descripcion: string,
    archivo: File,
    idCenad: string
  ): Observable<any> {
    const endpoint = `/ficheros`;
    const body = {
      nombre: nombre.toUpperCase(),
      descripcion,
      categoriaFichero: `${this.apiService.getUrlApi()}/categorias_fichero/${this.utils.categoriaFicheroCartografia()}`,
      cenad: `${this.apiService.getUrlApi()}/cenads/${idCenad}`
    };
    return this.apiService.peticionConToken<any>(endpoint, 'POST', body).pipe(
      switchMap(resCrear => {
        const idNormativa = resCrear.idString;
        if (!archivo) return of(true);
        const endpointUpload = `/files/${idCenad}/subirNormativa`;
        return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
          switchMap((nombreArchivo: string) => {
            if (!nombreArchivo) return of(false);
            const endpointNormativa = `${endpoint}/${idNormativa}`;
            return this.apiService.peticionConToken<any>(endpointNormativa, 'PATCH', { nombreArchivo }).pipe(
              tap(() => {
                this.utilService.toast(`Se ha creado la normativa ${nombre}`, 'success');
              }),
              map(() => true)
            );
          })
        );
      }),
      catchError(err => { console.error(err); return of(false); })
    );
  }

  editarNormativa(
    nombre: string,
    descripcion: string,
    archivoNormativa: File | null,
    archivoActual: string,
    idCenad: string,
    idNormativa: string
  ): Observable<any> {
    let nombreArchivo = archivoActual || '';
    const endpointNormativa = `/ficheros/${idNormativa}`;
    const body: Partial<Normativa> = {
      nombre: nombre.toUpperCase(),
      descripcion,
    };
    const patchNormativa = (): Observable<string | null> => {
      if (nombreArchivo) body.nombreArchivo = nombreArchivo;
      return this.apiService.peticionConToken<any>(endpointNormativa, 'PATCH', body).pipe(
        tap(() => {
          this.utilService.toast(`Se ha editado la normativa ${nombre}`, 'success');
        }),
        map(() => nombreArchivo),
        catchError(err => { console.error(err); return of(null); })
      );
    };
    if (!archivoNormativa) return patchNormativa();
    const endpointUpload = `/files/${idCenad}/subirNormativa`;
    return this.apiService.subirArchivo(endpointUpload, archivoNormativa).pipe(
      concatMap(nuevaNormativa => {
        if (!nuevaNormativa) return of(null);
        if (nombreArchivo) {
          const endpointBorrar = `/files/${idCenad}/borrarNormativa/${nombreArchivo}`;
          return this.apiService.borrarArchivo(endpointBorrar).pipe(
            map(() => {
              nombreArchivo = nuevaNormativa;
              return null;
            }),
            switchMap(() => patchNormativa())
          );
        } else {
          nombreArchivo = nuevaNormativa;
          return patchNormativa();
        }
      })
    );
  }

  deleteNormativa(nombreArchivo: string, idNormativa: string, idCenad: string): Observable<any> {
    const endpointNormativa = `/ficheros/${idNormativa}`;
    const endpointArchivo = `/files/${idCenad}/borrarNormativa/${nombreArchivo}`;
    return this.apiService.borrarArchivo(endpointArchivo).pipe(
      switchMap(() => this.apiService.peticionConToken<any>(endpointNormativa, 'DELETE')),
      tap(res => {
        let normativa = res;
        this.utilService.toast(`Se ha eliminado la normativa ${normativa?.nombre}`, 'success');
      }),
      map(() => true),
      catchError(err => { console.error(err); return of(false); })
    );
  }

  getArchivoNormativa(nombreArchivo: string, idCenad: string): Observable<void> {
    const endpoint = `/files/${idCenad}/normativas/${nombreArchivo}`;
    return this.apiService.descargarArchivo(endpoint, nombreArchivo);
  }
}
