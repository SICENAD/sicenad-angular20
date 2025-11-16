import { inject, Injectable } from '@angular/core';
import { catchError, concatMap, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { ApiService } from './apiService';
import { UtilService } from './utilService';
import { FicheroRecurso } from '@interfaces/models/ficheroRecurso';
import { FicheroSolicitud } from '@interfaces/models/ficheroSolicitud';
import { Fichero } from '@interfaces/models/fichero';
import { IdiomaService } from './idiomaService';
import { UtilsStore } from '@stores/utils.store';

@Injectable({ providedIn: 'root' })
export class FicheroService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private utils = inject(UtilsStore);
  private idiomaService = inject(IdiomaService);
  private urlBasic = `${this.utils.urlApi()}/getbytitle('Ficheros')/items`;

  getAllFicheros(
    idRecurso: string | null,
    idSolicitud: string | null,
    isCenad: boolean | null
  ): Observable<Fichero[]> {
    const endpoint = idRecurso
      ? `${this.urlBasic}?$select=Id,nombre,descripcion,nombreArchivo,categoriaFicheroId&$filter=recursoId eq ${idRecurso}`
      : isCenad
      ? `${this.urlBasic}?$select=Id,nombre,descripcion,nombreArchivo,categoriaFicheroId&$filter=solicitudRecursoCenadId eq ${idSolicitud}`
      : `${this.urlBasic}?$select=Id,nombre,descripcion,nombreArchivo,categoriaFicheroId&$filter=solicitudRecursoUnidadId eq ${idSolicitud}`;
    return this.apiService.request<any>(endpoint, 'GET').pipe(
      map((res) => this.utilService.ensureArray<Fichero>(res)),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getFicheroSeleccionado(idFichero: string): Observable<Fichero | null> {
    const urlFichero = `${this.urlBasic}(${idFichero})`;
    return this.apiService.getElemento(urlFichero).pipe(
      map((c) => {
        if (!c) throw new Error('Fichero no encontrado');
        return c as Fichero;
      }),
      catchError((err) => {
        console.error('Error obteniendo Fichero seleccionado:', err);
        return of(null);
      })
    );
  }

  crearFichero(
    nombre: string,
    descripcion: string,
    archivo: File | null,
    idCategoriaFichero: string,
    nombreCenad: string,
    idRecurso: string | null,
    idSolicitud: string | null,
    isCenad: boolean | null
  ): Observable<any> {
    const endpoint = 'Ficheros';
    let ficheroId = '';
    let endpointUpload = '';
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion,
      categoriaFicheroId: idCategoriaFichero,
    };
    if (idRecurso) {
      body.recursoId = idRecurso;
      endpointUpload = `/${nombreCenad}/recursos/${idRecurso}`;
    }
    if (idSolicitud) {
      if (isCenad) {
        endpointUpload = `/${nombreCenad}/solicitudes/${idSolicitud}/cenad`;
        body.solicitudRecursoCenadId = idSolicitud;
      } else {
        endpointUpload = `/${nombreCenad}/solicitudes/${idSolicitud}/unidad`;
        body.solicitudRecursoUnidadId = idSolicitud;
      }
    }
    return this.apiService.request<any>(endpoint, 'POST', body).pipe(
      switchMap((resCrear) => {
        const idFichero = resCrear.Id;
        ficheroId = idFichero;
        if (!archivo) return of(true);
        return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
          switchMap((resArchivo) => {
            const archivo: string = resArchivo.d.Name;
            if (!archivo) return of(false);
            return this.apiService
              .request<any>(endpoint, 'PATCH', { Id: idFichero, nombreArchivo: archivo })
              .pipe(
                tap(async () => {
                  const mensaje = await this.idiomaService.tVars('ficheros.ficheroCreado', {
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
        if (idRecurso) {
          this.deleteFichero('', ficheroId, nombreCenad, idRecurso, null, null, true).subscribe();
        }
        if (idSolicitud) {
          if (isCenad) {
            this.deleteFichero(
              '',
              ficheroId,
              nombreCenad,
              null,
              idSolicitud,
              true,
              true
            ).subscribe();
          } else {
            this.deleteFichero(
              '',
              ficheroId,
              nombreCenad,
              null,
              idSolicitud,
              false,
              true
            ).subscribe();
          }
        }
        return of(false);
      })
    );
  }

  editarFichero(
    nombre: string,
    descripcion: string,
    archivo: File | null,
    nombreArchivoActual: string,
    nombreCenad: string,
    idRecurso: string | null,
    idSolicitud: string | null,
    idCategoriaFichero: string,
    idFichero: string,
    isCenad: boolean | null
  ): Observable<any> {
    let nombreArchivo = nombreArchivoActual || '';
    const endpoint = 'Normativas';
    let endpointUpload = '';
    let pathBorrar = '';
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion,
      categoriaFicheroId: idCategoriaFichero,
      Id: idFichero,
    };
    if (idRecurso) {
      endpointUpload = `/${nombreCenad}/recursos/${idRecurso}`;
      pathBorrar = `recursos/${idRecurso}/${nombreArchivo}`;
    }
    if (idSolicitud) {
      if (isCenad) {
        endpointUpload = `/${nombreCenad}/solicitudes/${idSolicitud}/cenad`;
        pathBorrar = `solicitudes/${idSolicitud}/cenad/${nombreArchivo}`;
      } else {
        endpointUpload = `/${nombreCenad}/solicitudes/${idSolicitud}/unidad`;
        pathBorrar = `solicitudes/${idSolicitud}/unidad/${nombreArchivo}`;
      }
    }
    const patchFichero = (): Observable<string | null> => {
      if (nombreArchivo) body.nombreArchivo = nombreArchivo;
      return this.apiService.request<any>(endpoint, 'PATCH', body).pipe(
        tap(async () => {
          const mensaje = await this.idiomaService.tVars('archivos.modificado', { nombre });
          this.utilService.toast(mensaje, 'success');
        }),
        map(() => nombreArchivo),
        catchError((err) => {
          console.error(err);
          return of(null);
        })
      );
    };
    if (!archivo) return patchFichero();
    const nombreBiblioteca = nombreCenad;
    // Si existe un archivo previo, primero subimos el nuevo. Solo si la subida es correcta
    // intentaremos borrar el archivo antiguo. Si la subida falla, conservamos el archivo viejo
    // y no modificamos la entidad. Si el borrado del antiguo falla, mostramos un aviso pero
    // seguimos y actualizamos el nombreArchivo al nuevo valor.
    if (nombreArchivo) {
      return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
        switchMap((resArchivo) => {
          const nuevoArchivoName = resArchivo?.d?.Name || resArchivo?.Name || '';
          if (!nuevoArchivoName) return of(null);
          // Intentar borrar el archivo antiguo (no crítico): si falla, avisar pero continuar
          nombreArchivo = nuevoArchivoName;
          return this.apiService.borrarArchivoSharePoint(nombreBiblioteca, pathBorrar).pipe(
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
              return patchFichero();
            }),
            catchError((err) => {
              console.warn(
                'No se pudo borrar el archivo antiguo, pero la subida fue correcta:',
                err
              );
              from(this.idiomaService.tVars('archivos.errorBorrarArchivo')).subscribe((mensaje) => {
                this.utilService.toast(
                  mensaje || 'No se pudo borrar el archivo anterior. Se conservará en el servidor.',
                  'warning'
                );
              });
              return patchFichero();
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
    console.warn('editarFichero: no se detectó archivo previo; ejecutando fallback de patch.');
    return patchFichero();
  }

  deleteFichero(
    nombreArchivo: string,
    idFichero: string,
    nombreCenad: string,
    idRecurso: string | null,
    idSolicitud: string | null,
    isCenad: boolean | null,
    evitarBorrado?: boolean
  ): Observable<any> {
    let evitarElBorrado = evitarBorrado ? evitarBorrado : false;
    const endpoint = 'Ficheros';
    let pathBorrar = '';
    if (idRecurso) {
      pathBorrar = `recursos/${idRecurso}/${nombreArchivo}`;
    }
    if (idSolicitud) {
      if (isCenad) {
        pathBorrar = `solicitudes/${idSolicitud}/cenad/${nombreArchivo}`;
      } else {
        pathBorrar = `solicitudes/${idSolicitud}/unidad/${nombreArchivo}`;
      }
    }
    if (evitarElBorrado || !nombreArchivo) {
      console.log('Evitar borrado activado, borrara solo fichero, sin borrar archivo.');
      return this.apiService.request<any>(endpoint, 'DELETE', { Id: idFichero }).pipe(
        tap(async (res) => {
          if (!evitarElBorrado) {
            const mensaje = await this.idiomaService.tVars('ficheros.ficheroEliminado', {
              nombreArchivo: idFichero,
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
    return this.apiService.borrarArchivoSharePoint(nombreCenad, pathBorrar).pipe(
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
        // Borrado OK -> borramos el fichero
        return this.apiService.request<any>(endpoint, 'DELETE', { Id: idFichero }).pipe(
          tap(async (res) => {
            const mensaje = await this.idiomaService.tVars('ficheros.ficheroEliminado', {
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

  crearFicheroRecurso(
    nombre: string,
    descripcion: string,
    archivo: File | null,
    idCategoriaFichero: string,
    nombreCenad: string,
    idRecurso: string
  ): Observable<any> {
    return this.crearFichero(
      nombre,
      descripcion,
      archivo,
      idCategoriaFichero,
      nombreCenad,
      idRecurso,
      null,
      null
    );
  }

  crearFicheroSolicitudCenad(
    nombre: string,
    descripcion: string,
    archivo: File | null,
    idCategoriaFichero: string,
    nombreCenad: string,
    idSolicitud: string
  ): Observable<any> {
    return this.crearFichero(
      nombre,
      descripcion,
      archivo,
      idCategoriaFichero,
      nombreCenad,
      null,
      idSolicitud,
      true
    );
  }

  crearFicheroSolicitudUnidad(
    nombre: string,
    descripcion: string,
    archivo: File | null,
    idCategoriaFichero: string,
    nombreCenad: string,
    idSolicitud: string
  ): Observable<any> {
    return this.crearFichero(
      nombre,
      descripcion,
      archivo,
      idCategoriaFichero,
      nombreCenad,
      null,
      idSolicitud,
      false
    );
  }

  editarFicheroRecurso(
    nombre: string,
    descripcion: string,
    archivo: File | null,
    nombreArchivoActual: string,
    nombreCenad: string,
    idRecurso: string,
    idCategoriaFichero: string,
    idFichero: string
  ): Observable<any> {
    return this.editarFichero(
      nombre,
      descripcion,
      archivo,
      nombreArchivoActual,
      nombreCenad,
      idRecurso,
      null,
      idCategoriaFichero,
      idFichero,
      null
    );
  }

  editarFicheroSolicitud(
    nombre: string,
    descripcion: string,
    archivo: File | null,
    nombreArchivoActual: string,
    nombreCenad: string,
    idSolicitud: string,
    idCategoriaFichero: string,
    idFichero: string,
    isCenad: boolean
  ): Observable<any> {
    return this.editarFichero(
      nombre,
      descripcion,
      archivo,
      nombreArchivoActual,
      nombreCenad,
      null,
      idSolicitud,
      idCategoriaFichero,
      idFichero,
      isCenad
    );
  }

  deleteFicheroRecurso(
    nombreArchivo: string,
    idFichero: string,
    nombreCenad: string,
    idRecurso: string
  ): Observable<any> {
    return this.deleteFichero(nombreArchivo, idFichero, nombreCenad, idRecurso, null, null);
  }

  deleteFicheroSolicitud(
    nombreArchivo: string,
    idFichero: string,
    nombreCenad: string,
    idSolicitud: string,
    isCenad: boolean
  ): Observable<any> {
    return this.deleteFichero(nombreArchivo, idFichero, nombreCenad, null, idSolicitud, isCenad);
  }

  getArchivo(
    nombreArchivo: string,
    nombreCenad: string,
    idRecurso: string | null,
    idSolicitud: string | null,
    isCenad: boolean | null
  ): Observable<void> {
    let endpoint = '';
    if (idRecurso) {
      endpoint = `/${nombreCenad}/recursos/${idRecurso}/${nombreArchivo}`;
    }
    if (idSolicitud) {
      if (isCenad) {
        endpoint = `/${nombreCenad}/solicitudes/${idSolicitud}/cenad/${nombreArchivo}`;
      } else {
        endpoint = `/${nombreCenad}/solicitudes/${idSolicitud}/unidad/${nombreArchivo}`;
      }
    }
    return this.apiService.descargarArchivo(endpoint, nombreArchivo);
  }

  getArchivoRecurso(
    nombreArchivo: string,
    nombreCenad: string,
    idRecurso: string
  ): Observable<void> {
    return this.getArchivo(nombreArchivo, nombreCenad, idRecurso, null, null);
  }

  getArchivoSolicitud(
    nombreArchivo: string,
    nombreCenad: string,
    idSolicitud: string,
    isCenad: boolean
  ): Observable<void> {
    return this.getArchivo(nombreArchivo, nombreCenad, null, idSolicitud, isCenad);
  }

  getImagen(
    nombreArchivo: string,
    nombreCenad: string,
    idRecurso: string | null,
    idSolicitud: string | null,
    isCenad: boolean | null
  ): Observable<Blob> {
    let endpoint = '';
    if (idRecurso) {
      endpoint = `/${nombreCenad}/recursos/${idRecurso}/${nombreArchivo}`;
    }
    if (idSolicitud) {
      if (isCenad) {
        endpoint = `/${nombreCenad}/solicitudes/${idSolicitud}/cenad/${nombreArchivo}`;
      } else {
        endpoint = `/${nombreCenad}/solicitudes/${idSolicitud}/unidad/${nombreArchivo}`;
      }
    }
    return this.apiService.mostrarArchivo(endpoint);
  }

  getImagenRecurso(
    nombreArchivo: string,
    nombreCenad: string,
    idRecurso: string
  ): Observable<Blob> {
    return this.getImagen(nombreArchivo, nombreCenad, idRecurso, null, null);
  }

  getImagenSolicitud(
    nombreArchivo: string,
    nombreCenad: string,
    idSolicitud: string,
    isCenad: boolean
  ): Observable<Blob> {
    return this.getImagen(nombreArchivo, nombreCenad, null, idSolicitud, isCenad);
  }
}
