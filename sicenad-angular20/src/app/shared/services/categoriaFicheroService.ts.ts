import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { CategoriaFichero } from "@interfaces/models/categoriaFichero";
import { UtilService } from "./utilService";

@Injectable({ providedIn: 'root' })
export class CategoriaFicheroService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);

  getAll(): Observable<CategoriaFichero[]> {
    const endpoint = `/categorias_fichero?size=1000`;
    return this.apiService.request<{ _embedded: { categorias_fichero: CategoriaFichero[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.categorias_fichero.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getCategoriaFicheroDeFichero(idFichero: string): Observable<CategoriaFichero | null> {
    const endpoint = `/ficheros/${idFichero}/categoriaFichero`;
    return this.apiService.request<CategoriaFichero>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  crearCategoriaFichero(nombre: string, tipo: number, descripcion: string): Observable<any> {
    const endpoint = `/categorias_fichero`;
    return this.apiService.request<any>(endpoint, 'POST', { nombre: nombre.toUpperCase(), tipo, descripcion }).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha creado la categoría de fichero ${nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarCategoriaFichero(nombre: string, tipo: number, descripcion: string, idCategoriaFichero: string): Observable<any> {
    const endpoint = `/categorias_fichero/${idCategoriaFichero}`;
    return this.apiService.request<any>(endpoint, 'PATCH', { nombre: nombre.toUpperCase(), tipo, descripcion }).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha modificado la categoría de fichero ${nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
  
  deleteCategoriaFichero(idCategoriaFichero: string): Observable<any> {
    const endpoint = `/categorias_fichero/${idCategoriaFichero}`;
    return this.apiService.request<any>(endpoint, 'DELETE').pipe(
      tap(res => {
        let categoriaFichero = res;
        this.utilService.toast(`Se ha eliminado la categoría de fichero ${categoriaFichero?.nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
}
