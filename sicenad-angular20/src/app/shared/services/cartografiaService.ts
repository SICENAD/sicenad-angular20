import { inject, Injectable } from '@angular/core';
import { catchError, concatMap, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { ApiService } from './apiService';
import { Cartografia } from '@interfaces/models/cartografia';
import { UtilsStore } from '@stores/utils.store';
import { UtilService } from './utilService';
import { IdiomaService } from './idiomaService';

@Injectable({ providedIn: 'root' })
export class CartografiaService {
  private utils = inject(UtilsStore);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private urlBasic = `${this.utils.urlApi()}/getbytitle('Cartografias')/items`;

  getAll(idCenad: string): Observable<Cartografia[]> {
    const endpoint = `${this.urlBasic}?$select=Id,nombre,descripcion,nombreArchivo,escala&$filter=cenadId eq ${idCenad}`;
    return this.apiService.request<any>(endpoint, 'GET').pipe(
      map((res) => this.utilService.ensureArray<Cartografia>(res)),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getCartografiaSeleccionada(idCartografia: string): Observable<Cartografia | null> {
    const urlCartografia = `${this.urlBasic}(${idCartografia})`;
    return this.apiService.getElemento(urlCartografia).pipe(
      map((c) => {
        if (!c) throw new Error('Cartografía no encontrada');
        return c as Cartografia;
      }),
      catchError((err) => {
        console.error('Error obteniendo Cartografía seleccionada:', err);
        return of(null);
      })
    );
  }

  crearCartografia(
    nombre: string,
    descripcion: string,
    escala: string,
    archivo: File,
    idCenad: string,
    nombreCenad: string
  ): Observable<any> {
    const endpoint = `Cartografias`;
    return this.apiService
      .request<any>(endpoint, 'POST', {
        nombre: nombre.toUpperCase(),
        escala,
        descripcion,
        cenadId: idCenad
      })
      .pipe(
        switchMap((resCrear) => {
          const idCartografia = resCrear.Id;
          console.log(idCartografia);
          if (!archivo) return of(true);
          const endpointUpload = `/${nombreCenad}/cartografia`;
          return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
            switchMap((resArchivo) => {
              const archivo: string = resArchivo.d.Name;
              console.log(archivo);
              if (!archivo) return of(false);
              const endpointCartografia = 'Cartografias';
              return this.apiService
                .request<any>(endpointCartografia, 'PATCH', { Id: idCartografia, nombreArchivo: archivo })
                .pipe(
                  tap(async () => {
                    const mensaje = await this.idiomaService.tVars('cartografias.cartografiaCreada', {
                      nombre,
                    });
                    this.utilService.toast(mensaje, 'success');
                  }),
                  map(() => true)
                );
            })
          );
        }),
        catchError((err) => {
          console.error(err);
          return of(false);
        })
      );
  }

  editarCartografia(
    nombre: string,
    descripcion: string,
    escala: string,
    archivoCartografia: File | null,
    archivoActual: string,
    nombreCenad: string,
    idCartografia: string
  ): Observable<any> {
    let nombreArchivo = archivoActual || '';
    const endpoint = 'Cartografias';
    const body: Partial<Cartografia> = {
      nombre: nombre.toUpperCase(),
      escala,
      descripcion,
      Id: idCartografia
    };
    const patchCartografia = (): Observable<string | null> => {
      if (nombreArchivo) body.nombreArchivo = nombreArchivo;
      return this.apiService.request<any>(endpoint, 'PATCH', body).pipe(
        map((res) => !!res),
        tap(async () => {
          const mensaje = await this.idiomaService.tVars('cartografias.cartografiaEditada', { nombre });
          this.utilService.toast(mensaje, 'success');
        }),
        map(() => nombreArchivo),
        catchError((err) => {
          console.error(err);
          return of(null);
        })
      );
    };
    if (!archivoCartografia) return patchCartografia();
    const nombreBiblioteca = nombreCenad;
    const endpointUpload = `/${nombreBiblioteca}/cartografia`;
    // Si existe un archivo previo, intentamos borrarlo PRIMERO. Si el borrado falla, abortamos y
    // mostramos un toast de error. Si no existe, subimos directamente.
    if (nombreArchivo) {
      return this.apiService.borrarArchivoSharePoint(nombreBiblioteca, `cartografia/${nombreArchivo}`).pipe(
        switchMap((borradoOk: boolean) => {
          if (!borradoOk) {
            console.warn('Abortando subida: no se pudo borrar el archivo anterior.');
            return from(this.idiomaService.tVars('archivos.errorBorrarArchivo')).pipe(
              switchMap((mensaje) => {
                this.utilService.toast(
                  mensaje || 'No se pudo borrar el archivo anterior. Operación abortada.',
                  'error'
                );
                return of(null);
              }),
              catchError(() => {
                this.utilService.toast(
                  'No se pudo borrar el archivo anterior. Operación abortada.',
                  'error'
                );
                return of(null);
              })
            );
          }
          // Borrado OK -> subimos el nuevo archivo
          return this.apiService.subirArchivo(endpointUpload, archivoCartografia).pipe(
            switchMap((resArchivo) => {
              const nuevoArchivoName = resArchivo?.d?.Name || resArchivo?.Name || '';
              if (!nuevoArchivoName) return of(null);
              nombreArchivo = nuevoArchivoName;
              return patchCartografia();
            }),
            catchError((err) => {
              console.error('Error subiendo el nuevo archivo:', err);
              return of(null);
            })
          );
        }),
        catchError((err) => {
          console.warn('Error borrando el archivo anterior:', err);
          return from(this.idiomaService.tVars('archivos.errorBorrarArchivo')).pipe(
            switchMap((mensaje) => {
              this.utilService.toast(
                mensaje || 'No se pudo borrar el archivo anterior. Operación abortada.',
                'error'
              );
              return of(null);
            }),
            catchError(() => {
              this.utilService.toast(
                'No se pudo borrar el archivo anterior. Operación abortada.',
                'error'
              );
              return of(null);
            })
          );
        })
      );
    }
    // No había archivo previo: subimos y parchamos directamente
    return this.apiService.subirArchivo(endpointUpload, archivoCartografia).pipe(
      switchMap((resArchivo) => {
        const nuevoArchivoName = resArchivo?.d?.Name || resArchivo?.Name || '';
        if (!nuevoArchivoName) return of(null);
        nombreArchivo = nuevoArchivoName;
        return patchCartografia();
      }),
      catchError((err) => {
        console.error('Error subiendo el nuevo archivo (sin previo):', err);
        return of(null);
      })
    );
  }

  deleteCartografia(
    nombreArchivo: string,
    idCartografia: string,
    nombreCenad: string
  ): Observable<any> {
    const endpoint = 'Cartografias';
    return this.apiService.borrarArchivoSharePoint(nombreCenad, `cartografia/${nombreArchivo}`).pipe(
      switchMap((borradoOk: boolean) => {
        if (!borradoOk) {
          console.warn('Abortando subida: no se pudo borrar el escudo anterior.');
          return from(this.idiomaService.tVars('archivos.errorBorrarArchivo')).pipe(
            switchMap((mensaje) => {
              this.utilService.toast(
                mensaje || 'No se pudo borrar el escudo anterior. Operación abortada.',
                'error'
              );
              return of(null);
            }),
            catchError(() => {
              this.utilService.toast(
                'No se pudo borrar el escudo anterior. Operación abortada.',
                'error'
              );
              return of(null);
            })
          );
        }
        // Borrado OK -> borramos la cartografia
        return this.apiService.request<any>(endpoint, 'DELETE', { Id: idCartografia }).pipe(
          tap(async (res) => {
            const mensaje = await this.idiomaService.tVars('cartografias.cartografiaEliminada', {
              nombreArchivo: nombreArchivo,
            });
            this.utilService.toast(mensaje, 'success');
          }),
          catchError((err) => {
            console.error(err);
            return of(false);
          })
        );
      })
    );
  }

  getArchivoCartografia(nombreArchivo: string, nombreCenad: string): Observable<void> {
    const endpoint = `/${nombreCenad}/cartografia/${nombreArchivo}`;
    return this.apiService.descargarArchivo(endpoint, nombreArchivo);
  }
}
