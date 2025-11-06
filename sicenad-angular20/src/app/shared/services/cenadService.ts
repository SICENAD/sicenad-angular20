import { inject, Injectable } from '@angular/core';
import { catchError, concatMap, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { ApiService } from './apiService';
import { Cenad } from '@interfaces/models/cenad';
import { UtilService } from './utilService';
import { IdiomaService } from './idiomaService';
import { UtilsStore } from '@stores/utils.store';

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
      map((res) => res?.map((item) => ({ ...item, url: (item as any)._links?.self?.href })) || []),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getCenadsSinAdmin(): Observable<Cenad[] | null> {
    const endpoint = `${this.urlBasic}?$expand=usuarioAdministrador&$filter=usuarioAdministradorId eq ''`;
    return this.apiService.request<Cenad[]>(endpoint, 'GET').pipe(
      map((res) => res?.map((item) => ({ ...item, url: (item as any)._links?.self?.href })) || []),
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
  /*
//metodo para crear cenad en sharepoint creando la biblioteca de ese cenad
crearCenad(entidad: any): Observable<any> {
  return this.crearElemento('Cenads', entidad).pipe(
    switchMap(res => {
      // Crear biblioteca usando exactamente cenad.nombre
      return this.crearBibliotecaCenad(entidad.nombre).pipe(
        map(() => res) // devolver la respuesta original de crearElemento
      );
    })
  );
}
*/

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
          const endpointUpload = `/${nombre.toUpperCase()}/escudo`;
          return this.apiService.subirArchivo(endpointUpload, archivoEscudo).pipe(
            switchMap((resEscudo) => {
              const escudo: string = resEscudo.d.Name;
              console.log(escudo);
              if (!escudo) return of(false);
              const endpointCenad = 'Cenads';
              return this.apiService.request<any>(endpointCenad, 'PATCH', { Id: idCenad, escudo }).pipe(
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
    const endpointCenad = `/cenads/${idCenad}`;
    const body: Partial<Cenad> = {
      nombre: nombre.toUpperCase(),
      provincia,
      direccion: this.utilService.toTitleCase(direccion),
      tfno,
      email,
      descripcion,
    };
    const patchCenad = (): Observable<string | null> => {
      if (escudo) body.escudo = escudo;
      return this.apiService.request<any>(endpointCenad, 'PATCH', body).pipe(
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
    const endpointUpload = `/files/${idCenad}/subirEscudo`;
    return this.apiService.subirArchivo(endpointUpload, archivoEscudo).pipe(
      concatMap((nuevoEscudo) => {
        if (!nuevoEscudo) return of(null);
        if (escudo) {
          const endpointBorrar = `/files/${idCenad}/borrarEscudo/${escudo}`;
          return this.apiService.borrarArchivo(endpointBorrar).pipe(
            map(() => {
              escudo = nuevoEscudo;
              return null;
            }),
            switchMap(() => patchCenad())
          );
        } else {
          escudo = nuevoEscudo;
          return patchCenad();
        }
      })
    );
  }

  deleteCenad(idCenad: string): Observable<any> {
    //const endpointCarpeta = `/files/${idCenad}/borrarCarpetaCenad`;
    const endpoint = 'Cenads';
    return this.apiService.request<any>(endpoint, 'DELETE', { Id: idCenad }).pipe(
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

    /*
//cuando borre un cenad querre borrar la biblioteca de documentos asociada a ese cenad
this.apiService.borrarBiblioteca(cenad.nombre)
  .subscribe(ok => {
    if (ok) console.log('Biblioteca borrada correctamente');
  });

    */
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
    const endpointCenad = `/cenads/${idCenad}`;
    const body: Partial<Cenad> = {
      direccion: this.utilService.toTitleCase(direccion),
      tfno,
      email,
      descripcion,
    };
    const patchInfoCenad = (): Observable<string | null> => {
      if (infoCenad) body.infoCenad = infoCenad;
      return this.apiService.request<any>(endpointCenad, 'PATCH', body).pipe(
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
