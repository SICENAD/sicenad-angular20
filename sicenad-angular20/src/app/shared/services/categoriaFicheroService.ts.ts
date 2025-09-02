import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiService } from "./apiService";
import { CategoriaFichero } from "@interfaces/models/categoriaFichero";

@Injectable({ providedIn: 'root' })
export class CategoriaFicheroService {
  private apiService = inject(ApiService);

  private categoriasFichero: CategoriaFichero[] = [];
  private categoriaFichero: CategoriaFichero | null = null;

  getCategoriasFichero(): CategoriaFichero[] {
    return this.categoriasFichero;
  }
  getCategoriaFichero(): CategoriaFichero | null {
    return this.categoriaFichero;
  }

  getAll(): Observable<CategoriaFichero[]> {
    const url = `${this.apiService.getUrlApi()}/categorias_fichero?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { categorias_fichero: CategoriaFichero[] } }>(url, 'GET').pipe(
      map(res =>
        res._embedded?.categorias_fichero.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

}
