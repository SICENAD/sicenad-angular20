import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiService } from "./apiService";
import { Normativa } from "@interfaces/models/normativa";

@Injectable({ providedIn: 'root' })
export class NormativaService {
  private apiService = inject(ApiService);

  private normativas: Normativa[] = [];
  private normativa: Normativa | null = null;

  getNormativas(): Normativa[] {
    return this.normativas;
  }
  getNormativa(): Normativa | null {
    return this.normativa;
  }

  getAll(idCenad: string): Observable<Normativa[]> {
    const endpoint = `/cenads/${idCenad}/normativas?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { ficheros: Normativa[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.ficheros.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

}
