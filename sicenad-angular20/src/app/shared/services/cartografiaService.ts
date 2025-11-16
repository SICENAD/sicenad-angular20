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
    let cartografiaId = '';
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
          cartografiaId = idCartografia;
          if (!archivo) return of(true);
          const endpointUpload = `/${nombreCenad}/cartografia`;
          return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
            switchMap((resArchivo) => {
              const archivo: string = resArchivo.d.Name;
              if (!archivo) return of(false);
              const endpointCartografia = 'Cartografias';
              return this.apiService
                .request<any>(endpointCartografia, 'PATCH', {
                  Id: idCartografia,
                  nombreArchivo: archivo,
                })
                .pipe(
                  tap(async () => {
                    const mensaje = await this.idiomaService.tVars(
                      'cartografias.cartografiaCreada',
                      {
                        nombre,
                      }
                    );
                    this.utilService.toast(mensaje, 'success');
                  }),
                  map(() => true)
                );
            })
          );
        }),
        catchError((err) => {
          console.error(err);
          this.deleteCartografia('', cartografiaId, nombreCenad, true).subscribe();
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
      Id: idCartografia,
    };
    const patchCartografia = (): Observable<string | null> => {
      if (nombreArchivo) body.nombreArchivo = nombreArchivo;
      return this.apiService.request<any>(endpoint, 'PATCH', body).pipe(
        map((res) => !!res),
        tap(async () => {
          const mensaje = await this.idiomaService.tVars('cartografias.cartografiaModificada', {
            nombre,
          });
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
    // Si existe un archivo previo, primero subimos el nuevo. Solo si la subida es correcta
    // intentaremos borrar el archivo antiguo. Si la subida falla, conservamos el archivo viejo
    // y no modificamos la entidad. Si el borrado del antiguo falla, mostramos un aviso pero
    // seguimos y actualizamos el nombreArchivo al nuevo valor.
    if (nombreArchivo) {
      return this.apiService.subirArchivo(endpointUpload, archivoCartografia).pipe(
        switchMap((resArchivo) => {
          const nuevoArchivoName = resArchivo?.d?.Name || resArchivo?.Name || '';
          if (!nuevoArchivoName) return of(null);
          // Intentar borrar el archivo antiguo (no crítico): si falla, avisar pero continuar
          const antiguo = nombreArchivo;
          nombreArchivo = nuevoArchivoName;
          return this.apiService.borrarArchivoSharePoint(nombreBiblioteca, `cartografia/${antiguo}`).pipe(
            switchMap((borradoOk: boolean) => {
              if (!borradoOk) {
                // Mostrar advertencia y continuar con el nuevo archivo en la entidad
                from(this.idiomaService.tVars('archivos.errorBorrarArchivo')).subscribe((mensaje) => {
                  this.utilService.toast(
                    mensaje || 'No se pudo borrar el archivo anterior. Se conservará en el servidor.',
                    'warning'
                  );
                });
              }
              return patchCartografia();
            }),
            catchError((err) => {
              console.warn('No se pudo borrar el archivo antiguo, pero la subida fue correcta:', err);
              from(this.idiomaService.tVars('archivos.errorBorrarArchivo')).subscribe((mensaje) => {
                this.utilService.toast(
                  mensaje || 'No se pudo borrar el archivo anterior. Se conservará en el servidor.',
                  'warning'
                );
              });
              return patchCartografia();
            })
          );
        }),
        catchError((err) => {
          console.error('Error subiendo el nuevo archivo:', err);
          // No borramos nada y conservamos el archivo y nombre antiguos
          this.utilService.toast('Error subiendo el nuevo archivo. Se conserva la versión anterior.', 'error');
          return of(null);
        })
      );
    }
    // Caso no esperado (nunca debería ocurrir): aplicar patch como fallback
    console.warn('editarCartografia: no se detectó archivo previo; ejecutando fallback de patch.');
    return patchCartografia();
  }

  deleteCartografia(
    nombreArchivo: string,
    idCartografia: string,
    nombreCenad: string,
    evitarBorrado?: boolean
  ): Observable<any> {
    let evitarElBorrado = evitarBorrado ? evitarBorrado : false;
    const endpoint = 'Cartografias';
    if (evitarElBorrado || !nombreArchivo) {
      console.log('Evitar borrado activado, borrara solo cartografia, sin borrar archivo.');
      return this.apiService.request<any>(endpoint, 'DELETE', { Id: idCartografia }).pipe(
        tap(async (res) => {
          if (!evitarElBorrado) {
            const mensaje = await this.idiomaService.tVars('cartografias.cartografiaEliminada', {
              nombreArchivo: idCartografia,
            });
            this.utilService.toast(mensaje, 'success');
          }
        }),
        catchError((err) => {
          console.error(err);
          return of(false);
        })
      );
    }
    return this.apiService
      .borrarArchivoSharePoint(nombreCenad, `cartografia/${nombreArchivo}`)
      .pipe(
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
