import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { CategoriaFichero } from "@interfaces/models/categoriaFichero";
import { UtilService } from "./utilService";

@Injectable({ providedIn: 'root' })
export class CategoriaFicheroService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);

  private categoriasFichero: CategoriaFichero[] = [];
  private categoriaFichero: CategoriaFichero | null = null;

  getCategoriasFichero(): CategoriaFichero[] {
    return this.categoriasFichero;
  }
  getCategoriaFichero(): CategoriaFichero | null {
    return this.categoriaFichero;
  }

  getAll(): Observable<CategoriaFichero[]> {
    const endpoint = `/categorias_fichero?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { categorias_fichero: CategoriaFichero[] } }>(endpoint, 'GET').pipe(
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
    return this.apiService.peticionConToken<CategoriaFichero>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  crearCategoriaFichero(nombre: string, tipo: number, descripcion: string): Observable<any> {
    const endpoint = `/categorias_fichero`;
    return this.apiService.peticionConToken<any>(endpoint, 'POST', { nombre: nombre.toUpperCase(), tipo, descripcion }).pipe(
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
    return this.apiService.peticionConToken<any>(endpoint, 'PATCH', { nombre: nombre.toUpperCase(), tipo, descripcion }).pipe(
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
    return this.apiService.peticionConToken<any>(endpoint, 'DELETE').pipe(
      tap(res => {
        this.categoriaFichero = res;
        this.utilService.toast(`Se ha eliminado la categoría de fichero ${this.categoriaFichero?.nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
}
