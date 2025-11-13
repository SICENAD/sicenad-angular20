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
    return this.apiService.request<any>(endpoint, 'GET').pipe(
      map(res => this.utilService.ensureArray<CategoriaFichero>(res)),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getCategoriaFicheroDeFichero(idFichero: string): Observable<CategoriaFichero | null> {
    const filter = `$select=categoriaFichero/Id,categoriaFichero/nombre,categoriaFichero/descripcion,categoriaFichero/tipo_categoriaFichero&$expand=categoriaFichero&$filter=Id eq ${idFichero}`;
    const urlCategoriaFichero = `${this.utils.urlApi()}/getbytitle('Ficheros')/items?${filter}`;
    return this.apiService.request<any>(urlCategoriaFichero, 'GET').pipe(
      map((res) => {
        const categoriasFichero = this.utilService.ensureArray<any>(res);
        const categoriaFichero = categoriasFichero[0].categoriaFichero;
        if (!categoriaFichero) throw new Error('Categoria de fichero no encontrada');
        return categoriaFichero;
      }),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  crearCategoriaFichero(nombre: string, tipo_categoriaFichero: number, descripcion: string): Observable<any> {
    const endpoint = 'CategoriasFichero';
    return this.apiService
      .request<any>(endpoint, 'POST', { nombre: nombre.toUpperCase(), tipo_categoriaFichero, descripcion })
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

  editarCategoriaFichero(nombre: string, tipo_categoriaFichero: number, descripcion: string, idCategoriaFichero: string): Observable<any> {
    const endpoint = 'CategoriasFichero';
    return this.apiService
      .request<any>(endpoint, 'PATCH', {
        nombre: nombre.toUpperCase(),
        tipo_categoriaFichero,
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
