import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiService } from "./apiService";
import { Categoria } from "@interfaces/models/categoria";

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private apiService = inject(ApiService);

  private categorias: Categoria[] = [];
  private categoriasPadre: Categoria[] = [];
  private categoria: Categoria | null = null;

  getCategorias(): Categoria[] {
    return this.categorias;
  }
  getCategoriasPadre(): Categoria[] {
    return this.categoriasPadre;
  }
  getCategoria(): Categoria | null {
    return this.categoria;
  }

  getAll(idCenad: string): Observable<Categoria[]> {
    const url = `${this.apiService.getUrlApi()}/cenads/${idCenad}/categorias?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { categorias: Categoria[] } }>(url, 'GET').pipe(
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
    const url = `${this.apiService.getUrlApi()}/cenads/${idCenad}/categoriasPadre?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { categorias: Categoria[] } }>(url, 'GET').pipe(
      map(res =>
        res._embedded?.categorias.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

}
