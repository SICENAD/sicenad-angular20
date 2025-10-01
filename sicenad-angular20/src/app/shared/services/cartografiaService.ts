import { inject, Injectable } from "@angular/core";
import { catchError, concatMap, map, Observable, of, switchMap, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Cartografia } from "@interfaces/models/cartografia";
import { UtilsStore } from "@stores/utils.store";
import { UtilService } from "./utilService";
import { IdiomaService } from "./idiomaService";

@Injectable({ providedIn: 'root' })
export class CartografiaService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private utils = inject(UtilsStore);
  private idiomaService = inject(IdiomaService);

  getAll(idCenad: string): Observable<Cartografia[]> {
    const endpoint = `/cenads/${idCenad}/cartografias?size=1000`;
    return this.apiService.request<{ _embedded: { cartografias: Cartografia[] } }>(endpoint, 'GET').pipe(
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
    return this.apiService.request<Cartografia>(endpoint, 'GET').pipe(
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
      categoriaFichero: `${this.apiService.getUrlApi()}/categorias_fichero/${this.utils.categoriaFicheroCartografia()}`,
      cenad: `${this.apiService.getUrlApi()}/cenads/${idCenad}`
    };
    return this.apiService.request<any>(endpoint, 'POST', body).pipe(
      switchMap(resCrear => {
        const idCartografia = resCrear.idString;
        if (!archivo) return of(true);
        const endpointUpload = `/files/${idCenad}/subirCartografia`;
        return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
          switchMap((nombreArchivo: string) => {
            if (!nombreArchivo) return of(false);
            const endpointCartografia = `${endpoint}/${idCartografia}`;
            return this.apiService.request<any>(endpointCartografia, 'PATCH', { nombreArchivo }).pipe(
              tap(async () => {
                const mensaje = await this.idiomaService.tVars('cartografias.cartografiaCreada', { nombre });
                this.utilService.toast(mensaje, 'success');
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
      return this.apiService.request<any>(endpointCartografia, 'PATCH', body).pipe(
        tap(async () => {
          const mensaje = await this.idiomaService.tVars('cartografias.cartografiaModificada', { nombre });
          this.utilService.toast(mensaje, 'success');
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
      switchMap(() => this.apiService.request<any>(endpointCartografia, 'DELETE')),
      tap(async res => {
        let cartografia = res;
        const mensaje = await this.idiomaService.tVars('cartografias.cartografiaEliminada', { nombre: cartografia?.nombre });
        this.utilService.toast(mensaje, 'success');
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
