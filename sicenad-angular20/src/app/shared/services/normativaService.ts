import { inject, Injectable } from '@angular/core';
import { catchError, concatMap, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { ApiService } from './apiService';
import { Normativa } from '@interfaces/models/normativa';
import { UtilsStore } from '@stores/utils.store';
import { UtilService } from './utilService';
import { IdiomaService } from './idiomaService';

@Injectable({ providedIn: 'root' })
export class NormativaService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private utils = inject(UtilsStore);
  private idiomaService = inject(IdiomaService);
  private urlBasic = `${this.utils.urlApi()}/getbytitle('Normativas')/items`;

  getAll(idCenad: string): Observable<Normativa[]> {
    const endpoint = `${this.urlBasic}?$select=Id,nombre,descripcion,nombreArchivo&$filter=cenadId eq ${idCenad}`;
    return this.apiService.request<any>(endpoint, 'GET').pipe(
      map((res) => this.utilService.ensureArray<Normativa>(res)),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getNormativaSeleccionada(idNormativa: string): Observable<Normativa | null> {
    const urlNormativa = `${this.urlBasic}(${idNormativa})`;
    return this.apiService.getElemento(urlNormativa).pipe(
      map((c) => {
        if (!c) throw new Error('Normativa no encontrada');
        return c as Normativa;
      }),
      catchError((err) => {
        console.error('Error obteniendo Normativa seleccionada:', err);
        return of(null);
      })
    );
  }

  crearNormativa(
    nombre: string,
    descripcion: string,
    archivo: File,
    idCenad: string,
    nombreCenad: string
  ): Observable<any> {
    const endpoint = `Normativas`;
    let normativaId = '';
    return this.apiService
      .request<any>(endpoint, 'POST', {
        nombre: nombre.toUpperCase(),
        descripcion,
        cenadId: idCenad,
      })
      .pipe(
        switchMap((resCrear) => {
          const idNormativa = resCrear.Id;
          normativaId = idNormativa;
          if (!archivo) return of(true);
          const endpointUpload = `/${nombreCenad}/normativa`;
          return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
            switchMap((resArchivo) => {
              const archivo: string = resArchivo.d.Name;
              if (!archivo) return of(false);
              const endpointNormativa = 'Normativas';
              return this.apiService
                .request<any>(endpointNormativa, 'PATCH', {
                  Id: idNormativa,
                  nombreArchivo: archivo,
                })
                .pipe(
                  tap(async () => {
                    const mensaje = await this.idiomaService.tVars('normativas.normativaCreada', {
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
          this.deleteNormativa('', normativaId, nombreCenad, true).subscribe();
          return of(false);
        })
      );
  }
  editarNormativa(
    nombre: string,
    descripcion: string,
    archivoNormativa: File | null,
    archivoActual: string,
    nombreCenad: string,
    idNormativa: string
  ): Observable<any> {
    let nombreArchivo = archivoActual || '';
    const endpoint = 'Normativas';
    const body: Partial<Normativa> = {
      nombre: nombre.toUpperCase(),
      descripcion,
      Id: idNormativa,
    };
    const patchNormativa = (): Observable<string | null> => {
      if (nombreArchivo) body.nombreArchivo = nombreArchivo;
      return this.apiService.request<any>(endpoint, 'PATCH', body).pipe(
        map((res) => !!res),
        tap(async () => {
          const mensaje = await this.idiomaService.tVars('normativas.normativaModificada', {
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
    if (!archivoNormativa) return patchNormativa();
    const nombreBiblioteca = nombreCenad;
    const endpointUpload = `/${nombreBiblioteca}/normativa`;
    // Si existe un archivo previo, primero subimos el nuevo. Solo si la subida es correcta
    // intentaremos borrar el archivo antiguo. Si la subida falla, conservamos el archivo viejo
    // y no modificamos la entidad. Si el borrado del antiguo falla, mostramos un aviso pero
    // seguimos y actualizamos el nombreArchivo al nuevo valor.
    if (nombreArchivo) {
      return this.apiService.subirArchivo(endpointUpload, archivoNormativa).pipe(
        switchMap((resArchivo) => {
          const nuevoArchivoName = resArchivo?.d?.Name || resArchivo?.Name || '';
          if (!nuevoArchivoName) return of(null);
          // Intentar borrar el archivo antiguo (no crítico): si falla, avisar pero continuar
          const antiguo = nombreArchivo;
          nombreArchivo = nuevoArchivoName;
          return this.apiService
            .borrarArchivoSharePoint(nombreBiblioteca, `normativa/${antiguo}`)
            .pipe(
              switchMap((borradoOk: boolean) => {
                if (!borradoOk) {
                  // Mostrar advertencia y continuar con el nuevo archivo en la entidad
                  from(this.idiomaService.tVars('archivos.errorBorrarArchivo')).subscribe(
                    (mensaje) => {
                      this.utilService.toast(
                        mensaje ||
                          'No se pudo borrar el archivo anterior. Se conservará en el servidor.',
                        'warning'
                      );
                    }
                  );
                }
                return patchNormativa();
              }),
              catchError((err) => {
                console.warn(
                  'No se pudo borrar el archivo antiguo, pero la subida fue correcta:',
                  err
                );
                from(this.idiomaService.tVars('archivos.errorBorrarArchivo')).subscribe(
                  (mensaje) => {
                    this.utilService.toast(
                      mensaje ||
                        'No se pudo borrar el archivo anterior. Se conservará en el servidor.',
                      'warning'
                    );
                  }
                );
                return patchNormativa();
              })
            );
        }),
        catchError((err) => {
          console.error('Error subiendo el nuevo archivo:', err);
          // No borramos nada y conservamos el archivo y nombre antiguos
          this.utilService.toast(
            'Error subiendo el nuevo archivo. Se conserva la versión anterior.',
            'error'
          );
          return of(null);
        })
      );
    }
    // Caso no esperado (nunca debería ocurrir): aplicar patch como fallback
    console.warn('editarNormativa: no se detectó archivo previo; ejecutando fallback de patch.');
    return patchNormativa();
  }

  deleteNormativa(
    nombreArchivo: string,
    idNormativa: string,
    nombreCenad: string,
    evitarBorrado?: boolean
  ): Observable<any> {
    let evitarElBorrado = evitarBorrado ? evitarBorrado : false;
    const endpoint = 'Normativas';
    if (evitarElBorrado || !nombreArchivo) {
      console.log('Evitar borrado activado, borrara solo normativa, sin borrar archivo.');
      return this.apiService.request<any>(endpoint, 'DELETE', { Id: idNormativa }).pipe(
        tap(async (res) => {
          if (!evitarElBorrado) {
            const mensaje = await this.idiomaService.tVars('normativas.normativaEliminada', {
              nombreArchivo: idNormativa,
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
    return this.apiService.borrarArchivoSharePoint(nombreCenad, `normativa/${nombreArchivo}`).pipe(
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
        // Borrado OK -> borramos la normativa
        return this.apiService.request<any>(endpoint, 'DELETE', { Id: idNormativa }).pipe(
          tap(async (res) => {
            const mensaje = await this.idiomaService.tVars('normativas.normativaEliminada', {
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

  getArchivoNormativa(nombreArchivo: string, nombreCenad: string): Observable<void> {
    const endpoint = `/${nombreCenad}/normativa/${nombreArchivo}`;
    return this.apiService.descargarArchivo(endpoint, nombreArchivo);
  }
}
