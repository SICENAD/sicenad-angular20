import { inject, Injectable } from "@angular/core";
import { catchError, concatMap, from, map, Observable, of, switchMap, tap } from "rxjs";
import { ApiService } from "./apiService";
import { UtilService } from "./utilService";
import { FicheroRecurso } from "@interfaces/models/ficheroRecurso";
import { FicheroSolicitud } from "@interfaces/models/ficheroSolicitud";
import { Fichero } from "@interfaces/models/fichero";
import { IdiomaService } from "./idiomaService";
import { UtilsStore } from "@stores/utils.store";

@Injectable({ providedIn: 'root' })
export class FicheroService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private utils = inject(UtilsStore);
  private idiomaService = inject(IdiomaService);
  private urlBasic = `${this.utils.urlApi()}/getbytitle('Ficheros')/items`;

  getAllFicheros(idRecurso: string | null, idSolicitud: string | null, isCenad: boolean | null): Observable<Fichero[]> {
    const endpoint = idRecurso ? `${this.urlBasic}?$select=Id,nombre,descripcion,nombreArchivo,categoriaFicheroId&$filter=recursoId eq ${idRecurso}`
      : isCenad ? `${this.urlBasic}?$select=Id,nombre,descripcion,nombreArchivo,categoriaFicheroId&$filter=solicitudRecursoCenadId eq ${idSolicitud}`
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

  crearFichero(nombre: string, descripcion: string, archivo: File | null, idCategoriaFichero: string, nombreCenad: string, idRecurso: string | null, idSolicitud: string | null, isCenad: boolean | null): Observable<any> {
    const endpoint = 'Ficheros';
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
      endpointUpload = `/${nombreCenad}/solicitudes/${idSolicitud}`;
      if (isCenad) {
        body.solicitudRecursoCenadId = idSolicitud;
      } else {
        body.solicitudRecursoUnidadId = idSolicitud;
      }
    }
    return this.apiService
      .request<any>(endpoint, 'POST', body).pipe(
        switchMap((resCrear) => {
          const idFichero = resCrear.Id;
          console.log(idFichero);
          if (!archivo) return of(true);
          return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
            switchMap((resArchivo) => {
              const archivo: string = resArchivo.d.Name;
              console.log(archivo);
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
    idFichero: string
  ): Observable<any> {
    let nombreArchivo = nombreArchivoActual || '';
    const endpoint = 'Normativas';
    let endpointUpload = '';
    let pathBorrar = '';
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion,
      categoriaFicheroId: idCategoriaFichero,
      Id: idFichero
    };
    if (idRecurso) {
      endpointUpload = `/${nombreCenad}/recursos/${idRecurso}`;
      pathBorrar = `recursos/${idRecurso}/${nombreArchivo}`;
    }
    if (idSolicitud) {
      endpointUpload = `/${nombreCenad}/solicitudes/${idSolicitud}`;
      pathBorrar = `solicitudes/${idSolicitud}/${nombreArchivo}`;
    }
    const patchFichero = (): Observable<string | null> => {
      if (nombreArchivo) body.nombreArchivo = nombreArchivo;
      return this.apiService.request<any>(endpoint, 'PATCH', body).pipe(
        tap(async () => {
          const mensaje = await this.idiomaService.tVars('archivos.modificado', { nombre });
          this.utilService.toast(mensaje, 'success');
        }),
        map(() => nombreArchivo),
        catchError(err => { console.error(err); return of(null); })
      );
    };
    if (!archivo) return patchFichero();
    const nombreBiblioteca = nombreCenad;
    if (nombreArchivo) {
      return this.apiService.borrarArchivoSharePoint(nombreBiblioteca, pathBorrar).pipe(
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
          return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
            switchMap((resArchivo) => {
              const nuevoArchivoName = resArchivo?.d?.Name || resArchivo?.Name || '';
              if (!nuevoArchivoName) return of(null);
              nombreArchivo = nuevoArchivoName;
              return patchFichero();
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
    return this.apiService.subirArchivo(endpointUpload, archivo).pipe(
      switchMap((resArchivo) => {
        const nuevoArchivoName = resArchivo?.d?.Name || resArchivo?.Name || '';
        if (!nuevoArchivoName) return of(null);
        nombreArchivo = nuevoArchivoName;
        return patchFichero();
      }),
      catchError((err) => {
        console.error('Error subiendo el nuevo archivo (sin previo):', err);
        return of(null);
      })
    );
  }

  deleteFichero(nombreArchivo: string, idFichero: string, nombreCenad: string, idRecurso: string | null, idSolicitud: string | null): Observable<any> {
    const endpoint = 'Ficheros';
    let pathBorrar = '';
    if (idRecurso) {
      pathBorrar = `recursos/${idRecurso}/${nombreArchivo}`;
    }
    if (idSolicitud) {
      pathBorrar = `solicitudes/${idSolicitud}/${nombreArchivo}`;
    }
    return this.apiService.borrarArchivoSharePoint(nombreCenad, pathBorrar).pipe(
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

  crearFicheroRecurso(nombre: string, descripcion: string, archivo: File | null, idCategoriaFichero: string, nombreCenad: string, idRecurso: string): Observable<any> {
    return this.crearFichero(nombre, descripcion, archivo, idCategoriaFichero, nombreCenad, idRecurso, null, null);
  }

  crearFicheroSolicitudCenad(nombre: string, descripcion: string, archivo: File | null, idCategoriaFichero: string, nombreCenad: string, idSolicitud: string): Observable<any> {
    return this.crearFichero(nombre, descripcion, archivo, idCategoriaFichero, nombreCenad, null, idSolicitud, true);
  }

  crearFicheroSolicitudUnidad(nombre: string, descripcion: string, archivo: File | null, idCategoriaFichero: string, nombreCenad: string, idSolicitud: string): Observable<any> {
    return this.crearFichero(nombre, descripcion, archivo, idCategoriaFichero, nombreCenad, null, idSolicitud, false);
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
    return this.editarFichero(nombre, descripcion, archivo, nombreArchivoActual, nombreCenad, idRecurso, null, idCategoriaFichero, idFichero);
  }

  editarFicheroSolicitud(
    nombre: string,
    descripcion: string,
    archivo: File | null,
    nombreArchivoActual: string,
    nombreCenad: string,
    idSolicitud: string,
    idCategoriaFichero: string,
    idFichero: string
  ): Observable<any> {
    return this.editarFichero(nombre, descripcion, archivo, nombreArchivoActual, nombreCenad, null, idSolicitud, idCategoriaFichero, idFichero);
  }

  deleteFicheroRecurso(nombreArchivo: string, idFichero: string, nombreCenad: string, idRecurso: string): Observable<any> {
    return this.deleteFichero(nombreArchivo, idFichero, nombreCenad, idRecurso, null);
  }

  deleteFicheroSolicitud(nombreArchivo: string, idFichero: string, nombreCenad: string, idSolicitud: string): Observable<any> {
    return this.deleteFichero(nombreArchivo, idFichero, nombreCenad, null, idSolicitud);
  }

  getArchivo(nombreArchivo: string, nombreCenad: string, idRecurso: string | null, idSolicitud: string | null): Observable<void> {
    let endpoint = '';
    if (idRecurso) {
      endpoint = `/${nombreCenad}/recursos/${idRecurso}/${nombreArchivo}`;
    }
    if (idSolicitud) {
      endpoint = `/${nombreCenad}/solicitudes/${idSolicitud}/${nombreArchivo}`;
    }
    return this.apiService.descargarArchivo(endpoint, nombreArchivo);
  }

  getArchivoRecurso(nombreArchivo: string, nombreCenad: string, idRecurso: string): Observable<void> {
    return this.getArchivo(nombreArchivo, nombreCenad, idRecurso, null);
  }

  getArchivoSolicitud(nombreArchivo: string, nombreCenad: string, idSolicitud: string): Observable<void> {
    return this.getArchivo(nombreArchivo, nombreCenad, null, idSolicitud);
  }

  getImagen(nombreArchivo: string, nombreCenad: string, idRecurso: string | null, idSolicitud: string | null): Observable<Blob> {
    let endpoint = '';
    if (idRecurso) {
      endpoint = `/${nombreCenad}/recursos/${idRecurso}/${nombreArchivo}`;
    }
    if (idSolicitud) {
      endpoint = `/${nombreCenad}/solicitudes/${idSolicitud}/${nombreArchivo}`;
    }
    return this.apiService.mostrarArchivo(endpoint);
  }

  getImagenRecurso(nombreArchivo: string, nombreCenad: string, idRecurso: string): Observable<Blob> {
    return this.getImagen(nombreArchivo, nombreCenad, idRecurso, null);
  }

  getImagenSolicitud(nombreArchivo: string, nombreCenad: string, idSolicitud: string): Observable<Blob> {
    return this.getImagen(nombreArchivo, nombreCenad, null, idSolicitud);
  }
}
