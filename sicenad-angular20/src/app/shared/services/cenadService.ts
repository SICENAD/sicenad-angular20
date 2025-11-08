import { inject, Injectable } from '@angular/core';
import { catchError, concatMap, map, Observable, of, switchMap, tap, throwError, from } from 'rxjs';
import { ApiService } from './apiService';
import { Cenad } from '@interfaces/models/cenad';
import { UtilService } from './utilService';
import { IdiomaService } from './idiomaService';
import { UtilsStore } from '@stores/utils.store';
import { __metadata } from 'tslib';

@Injectable({ providedIn: 'root' })
export class CenadService {
  private utils = inject(UtilsStore);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private urlBasic = `${this.utils.urlApi()}/getbytitle('Cenads')/items`;

  getAll(): Observable<Cenad[]> {
    const endpoint = this.urlBasic;
    return this.apiService.request<Cenad[]>(endpoint, 'GET').pipe(
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getCenadsSinAdmin(): Observable<Cenad[] | null> {
    const filter = `$select=Id,nombre, descripcion, direccion, tfno, email, escudo, infoCenad, provincia&$filter=usuarioAdministradorId eq ''`;
    const endpoint = `${this.urlBasic}?${filter}`;
    return this.apiService.request<Cenad[]>(endpoint, 'GET').pipe(
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getCenadDeAdministrador(idUsuarioAdministrador: string): Observable<Cenad> {
    const urlCenads = `${this.urlBasic}?$expand=usuarioAdministrador&$filter=usuarioAdministradorId eq ${idUsuarioAdministrador}`;
    return this.apiService.request<any>(urlCenads, 'GET').pipe(
      map((res) => {
        const cenads = res?.d?.results || [];
        const cenad = cenads[0];
        if (!cenad) throw new Error('Cenad no encontrado');
        return cenad;
      }),
      catchError((err) => {
        console.error('❌ Error en login:', err);
        return throwError(() => err);
      })
    );
  }

  getCenadDeGestor(idUsuarioGestor: string): Observable<Cenad> {
    //lo hare en usuarioService
    const urlCenads = `${this.urlBasic}?$expand=usuarioAdministrador&$filter=usuarioAdministradorId eq '1'`;
    return this.apiService.request<any>(urlCenads, 'GET').pipe(
      map((res) => {
        const cenads = res?.d?.results || [];
        const cenad = cenads[0];
        if (!cenad) throw new Error('Cenad no encontrado');
        return cenad;
      }),
      catchError((err) => {
        console.error('❌ Error en login:', err);
        return throwError(() => err);
      })
    );
  }

  getCenadSeleccionado(idCenad: string): Observable<Cenad> {
    const urlCenads = `${this.urlBasic}(${idCenad})`;
    return this.apiService.request<any>(urlCenads, 'GET').pipe(
      map((res) => {
        const cenad = res;
        if (!cenad) throw new Error('Cenad no encontrado');
        return cenad;
      }),
      catchError((err) => {
        console.error('❌ Error en login:', err);
        return throwError(() => err);
      })
    );
  }

  crearCenad(
    nombre: string,
    provincia: number,
    direccion: string,
    tfno: string,
    email: string,
    descripcion: string,
    archivoEscudo: File
  ): Observable<any> {
    const endpoint = 'Cenads';
    return this.apiService
      .request<any>(endpoint, 'POST', {
        nombre: nombre.toUpperCase(),
        provincia,
        direccion: this.utilService.toTitleCase(direccion),
        tfno,
        email,
        descripcion,
      })
      .pipe(
        switchMap((resCrear) => {
          const idCenad = resCrear.Id;
          console.log(idCenad);
          if (!archivoEscudo) return of(true);
          // Crear la biblioteca de documentos asociada al CENAD antes de subir el escudo
          return this.apiService.crearBibliotecaDocumentos(nombre.toUpperCase()).pipe(
            switchMap(() => {
              const endpointUpload = `/${nombre.toUpperCase()}/escudo`;
              return this.apiService.subirArchivo(endpointUpload, archivoEscudo).pipe(
                switchMap((resEscudo) => {
                  const escudo: string = resEscudo.d.Name;
                  console.log(escudo);
                  if (!escudo) return of(false);
                  const endpointCenad = 'Cenads';
                  return this.apiService
                    .request<any>(endpointCenad, 'PATCH', { Id: idCenad, escudo })
                    .pipe(
                      tap(async () => {
                        const mensaje = await this.idiomaService.tVars('cenads.cenadCreado', {
                          nombre,
                        });
                        this.utilService.toast(mensaje, 'success');
                      }),
                      map(() => true)
                    );
                })
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

  editarCenad(
    nombre: string,
    provincia: number,
    direccion: string,
    tfno: string,
    email: string,
    descripcion: string,
    archivoEscudo: File | null,
    escudoActual: string,
    idCenad: string
  ): Observable<any> {
    let escudo = escudoActual || '';
    const endpoint = 'Cenads';
    const body: Partial<Cenad> = {
      nombre: nombre.toUpperCase(),
      provincia,
      direccion: this.utilService.toTitleCase(direccion),
      tfno,
      email,
      descripcion,
      Id: idCenad,
    };
    const patchCenad = (): Observable<string | null> => {
      if (escudo) body.escudo = escudo;
      return this.apiService
        .request<any>(endpoint, 'PATCH', body)
        .pipe(
          map((res) => !!res),
          tap(async () => {
            const mensaje = await this.idiomaService.tVars('cenads.cenadEditado', { nombre });
            this.utilService.toast(mensaje, 'success');
          }),
          map(() => escudo),
          catchError((err) => {
            console.error(err);
            return of(null);
          })
        );
    };
    if (!archivoEscudo) return patchCenad();
    const nombreBiblioteca = nombre.toUpperCase();
    const endpointUpload = `/${nombreBiblioteca}/escudo`;
    // Si existe un escudo previo, intentamos borrarlo PRIMERO. Si el borrado falla, abortamos y
    // mostramos un toast de error. Si no existe, subimos directamente.
    if (escudo) {
      return this.apiService.borrarArchivoSharePoint(nombreBiblioteca, `escudo/${escudo}`).pipe(
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
                this.utilService.toast('No se pudo borrar el escudo anterior. Operación abortada.', 'error');
                return of(null);
              })
            );
          }
          // Borrado OK -> subimos el nuevo escudo
          return this.apiService.subirArchivo(endpointUpload, archivoEscudo).pipe(
            switchMap((resEscudo) => {
              const nuevoEscudoName = resEscudo?.d?.Name || resEscudo?.Name || '';
              if (!nuevoEscudoName) return of(null);
              escudo = nuevoEscudoName;
              return patchCenad();
            }),
            catchError((err) => {
              console.error('Error subiendo el nuevo escudo:', err);
              return of(null);
            })
          );
        }),
        catchError((err) => {
          console.warn('Error borrando el escudo anterior:', err);
          return from(this.idiomaService.tVars('archivos.errorBorrarArchivo')).pipe(
            switchMap((mensaje) => {
              this.utilService.toast(
                mensaje || 'No se pudo borrar el escudo anterior. Operación abortada.',
                'error'
              );
              return of(null);
            }),
            catchError(() => {
              this.utilService.toast('No se pudo borrar el escudo anterior. Operación abortada.', 'error');
              return of(null);
            })
          );
        })
      );
    }
    // No había escudo previo: subimos y parchamos directamente
    return this.apiService.subirArchivo(endpointUpload, archivoEscudo).pipe(
      switchMap((resEscudo) => {
        const nuevoEscudoName = resEscudo?.d?.Name || resEscudo?.Name || '';
        if (!nuevoEscudoName) return of(null);
        escudo = nuevoEscudoName;
        return patchCenad();
      }),
      catchError((err) => {
        console.error('Error subiendo el nuevo escudo (sin previo):', err);
        return of(null);
      })
    );
  }

  deleteCenad(idCenad: string): Observable<any> {
    // Primero intentamos obtener el CENAD para conocer su nombre y borrar la biblioteca asociada
    return this.getCenadSeleccionado(idCenad).pipe(
      switchMap((cenad) => {
        const nombreBiblioteca = cenad!.nombre.toUpperCase();
        if (!nombreBiblioteca) {
          // Si no hay nombre, continuamos con el borrado del registro
          return this.apiService.request<any>('Cenads', 'DELETE', { Id: idCenad });
        }
        // Intentamos borrar la biblioteca; si falla (404/409 u otro), lo registramos y continuamos
        return this.apiService.borrarBibliotecaDocumentos(nombreBiblioteca).pipe(
          catchError((err) => {
            console.warn(
              'No se pudo borrar la biblioteca de documentos, se continúa con el borrado del CENAD:',
              err
            );
            return of(false);
          }),
          switchMap(() => this.apiService.request<any>('Cenads', 'DELETE', { Id: idCenad }))
        );
      }),
      tap(async (res) => {
        const mensaje = await this.idiomaService.tVars('cenads.cenadEliminado', {
          id: idCenad,
        });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }

  getEscudo(escudo: string, idCenad: string): Observable<Blob> {
    const endpoint = `/CENAD CHINCHILLA/escudo/${escudo}`;
    return this.apiService.mostrarArchivo(endpoint);
  }

  editarInfoCenad(
    direccion: string,
    tfno: string,
    email: string,
    descripcion: string,
    archivoInfoCenad: File | null,
    infoCenadActual: string,
    idCenad: string
  ): Observable<any> {
    let infoCenad = infoCenadActual || '';
    const endpoint = 'Cenads';
    const body: Partial<Cenad> = {
      direccion: this.utilService.toTitleCase(direccion),
      tfno,
      email,
      descripcion,
      Id: idCenad,
    };
    const patchInfoCenad = (): Observable<string | null> => {
      if (infoCenad) body.infoCenad = infoCenad;
      return this.apiService.request<any>(endpoint, 'PATCH', body).pipe(
        map((res) => !!res),
        tap(async () => {
          const mensaje = await this.idiomaService.tVars('cenads.infoCenadEditado');
          this.utilService.toast(mensaje, 'success');
        }),
        map(() => infoCenad),
        catchError((err) => {
          console.error(err);
          return of(null);
        })
      );
    };
    if (!archivoInfoCenad) return patchInfoCenad();
    const endpointUpload = `/files/${idCenad}/subirInfoCenad`;
    return this.apiService.subirArchivo(endpointUpload, archivoInfoCenad).pipe(
      concatMap((nuevaInfo) => {
        if (!nuevaInfo) return of(null);
        if (infoCenad) {
          const endpointBorrar = `/files/${idCenad}/borrarInfoCenad/${infoCenad}`;
          return this.apiService.borrarArchivo(endpointBorrar).pipe(
            map(() => {
              infoCenad = nuevaInfo;
              return null;
            }),
            switchMap(() => patchInfoCenad())
          );
        }
        infoCenad = nuevaInfo;
        return patchInfoCenad();
      })
    );
  }

  getInfoCenad(infoCenad: string, idCenad: string): Observable<Blob> {
    const endpoint = `/files/${idCenad}/infoCenad/${infoCenad}`;
    return this.apiService.mostrarArchivo(endpoint);
  }
}
