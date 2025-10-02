import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { TipoFormulario } from "@interfaces/models/tipoFormulario";
import { UtilService } from "./utilService";
import { IdiomaService } from "./idiomaService";

@Injectable({ providedIn: 'root' })
export class TipoFormularioService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);

  getAll(): Observable<TipoFormulario[]> {
    const endpoint = `/tipos_formulario?size=1000`;
    return this.apiService.request<{ _embedded: { tipos_formulario: TipoFormulario[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.tipos_formulario.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getTipoFormularioDeRecurso(idRecurso: string): Observable<TipoFormulario | null> {
    const endpoint = `/recursos/${idRecurso}/tipoFormulario`;
    return this.apiService.request<TipoFormulario>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  crearTipoFormulario(nombre: string, descripcion: string): Observable<any> {
    const endpoint = `/tipos_formulario`;
    return this.apiService.request<any>(endpoint, 'POST', { nombre: nombre.toUpperCase(), descripcion }).pipe(
      map(res => !!res),
      tap(async () => {
        const mensaje = await this.idiomaService.tVars('tiposFormulario.tipoFormularioCreado', { nombre });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarTipoFormulario(nombre: string, descripcion: string, idTipoFormulario: string): Observable<any> {
    const endpoint = `/tipos_formulario/${idTipoFormulario}`;
    return this.apiService.request<any>(endpoint, 'PATCH', { nombre: nombre.toUpperCase(), descripcion }).pipe(
      map(res => !!res),
      tap(async () => {
        const mensaje = await this.idiomaService.tVars('tiposFormulario.tipoFormularioModificado', { nombre });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  deleteTipoFormulario(idTipoFormulario: string): Observable<any> {
    const endpoint = `/tipos_formulario/${idTipoFormulario}`;
    return this.apiService.request<any>(endpoint, 'DELETE').pipe(
      tap(async res => {
        const mensaje = await this.idiomaService.tVars('tiposFormulario.tipoFormularioEliminado', { id: idTipoFormulario });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
}
