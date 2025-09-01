import { inject, Injectable } from "@angular/core";
import { catchError, concatMap, map, Observable, of, switchMap, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Cenad } from "@interfaces/models/cenad";
import { UtilService } from "./utilService";
import { CargaInicialStore } from "@stores/cargaInicial.store";

@Injectable({ providedIn: 'root' })
export class CenadService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private cargaInicial = inject(CargaInicialStore);

  private cenads: Cenad[] = [];
  private cenad: Cenad | null = null;

  getCenads(): Cenad[] {
    return this.cenads;
  }
  getCenad(): Cenad | null {
    return this.cenad;
  }

  getAllCenads(): Observable<boolean> {
    const url = `${this.apiService.getUrlApi()}/cenads?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { cenads: Cenad[] } }>(url, 'GET').pipe(
      tap(res => {
        this.cenads = res._embedded?.cenads.map((c: any): Cenad => ({ ...c, url: c._links?.self?.href })) || [];
      }),
      map(() => true),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  getCenadsSinAdmin(): Observable<Cenad[] | null> {
    const url = `${this.apiService.getUrlApi()}/cenads/sinAdmin?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { cenads: Cenad[] } }>(url, 'GET').pipe(
      map(res => {
        this.cenads = res._embedded?.cenads.map((c: any): Cenad => ({...c, url: c._links?.self?.href})) || [];
        return this.cenads;
      }),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  getCenadSeleccionado(idCenad: string): Observable<Cenad | null> {
    const url = `${this.apiService.getUrlApi()}/cenads/${idCenad}`;
    return this.apiService.peticionConToken<any>(url, 'GET').pipe(
      map((c: any): Cenad => ({ ...c, url: c._links?.self?.href })),
      tap(res => this.cenad = res),
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
  ): Observable<boolean> {
    const url = `${this.apiService.getUrlApi()}/cenads`;
    const body = {
      nombre: nombre.toUpperCase(),
      provincia,
      direccion: this.utilService.toTitleCase(direccion),
      tfno,
      email,
      descripcion
    };
    return this.apiService.peticionConToken<any>(url, 'POST', body).pipe(
      switchMap(resCrear => {
        const idCenad = resCrear.idString;
        if (!archivoEscudo) return of(true);
        const urlUpload = `${this.apiService.getUrlApi()}/files/${idCenad}/subirEscudo`;
        return this.apiService.subirArchivo(urlUpload, archivoEscudo).pipe(
          switchMap((escudo: string) => {
            if (!escudo) return of(false);
            const urlCenad = `${url}/${idCenad}`;
            return this.apiService.peticionConToken<any>(urlCenad, 'PATCH', { escudo }).pipe(
              tap(() => {
                this.utilService.toast(`Se ha creado el CENAD/CMT ${nombre}`, 'success');
                this.cargaInicial.getDatosIniciales();
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
    archivoEscudo: File,
    escudoActual: string,
    idCenad: string
  ): Observable<string | null> {
    let escudo = escudoActual || '';
    const urlCenad = `${this.apiService.getUrlApi()}/cenads/${idCenad}`;
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
      return this.apiService.peticionConToken<any>(urlCenad, 'PATCH', body).pipe(
        tap(() => {
          this.utilService.toast(`Se ha editado el CENAD/CMT ${nombre}`, 'success');
          this.cargaInicial.getDatosIniciales();
        }),
        map(() => escudo),
        catchError(err => { console.error(err); return of(null); })
      );
    };
    if (!archivoEscudo) return patchCenad();
    const urlUpload = `${this.apiService.getUrlApi()}/files/${idCenad}/subirEscudo`;
    return this.apiService.subirArchivo(urlUpload, archivoEscudo).pipe(
      concatMap(nuevoEscudo => {
        if (!nuevoEscudo) return of(null);
        if (escudo) {
          const urlBorrar = `${this.apiService.getUrlApi()}/files/${idCenad}/borrarEscudo/${escudo}`;
          return this.apiService.borrarArchivo(urlBorrar).pipe(
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

  deleteCenad(idCenad: string): Observable<boolean> {
    const urlCenad = `${this.apiService.getUrlApi()}/cenads/${idCenad}`;
    const urlCarpeta = `${this.apiService.getUrlApi()}/files/${idCenad}/borrarCarpetaCenad`;
    return this.apiService.borrarCarpeta(urlCarpeta).pipe(
      switchMap(() => this.apiService.peticionConToken<any>(urlCenad, 'DELETE')),
      tap(res => {
        this.cenad = res;
        this.utilService.toast(`Se ha eliminado el CENAD/CMT`, 'success');
        this.cargaInicial.getDatosIniciales();
      }),
      map(() => true),
      catchError(err => { console.error(err); return of(false); })
    );
  }

  getEscudo(escudo: string, idCenad: string): Observable<Blob> {
    const url = `${this.apiService.getUrlApi()}/files/${idCenad}/escudo/${escudo}`;
    return this.apiService.mostrarArchivo(url);
  }

  editarInfoCenad(
    direccion: string,
    tfno: string,
    email: string,
    descripcion: string,
    archivoInfoCenad: File,
    infoCenadActual: string,
    idCenad: string
  ): Observable<string | null> {
    let infocenad = infoCenadActual;
    const urlCenad = `${this.apiService.getUrlApi()}/cenads/${idCenad}`;
    const patchInfo = (): Observable<string | null> => {
      const body: any = {
        direccion: this.utilService.toTitleCase(direccion),
        tfno,
        email,
        descripcion,
      };
      if (infocenad) body.infoCenad = infocenad;

      return this.apiService.peticionConToken<any>(urlCenad, 'PATCH', body).pipe(
        tap(() => {
          this.utilService.toast(`Se ha editado la información del CENAD/CMT`, 'success');
          this.cargaInicial.getDatosIniciales();
        }),
        map(() => infocenad),
        catchError(err => {
          console.error(err);
          return of(null);
        })
      );
    };
    if (!archivoInfoCenad) return patchInfo();
    const urlUpload = `${this.apiService.getUrlApi()}/files/${idCenad}/subirInfoCenad`;
    return this.apiService.subirArchivo(urlUpload, archivoInfoCenad).pipe(
      switchMap(nuevaInfo => {
        if (!nuevaInfo) return of(null);
        if (infocenad) {
          const urlBorrar = `${this.apiService.getUrlApi()}/files/${idCenad}/borrarInfoCenad/${infocenad}`;
          this.apiService.borrarArchivo(urlBorrar).subscribe();
        }
        infocenad = nuevaInfo;
        return patchInfo();
      })
    );
  }
}
