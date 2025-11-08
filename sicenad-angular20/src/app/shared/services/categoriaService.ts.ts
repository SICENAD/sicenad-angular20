import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError, switchMap } from 'rxjs';
import { ApiService } from './apiService';
import { Categoria } from '@interfaces/models/categoria';
import { UtilService } from './utilService';
import { IdiomaService } from './idiomaService';
import { UtilsStore } from '@stores/utils.store';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private utils = inject(UtilsStore);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private urlBasic = `${this.utils.urlApi()}/getbytitle('Categorias')/items`;

  getAll(idCenad: string): Observable<Categoria[]> {
    const urlCategorias = `${this.urlBasic}?$select=Id,nombre,descripcion&$filter=cenadId eq ${idCenad}`;
    return this.apiService.request<any>(urlCategorias, 'GET').pipe(
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getAllCategoriasPadre(idCenad: string): Observable<Categoria[]> {
    // Devolvemos únicamente las categorías que pertenecen al CENAD y no tienen categoría padre
    // (campo lookup almacenado como categoriaPadreId en SharePoint/Api)
    const urlCategorias = `${this.urlBasic}?$select=Id,nombre,descripcion&$filter=cenadId eq ${idCenad} and categoriaPadreId eq null`;
    return this.apiService.request<any>(urlCategorias, 'GET').pipe(
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getSubCategorias(idCategoria: string): Observable<Categoria[]> {
    const urlCategorias = `${this.urlBasic}?$select=Id,nombre,descripcion&$filter=categoriaPadreId eq ${idCategoria}`;
    return this.apiService.request<any>(urlCategorias, 'GET').pipe(
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getSubCategoriasAnidadas(idCategoria: string): Observable<Categoria[]> {
    const endpoint = `/categorias/${idCategoria}/subcategoriasAnidadas?size=1000`;
    return this.apiService
      .request<{ _embedded: { categorias: Categoria[] } }>(endpoint, 'GET')
      .pipe(
        map(
          (res) =>
            res._embedded?.categorias.map((item) => ({
              ...item,
              url: (item as any)._links?.self?.href,
            })) || []
        ),
        catchError((err) => {
          console.error(err);
          return of([]);
        })
      );
  }

  getCategoriaSeleccionada(idCategoria: string): Observable<Categoria> {
    const urlCategoria = `${this.urlBasic}(${idCategoria})`;
    return this.apiService.request<any>(urlCategoria, 'GET').pipe(
      map((res) => {
        const cenad = res;
        if (!cenad) throw new Error('Categoría no encontrada');
        return cenad;
      }),
      catchError((err) => {
        console.error('❌ Error:', err);
        return throwError(() => err);
      })
    );
  }

  getCategoriaPadre(idCategoria: string): Observable<Categoria | null> {
    // Primero obtenemos la categoría solicitada y, si tiene referencia a categoriaPadreId,
    // obtenemos y devolvemos la categoría padre. Si no existe, devolvemos null.
    return this.getCategoriaSeleccionada(idCategoria).pipe(
      switchMap((cat) => {
        const parentId = (cat as any)?.categoriaPadreId || (cat as any)?.categoriaPadre?.Id;
        if (!parentId) return of(null);
        return this.getCategoriaSeleccionada(parentId).pipe(
          catchError((err) => {
            console.error('Error obteniendo categoría padre:', err);
            return of(null);
          })
        );
      }),
      catchError((err) => {
        console.error('Error obteniendo categoría:', err);
        return of(null);
      })
    );
  }

  getCategoriaDeRecurso(idRecurso: string): Observable<Categoria | null> {
    const endpoint = `/recursos/${idRecurso}/categoria`;
    return this.apiService.request<Categoria>(endpoint, 'GET').pipe(
      map((res) => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  crearCategoria(
    nombre: string,
    descripcion: string,
    idCenad: string,
    idCategoriaPadre: string
  ): Observable<any> {
    const endpoint = 'Categorias';
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion: descripcion,
      cenadId: idCenad,
    };
    idCategoriaPadre != '' && (body.categoriaPadreId = idCategoriaPadre);
    return this.apiService.request<any>(endpoint, 'POST', body).pipe(
      map((res) => !!res),
      tap(async () => {
        const mensaje = await this.idiomaService.tVars('categorias.categoriaCreada', { nombre });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarCategoria(
    nombre: string,
    descripcion: string,
    idCategoria: string,
    idCategoriaPadre: string
  ): Observable<any> {
    const endpoint = 'Categorias';
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion: descripcion,
      Id: idCategoria,
    };
    idCategoriaPadre != '' && (body.categoriaPadreId = idCategoriaPadre);
    return this.apiService.request<any>(endpoint, 'PATCH', body).pipe(
      map((res) => !!res),
      tap(async () => {
        const mensaje = await this.idiomaService.tVars('categorias.categoriaModificada', { nombre: body.nombre });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }

  deleteCategoria(idCategoria: string): Observable<any> {
    const endpoint = 'Categorias';
    return this.apiService.request<any>(endpoint, 'DELETE', { Id: idCategoria }).pipe(
      tap(async res => {
        const mensaje = await this.idiomaService.tVars('categorias.categoriaEliminada', { id: idCategoria });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
}
