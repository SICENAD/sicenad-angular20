import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { CategoriaFichero } from "@interfaces/models/categoriaFichero";
import { UtilService } from "./utilService";
import { IdiomaService } from "./idiomaService";

@Injectable({ providedIn: 'root' })
export class CategoriaFicheroService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);

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
      tap(async () => {
        const mensaje = await this.idiomaService.tVars('categoriasFichero.categoriaFicheroCreada', { nombre });
        this.utilService.toast(mensaje, 'success');
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
      tap(async () => {
        const mensaje = await this.idiomaService.tVars('categoriasFichero.categoriaFicheroModificada', { nombre });
        this.utilService.toast(mensaje, 'success');
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
      tap(async res => {
        const mensaje = await this.idiomaService.tVars('categoriasFichero.categoriaFicheroEliminada', { id: idCategoriaFichero });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
}
