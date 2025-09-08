import { inject, Injectable } from "@angular/core";
import { catchError, concatMap, map, Observable, of, switchMap, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Cartografia } from "@interfaces/models/cartografia";
import { UtilsStore } from "@stores/utils.store";
import { UtilService } from "./utilService";

@Injectable({ providedIn: 'root' })
export class CartografiaService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private utils = inject(UtilsStore)
  private cartografias: Cartografia[] = [];
  private cartografia: Cartografia | null = null;

  getCartografias(): Cartografia[] {
    return this.cartografias;
  }
  getCartografia(): Cartografia | null {
    return this.cartografia;
  }

  getAll(idCenad: string): Observable<Cartografia[]> {
    const endpoint = `/cenads/${idCenad}/cartografias?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { cartografias: Cartografia[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.cartografias.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getCartografiaSeleccionada(idCartografia: string): Observable<Cartografia | null> {
    const endpoint = `/cartografias/${idCartografia}`;
    return this.apiService.peticionConToken<Cartografia>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  crearCartografia(
    nombre: string,
    descripcion: string,
    escala: string,
    archivo: File,
    idCenad: string
  ): Observable<any> {
    const endpoint = `/cartografias`;
    const body = {
      nombre: nombre.toUpperCase(),
      descripcion,
      escala,
      categoriaFichero: `${this.utils.urlApi()}/categorias_fichero/${this.utils.categoriaFicheroCartografia()}`,
      cenad: `${this.utils.urlApi()}/cenads/${idCenad}`
    };
    return this.apiService.peticionConToken<any>(endpoint, 'POST', body).pipe(
      switchMap(resCrear => {
        const idCartografia = resCrear.idString;
        if (!archivo) return of(true);
        const endpointUpload = `/files/${idCenad}/subirCartografia`;
        return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
          switchMap((nombreArchivo: string) => {
            if (!nombreArchivo) return of(false);
            const endpointCartografia = `${endpoint}/${idCartografia}`;
            return this.apiService.peticionConToken<any>(endpointCartografia, 'PATCH', { nombreArchivo }).pipe(
              tap(() => {
                this.utilService.toast(`Se ha creado la cartografía ${nombre}`, 'success');
              }),
              map(() => true)
            );
          })
        );
      }),
      catchError(err => { console.error(err); return of(false); })
    );
  }

  editarCartografia(
    nombre: string,
    descripcion: string,
    escala: string,
    archivoCartografia: File | null,
    archivoActual: string,
    idCenad: string,
    idCartografia: string
  ): Observable<any> {
    let nombreArchivo = archivoActual || '';
    const endpointCartografia = `/cartografias/${idCartografia}`;
    const body: Partial<Cartografia> = {
      nombre: nombre.toUpperCase(),
      descripcion,
      escala
    };
    const patchCartografia = (): Observable<string | null> => {
      if (nombreArchivo) body.nombreArchivo = nombreArchivo;
      return this.apiService.peticionConToken<any>(endpointCartografia, 'PATCH', body).pipe(
        tap(() => {
          this.utilService.toast(`Se ha editado el CENAD/CMT ${nombre}`, 'success');
        }),
        map(() => nombreArchivo),
        catchError(err => { console.error(err); return of(null); })
      );
    };
    if (!archivoCartografia) return patchCartografia();
    const endpointUpload = `/files/${idCenad}/subirCartografia`;
    return this.apiService.subirArchivo(endpointUpload, archivoCartografia).pipe(
      concatMap(nuevaCartografia => {
        if (!nuevaCartografia) return of(null);
        if (nombreArchivo) {
          const endpointBorrar = `/files/${idCenad}/borrarCartografia/${nombreArchivo}`;
          return this.apiService.borrarArchivo(endpointBorrar).pipe(
            map(() => {
              nombreArchivo = nuevaCartografia;
              return null;
            }),
            switchMap(() => patchCartografia())
          );
        } else {
          nombreArchivo = nuevaCartografia;
          return patchCartografia();
        }
      })
    );
  }

  deleteCartografia(nombreArchivo: string, idCartografia: string, idCenad: string): Observable<any> {
    const endpointCartografia = `/cartografias/${idCartografia}`;
    const endpointArchivo = `/files/${idCenad}/borrarCartografia/${nombreArchivo}`;
    return this.apiService.borrarArchivo(endpointArchivo).pipe(
      switchMap(() => this.apiService.peticionConToken<any>(endpointCartografia, 'DELETE')),
      tap(res => {
        this.cartografia = res;
        this.utilService.toast(`Se ha eliminado la cartografía ${this.cartografia?.nombre}`, 'success');
      }),
      map(() => true),
      catchError(err => { console.error(err); return of(false); })
    );
  }

  getArchivoCartografia(nombreArchivo: string, idCenad: string): Observable<void> {
    const endpoint = `/files/${idCenad}/cartografias/${nombreArchivo}`;
    return this.apiService.descargarArchivo(endpoint, nombreArchivo);
  }




















}
