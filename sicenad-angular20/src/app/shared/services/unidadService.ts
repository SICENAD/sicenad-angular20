import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Unidad } from "@interfaces/models/unidad";
import { UtilService } from "./utilService";
import { IdiomaService } from "./idiomaService";

@Injectable({ providedIn: 'root' })
export class UnidadService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);

  getAll(): Observable<Unidad[]> {
    const endpoint = `/unidades?size=1000`;
    return this.apiService.request<{ _embedded: { unidades: Unidad[] } }>(endpoint, 'GET').pipe(
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
    return this.apiService.request<Unidad>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  crearUnidad(nombre: string, descripcion: string, email: string, tfno: string, direccion: string, poc: string): Observable<any> {
    const endpoint = `/unidades`;
    return this.apiService.request<any>(endpoint, 'POST', { nombre: nombre.toUpperCase(), descripcion, email, tfno, direccion, poc }).pipe(
      map(res => !!res),
      tap(async res => {
        const mensaje = await this.idiomaService.tVars('unidades.unidadCreada', { nombre });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarUnidad(nombre: string, descripcion: string, email: string, tfno: string, direccion: string, poc: string, idUnidad: string): Observable<any> {
    const endpoint = `/unidades/${idUnidad}`;
    return this.apiService.request<any>(endpoint, 'PATCH', { nombre: nombre.toUpperCase(), descripcion, email: email.toLowerCase(), tfno, direccion, poc: poc.toUpperCase() }).pipe(
      map(res => !!res),
      tap(async res => {
        const mensaje = await this.idiomaService.tVars('unidades.unidadModificada', { nombre });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  deleteUnidad(idUnidad: string): Observable<any> {
    const endpoint = `/unidades/${idUnidad}`;
    return this.apiService.request<any>(endpoint, 'DELETE').pipe(
      tap(async res => {
        const mensaje = await this.idiomaService.tVars('unidades.unidadEliminada', { id: idUnidad });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

}
