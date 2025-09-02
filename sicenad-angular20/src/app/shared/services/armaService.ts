import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiService } from "./apiService";
import { Arma } from "@interfaces/models/arma";

@Injectable({ providedIn: 'root' })
export class ArmaService {
  private apiService = inject(ApiService);

  private armas: Arma[] = [];
  private arma: Arma | null = null;

  getArmas(): Arma[] {
    return this.armas;
  }
  getArma(): Arma | null {
    return this.arma;
  }

  getAll(): Observable<Arma[]> {
    const url = `${this.apiService.getUrlApi()}/armas?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { armas: Arma[] } }>(url, 'GET').pipe(
      map(res =>
        res._embedded?.armas.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

}
