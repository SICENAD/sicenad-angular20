import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Recurso } from "@interfaces/models/recurso";
import { UtilService } from "./utilService";
import { IdiomaService } from "./idiomaService";

@Injectable({ providedIn: 'root' })
export class RecursoService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);

  getAll(idCenad: string): Observable<Recurso[]> {
    const endpoint = `/cenads/${idCenad}/recursos?size=1000`;
    return this.apiService.request<{ _embedded: { recursos: Recurso[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.recursos.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getRecursosDeCategoria(idCategoria: string): Observable<Recurso[]> {
    const endpoint = `/categorias/${idCategoria}/recursos?size=1000`;
    return this.apiService.request<{ _embedded: { recursos: Recurso[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.recursos.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getRecursosDeSubcategorias(idCategoria: string): Observable<Recurso[]> {
    const endpoint = `/categorias/${idCategoria}/recursosDeSubcategorias?size=1000`;
    return this.apiService.request<{ _embedded: { recursos: Recurso[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.recursos.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getRecursosDeGestor(idGestor: string): Observable<Recurso[]> {
    const endpoint = `/usuarios_gestor/${idGestor}/recursos?size=1000`;
    return this.apiService.request<{ _embedded: { recursos: Recurso[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.recursos.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getRecursoSeleccionado(idRecurso: string): Observable<Recurso | null> {
    const endpoint = `/recursos/${idRecurso}`;
    return this.apiService.request<Recurso>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  getRecursoDeSolicitud(idSolicitud: string): Observable<Recurso | null> {
    const endpoint = `/solicitudes/${idSolicitud}/recurso`;
    return this.apiService.request<Recurso>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  crearRecurso(nombre: string, descripcion: string, otros: string, idTipoFormulario: string, idCategoria: string, idGestor: string): Observable<any> {
    const endpoint = `/recursos`;
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion: descripcion,
      otros: otros,
      tipoFormulario: `${this.apiService.getUrlApi()}/tipos_formulario/${idTipoFormulario}`,
      categoria: `${this.apiService.getUrlApi()}/categorias/${idCategoria}`,
      usuarioGestor: `${this.apiService.getUrlApi()}/usuarios_gestor/${idGestor}`
    };
    return this.apiService.request<any>(endpoint, 'POST', body).pipe(
      map(res => !!res),
      tap(async () => {
        const mensaje = await this.idiomaService.tVars('recursos.recursoCreado', { nombre });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarRecurso(nombre: string, descripcion: string, otros: string, idTipoFormulario: string, idCategoria: string, idGestor: string, idRecurso: string): Observable<any> {
    const endpoint = `/recursos/${idRecurso}`;
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion: descripcion,
      otros: otros,
      tipoFormulario: `${this.apiService.getUrlApi()}/tipos_formulario/${idTipoFormulario}`,
      categoria: `${this.apiService.getUrlApi()}/categorias/${idCategoria}`,
      usuarioGestor: `${this.apiService.getUrlApi()}/usuarios_gestor/${idGestor}`
    }
    return this.apiService.request<any>(endpoint, 'PATCH', body).pipe(
      map(res => !!res),
     tap(async () => {
        const mensaje = await this.idiomaService.tVars('recursos.recursoModificado', { nombre });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarRecursoDetalle(nombre: string, descripcion: string, otros: string, conDatosEspecificosSolicitud: boolean, datosEspecificosSolicitud: string, idRecurso: string): Observable<any> {
    const endpoint = `/recursos/${idRecurso}`;
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion: descripcion,
      otros: otros,
      conDatosEspecificosSolicitud: conDatosEspecificosSolicitud,
      datosEspecificosSolicitud: datosEspecificosSolicitud
    }
    return this.apiService.request<any>(endpoint, 'PATCH', body).pipe(
      map(res => !!res),
       tap(async () => {
        const mensaje = await this.idiomaService.tVars('recursos.recursoModificado', { nombre });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  deleteRecurso(idRecurso: string): Observable<any> {
    const endpoint = `/recursos/${idRecurso}`;
    return this.apiService.request<any>(endpoint, 'DELETE').pipe(
           tap(async res => {
        let recurso = res;
        const mensaje = await this.idiomaService.tVars('recursos.recursoEliminado', { nombre: recurso?.nombre });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

}
