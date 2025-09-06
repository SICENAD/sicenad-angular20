import { inject, Injectable } from "@angular/core";
import { catchError, concatMap, map, Observable, of, switchMap, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Cenad } from "@interfaces/models/cenad";
import { UtilService } from "./utilService";
import { Unidad } from "@interfaces/models/unidad";

@Injectable({ providedIn: 'root' })
export class CenadService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);

  private cenads: Cenad[] = [];
  private cenad: Cenad | null = null;

  getCenads(): Cenad[] {
    return this.cenads;
  }
  getCenad(): Cenad | null {
    return this.cenad;
  }

  getAll(): Observable<Cenad[]> {
    const endpoint = `/cenads?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { cenads: Cenad[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.cenads.map(c => ({ ...c, url: (c as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }





  getCenadsSinAdmin(): Observable<Cenad[] | null> {
    const endpoint = `/cenads/sinAdmin?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { cenads: Cenad[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.cenads.map((c: any): Cenad => ({ ...c, url: c._links?.self?.href })) || []
      ),
      catchError(err => { console.error(err); return of([]); })
    );
  }

  getCenadDeAdministrador(idUsuarioAdministrador: string): Observable<Cenad | null> {
    const endpoint = `/usuarios_administrador/${idUsuarioAdministrador}/cenad`;
    return this.apiService.peticionConToken<Cenad>(endpoint, 'GET').pipe(
      map(res => ({...res, url: (res as any)._links?.self?.href})),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  getCenadDeGestor(idUsuarioGestor: string): Observable<Cenad | null> {
    const endpoint = `/usuarios_gestor/${idUsuarioGestor}/cenad`;
    return this.apiService.peticionConToken<Cenad>(endpoint, 'GET').pipe(
      map(res => ({...res, url: (res as any)._links?.self?.href})),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  getUnidadDeUsuarioNormal(idUsuarioNormal: string): Observable<Unidad | null> {
    const endpoint = `/usuarios_normal/${idUsuarioNormal}/unidad`;
    return this.apiService.peticionConToken<Unidad>(endpoint, 'GET').pipe(
      map(res => ({...res, url: (res as any)._links?.self?.href})),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  getCenadSeleccionado(idCenad: string): Observable<Cenad | null> {
    const endpoint = `/cenads/${idCenad}`;
    return this.apiService.peticionConToken<Cenad>(endpoint, 'GET').pipe(
      map(res => ({...res, url: (res as any)._links?.self?.href})),
      catchError(err => { console.error(err); return of(null); })
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
    const endpoint = `/cenads`;
    const body = {
      nombre: nombre.toUpperCase(),
      provincia,
      direccion: this.utilService.toTitleCase(direccion),
      tfno,
      email,
      descripcion
    };
    return this.apiService.peticionConToken<any>(endpoint, 'POST', body).pipe(
      switchMap(resCrear => {
        const idCenad = resCrear.idString;
        if (!archivoEscudo) return of(true);
        const endpointUpload = `/files/${idCenad}/subirEscudo`;
        return this.apiService.subirArchivo(endpointUpload, archivoEscudo).pipe(
          switchMap((escudo: string) => {
            if (!escudo) return of(false);
            const endpointCenad = `${endpoint}/${idCenad}`;
            return this.apiService.peticionConToken<any>(endpointCenad, 'PATCH', { escudo }).pipe(
              tap(() => {
                this.utilService.toast(`Se ha creado el CENAD/CMT ${nombre}`, 'success');
              }),
              map(() => true)
            );
          })
        );
      }),
      catchError(err => { console.error(err); return of(false); })
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
      return this.apiService.peticionConToken<any>(endpointCenad, 'PATCH', body).pipe(
        tap(() => {
          this.utilService.toast(`Se ha editado el CENAD/CMT ${nombre}`, 'success');
        }),
        map(() => escudo),
        catchError(err => { console.error(err); return of(null); })
      );
    };
    if (!archivoEscudo) return patchCenad();
    const endpointUpload = `/files/${idCenad}/subirEscudo`;
    return this.apiService.subirArchivo(endpointUpload, archivoEscudo).pipe(
      concatMap(nuevoEscudo => {
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
    const endpointCenad = `/cenads/${idCenad}`;
    const endpointCarpeta = `/files/${idCenad}/borrarCarpetaCenad`;
    return this.apiService.borrarCarpeta(endpointCarpeta).pipe(
      switchMap(() => this.apiService.peticionConToken<any>(endpointCenad, 'DELETE')),
      tap(res => {
        this.cenad = res;
        this.utilService.toast(`Se ha eliminado el CENAD/CMT ${this.cenad?.nombre}`, 'success');
      }),
      map(() => true),
      catchError(err => { console.error(err); return of(false); })
    );
  }

  getEscudo(escudo: string, idCenad: string): Observable<Blob> {
    const endpoint = `/files/${idCenad}/escudo/${escudo}`;
    return this.apiService.mostrarArchivo(endpoint);
  }

  editarInfoCenad(
    direccion: string,
    tfno: string,
    email: string,
    descripcion: string,
    archivoInfoCenad: File,
    infoCenadActual: string,
    idCenad: string
  ): Observable<any> {
    let infocenad = infoCenadActual;
    const endpointCenad = `/cenads/${idCenad}`;
    const patchInfo = (): Observable<string | null> => {
      const body: any = {
        direccion: this.utilService.toTitleCase(direccion),
        tfno,
        email,
        descripcion,
      };
      if (infocenad) body.infoCenad = infocenad;

      return this.apiService.peticionConToken<any>(endpointCenad, 'PATCH', body).pipe(
        tap(() => {
          this.utilService.toast(`Se ha editado la información del CENAD/CMT`, 'success');
        }),
        map(() => infocenad),
        catchError(err => {
          console.error(err);
          return of(null);
        })
      );
    };
    if (!archivoInfoCenad) return patchInfo();
    const endpointUpload = `/files/${idCenad}/subirInfoCenad`;
    return this.apiService.subirArchivo(endpointUpload, archivoInfoCenad).pipe(
      switchMap(nuevaInfo => {
        if (!nuevaInfo) return of(null);
        if (infocenad) {
          const endpointBorrar = `/files/${idCenad}/borrarInfoCenad/${infocenad}`;
          this.apiService.borrarArchivo(endpointBorrar).subscribe();
        }
        infocenad = nuevaInfo;
        return patchInfo();
      })
    );
  }
}
