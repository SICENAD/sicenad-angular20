import { inject, Injectable } from '@angular/core';
import {
  catchError,
  map,
  Observable,
  of,
  tap,
  throwError,
  switchMap,
  from,
  firstValueFrom,
} from 'rxjs';
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
      map((res) => this.utilService.ensureArray<Categoria>(res)),
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
      map((res) => this.utilService.ensureArray<Categoria>(res)),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getSubCategorias(idCategoria: string): Observable<Categoria[]> {
    const urlCategorias = `${this.urlBasic}?$select=Id,nombre,descripcion&$filter=categoriaPadreId eq ${idCategoria}`;
    return this.apiService.request<any>(urlCategorias, 'GET').pipe(
      map((res) => this.utilService.ensureArray<Categoria>(res)),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getSubCategoriasAnidadas(idCategoria: string): Observable<Categoria[]> {
    // Implementación imperativa usando async/await dentro de from(...)
    return from(
      (async () => {
        const result: Categoria[] = [];
        const queue: string[] = [idCategoria];
        const visited = new Set<string>();
        // Dequeue para obtener hijos; no añadimos la raíz a result (si quieres incluir la raíz, añadela)
        while (queue.length) {
          const curId = queue.shift()!;
          if (!curId || visited.has(curId)) continue;
          visited.add(curId);
          let hijasRaw: any = [];
          try {
            hijasRaw = await firstValueFrom(this.getSubCategorias(curId));
          } catch {
            hijasRaw = [];
          }
          const hijas: Categoria[] = this.utilService.ensureArray<Categoria>(hijasRaw);
          for (const h of hijas) {
            if (!h || !h.Id) continue;
            if (visited.has(h.Id)) continue;
            result.push(h);
            queue.push(h.Id);
          }
        }
        return result;
      })()
    ).pipe(
      catchError((err) => {
        console.error('Error en subcategorias anidadas iterativo:', err);
        return of([]);
      })
    );
  }

  getCategoriaSeleccionada(idCategoria: string): Observable<Categoria | null> {
    const urlCategoria = `${this.urlBasic}(${idCategoria})`;
    return this.apiService.request<any>(urlCategoria, 'GET').pipe(
      map((res) => this.utilService.ensureObject<Categoria>(res)),
      map((cat) => {
        if (!cat) throw new Error('Categoría no encontrada');
        return cat;
      }),
      catchError((err) => {
        console.error('Error obteniendo categoría seleccionada:', err);
        return of(null);
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
        const mensaje = await this.idiomaService.tVars('categorias.categoriaModificada', {
          nombre: body.nombre,
        });
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
      tap(async (res) => {
        const mensaje = await this.idiomaService.tVars('categorias.categoriaEliminada', {
          id: idCategoria,
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
