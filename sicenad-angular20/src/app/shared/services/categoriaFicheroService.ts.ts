import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { CategoriaFichero } from "@interfaces/models/categoriaFichero";
import { UtilService } from "./utilService";
import { IdiomaService } from "./idiomaService";
import { UtilsStore } from "@stores/utils.store";

@Injectable({ providedIn: 'root' })
export class CategoriaFicheroService {
  private utils = inject(UtilsStore);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private urlBasic = `${this.utils.urlApi()}/getbytitle('CategoriasFichero')/items`;

  getAll(): Observable<CategoriaFichero[]> {
    const endpoint = this.urlBasic;
    return this.apiService.request<CategoriaFichero[]>(endpoint, 'GET').pipe(
      map((res) => res?.map((item) => ({ ...item, url: (item as any)._links?.self?.href })) || []),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getCategoriaFicheroDeFichero(idFichero: string): Observable<CategoriaFichero | null> {
    const urlCategoriasFichero = `${this.urlBasic}?$expand=fichero&$filter=ficheroId eq ${idFichero}`;
    return this.apiService.request<any>(urlCategoriasFichero, 'GET').pipe(
      map((res) => {
        const categoriasFichero = res?.d?.results || [];
        const categoriaFichero = categoriasFichero[0];
        if (!categoriaFichero) throw new Error('Categoria de fichero no encontrada');
        return categoriaFichero;
      }),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  crearCategoriaFichero(nombre: string, tipo: number, descripcion: string): Observable<any> {
    const endpoint = 'CategoriasFichero';
    return this.apiService
      .request<any>(endpoint, 'POST', { nombre: nombre.toUpperCase(), tipo, descripcion })
      .pipe(
        map((res) => !!res),
        tap(async () => {
          const mensaje = await this.idiomaService.tVars('categoriasFichero.categoriaFicheroCreada', {
            nombre,
          });
          this.utilService.toast(mensaje, 'success');
        }),
        catchError((err) => {
          console.error(err);
          return of(false);
        })
      );
  }

  editarCategoriaFichero(nombre: string, tipo: number, descripcion: string, idCategoriaFichero: string): Observable<any> {
    const endpoint = 'CategoriasFichero';
    return this.apiService
      .request<any>(endpoint, 'PATCH', {
        nombre: nombre.toUpperCase(),
        tipo,
        descripcion,
        Id: idCategoriaFichero,
      })
      .pipe(
        map((res) => !!res),
        tap(async () => {
          const mensaje = await this.idiomaService.tVars(
            'categoriasFichero.categoriaFicheroModificada',
            { nombre }
          );
          this.utilService.toast(mensaje, 'success');
        }),
        catchError((err) => {
          console.error(err);
          return of(false);
        })
      );
  }

  deleteCategoriaFichero(idCategoriaFichero: string): Observable<any> {
    const endpoint = 'CategoriasFichero';
    return this.apiService.request<any>(endpoint, 'DELETE', { Id: idCategoriaFichero }).pipe(
      tap(async (res) => {
        const mensaje = await this.idiomaService.tVars('categoriasFichero.categoriaFicheroEliminada', {
          id: idCategoriaFichero,
        });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }
}
