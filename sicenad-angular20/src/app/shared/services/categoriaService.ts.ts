import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Categoria } from "@interfaces/models/categoria";
import { UtilService } from "./utilService";

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);

  getAll(idCenad: string): Observable<Categoria[]> {
    const endpoint = `/cenads/${idCenad}/categorias?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { categorias: Categoria[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.categorias.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getAllCategoriasPadre(idCenad: string): Observable<Categoria[]> {
    const endpoint = `/cenads/${idCenad}/categoriasPadre?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { categorias: Categoria[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.categorias.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getSubCategorias(idCategoria: string): Observable<Categoria[]> {
    const endpoint = `/categorias/${idCategoria}/subcategorias?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { categorias: Categoria[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.categorias.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getSubCategoriasAnidadas(idCategoria: string): Observable<Categoria[]> {
    const endpoint = `/categorias/${idCategoria}/subcategoriasAnidadas?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { categorias: Categoria[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.categorias.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getCategoriaSeleccionada(idCategoria: string): Observable<Categoria | null> {
    const endpoint = `/categorias/${idCategoria}`;
    return this.apiService.peticionConToken<Categoria>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  getCategoriaPadre(idCategoria: string): Observable<Categoria | null> {
    const endpoint = `/categorias/${idCategoria}/categoriaPadre`;
    return this.apiService.peticionConToken<Categoria>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  getCategoriaDeRecurso(idRecurso: string): Observable<Categoria | null> {
    const endpoint = `/recursos/${idRecurso}/categoria`;
    return this.apiService.peticionConToken<Categoria>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  crearCategoria(nombre: string, descripcion: string, idCenad: string, idCategoriaPadre: string): Observable<any> {
    const endpoint = `/categorias`;
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion: descripcion,
      cenad: `${this.apiService.getUrlApi()}/cenads/${idCenad}`,
    }
    idCategoriaPadre != '' &&
      (body.categoriaPadre = `${this.apiService.getUrlApi()}/categorias/${idCategoriaPadre}`);
    return this.apiService.peticionConToken<any>(endpoint, 'POST', body).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha creado la categoría ${nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarCategoria(nombre: string, descripcion: string, idCategoria: string, idCategoriaPadre: string): Observable<any> {
    const endpoint = `/categorias/${idCategoria}`;
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion: descripcion
    }
      if (idCategoriaPadre != null && idCategoriaPadre != undefined && idCategoriaPadre != '') {
        (body.categoriaPadre = `${this.apiService.getUrlApi()}/categorias/${idCategoriaPadre}`)
      }
    return this.apiService.peticionConToken<any>(endpoint, 'PATCH', body).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha modificado la categoría ${nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
  deleteCategoria(idCategoria: string): Observable<any> {
    const endpoint = `/categorias/${idCategoria}`;
    return this.apiService.peticionConToken<any>(endpoint, 'DELETE').pipe(
      tap(res => {
        let categoria = res;
        this.utilService.toast(`Se ha eliminado la categoría ${categoria?.nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }







}
