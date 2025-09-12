import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { TipoFormulario } from "@interfaces/models/tipoFormulario";
import { UtilService } from "./utilService";

@Injectable({ providedIn: 'root' })
export class TipoFormularioService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);

  getAll(): Observable<TipoFormulario[]> {
    const endpoint = `/tipos_formulario?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { tipos_formulario: TipoFormulario[] } }>(endpoint, 'GET').pipe(
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
    return this.apiService.peticionConToken<TipoFormulario>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  crearTipoFormulario(nombre: string, descripcion: string): Observable<any> {
    const endpoint = `/tipos_formulario`;
    return this.apiService.peticionConToken<any>(endpoint, 'POST', { nombre: nombre.toUpperCase(), descripcion }).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha creado el tipo de formulario ${nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarTipoFormulario(nombre: string, descripcion: string, idTipoFormulario: string): Observable<any> {
    const endpoint = `/tipos_formulario/${idTipoFormulario}`;
    return this.apiService.peticionConToken<any>(endpoint, 'PATCH', { nombre: nombre.toUpperCase(), descripcion }).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha modificado el tipo de formulario ${nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
  deleteTipoFormulario(idTipoFormulario: string): Observable<any> {
    const endpoint = `/tipos_formulario/${idTipoFormulario}`;
    return this.apiService.peticionConToken<any>(endpoint, 'DELETE').pipe(
      tap(res => {
        let tipoFormulario = res;
        this.utilService.toast(`Se ha eliminado el tipo de formulario ${tipoFormulario?.nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
}
