import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiService } from "./apiService";
import { Recurso } from "@interfaces/models/recurso";

@Injectable({ providedIn: 'root' })
export class RecursoService {
  private apiService = inject(ApiService);

  private recursos: Recurso[] = [];
  private recurso: Recurso | null = null;

  getRecursos(): Recurso[] {
    return this.recursos;
  }
  getRecurso(): Recurso | null {
    return this.recurso;
  }

  getAll(idCenad: string): Observable<Recurso[]> {
    const url = `${this.apiService.getUrlApi()}/cenads/${idCenad}/recursos?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { recursos: Recurso[] } }>(url, 'GET').pipe(
      map(res =>
        res._embedded?.recursos.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

}
