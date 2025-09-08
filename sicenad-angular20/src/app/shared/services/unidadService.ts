import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Unidad } from "@interfaces/models/unidad";
import { UtilService } from "./utilService";

@Injectable({ providedIn: 'root' })
export class UnidadService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private unidades: Unidad[] = [];
  private unidad: Unidad | null = null;

  getUnidades(): Unidad[] {
    return this.unidades;
  }
  getUnidad(): Unidad | null {
    return this.unidad;
  }

  getAll(): Observable<Unidad[]> {
    const endpoint = `/unidades?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { unidades: Unidad[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.unidades.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getUnidadDeUsuarioNormal(idUsuarioNormal: string): Observable<Unidad | null> {
    const endpoint = `/usuarios_normal/${idUsuarioNormal}/unidad`;
    return this.apiService.peticionConToken<Unidad>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  crearUnidad(nombre: string, descripcion: string, email: string, tfno: string, direccion: string, poc: string): Observable<any> {
    const endpoint = `/unidades`;
    return this.apiService.peticionConToken<any>(endpoint, 'POST', { nombre: nombre.toUpperCase(), descripcion, email, tfno, direccion, poc }).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha creado la unidad ${nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarUnidad(nombre: string, descripcion: string, email: string, tfno: string, direccion: string, poc: string, idUnidad: string): Observable<any> {
    const endpoint = `/unidades/${idUnidad}`;
    return this.apiService.peticionConToken<any>(endpoint, 'PATCH', { nombre: nombre.toUpperCase(), descripcion, email: email.toLowerCase(), tfno, direccion, poc: poc.toUpperCase() }).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha modificado la unidad ${nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
  deleteUnidad(idUnidad: string): Observable<any> {
    const endpoint = `/unidades/${idUnidad}`;
    return this.apiService.peticionConToken<any>(endpoint, 'DELETE').pipe(
      tap(res => {
        this.unidad = res;
        this.utilService.toast(`Se ha eliminado la unidad ${this.unidad?.nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

}
