import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiService } from "./apiService";
import { Unidad } from "@interfaces/models/unidad";

@Injectable({ providedIn: 'root' })
export class UnidadService {
  private apiService = inject(ApiService);

  private unidades: Unidad[] = [];
  private unidad: Unidad | null = null;

  getUnidades(): Unidad[] {
    return this.unidades;
  }
  getUnidad(): Unidad | null {
    return this.unidad;
  }

  getAll(): Observable<Unidad[]> {
    const url = `${this.apiService.getUrlApi()}/unidades?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { unidades: Unidad[] } }>(url, 'GET').pipe(
      map(res =>
        res._embedded?.unidades.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

}
