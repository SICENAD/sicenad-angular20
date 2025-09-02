import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiService } from "./apiService";
import { Cartografia } from "@interfaces/models/cartografia";

@Injectable({ providedIn: 'root' })
export class CartografiaService {
  private apiService = inject(ApiService);

  private cartografias: Cartografia[] = [];
  private cartografia: Cartografia | null = null;

  getCartografias(): Cartografia[] {
    return this.cartografias;
  }
  getCartografia(): Cartografia | null {
    return this.cartografia;
  }

  getAll(idCenad: string): Observable<Cartografia[]> {
    const url = `${this.apiService.getUrlApi()}/cenads/${idCenad}/cartografias?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { cartografias: Cartografia[] } }>(url, 'GET').pipe(
      map(res =>
        res._embedded?.cartografias.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

}
