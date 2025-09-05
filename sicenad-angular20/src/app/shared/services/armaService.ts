import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Arma } from "@interfaces/models/arma";
import { UtilService } from "./utilService";

@Injectable({ providedIn: 'root' })
export class ArmaService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);

  private armas: Arma[] = [];
  private arma: Arma | null = null;

  getArmas(): Arma[] {
    return this.armas;
  }
  getArma(): Arma | null {
    return this.arma;
  }

  getAll(): Observable<Arma[]> {
    const endpoint = `/armas?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { armas: Arma[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.armas.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  crearArma(nombre: string, tipoTiro: string): Observable<any> {
    const endpoint = `/armas`;
    return this.apiService.peticionConToken<any>(endpoint, 'POST', { nombre: nombre.toUpperCase(), tipoTiro }).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha creado el arma ${nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarArma(nombre: string, tipoTiro: string, idArma: string): Observable<any> {
    const endpoint = `/armas/${idArma}`;
    return this.apiService.peticionConToken<any>(endpoint, 'PATCH', { nombre: nombre.toUpperCase(), tipoTiro }).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha modificado el arma ${nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
  deleteArma(idArma: string): Observable<any> {
    const endpoint = `/armas/${idArma}`;
    return this.apiService.peticionConToken<any>(endpoint, 'DELETE').pipe(
      tap(res => {
        this.arma = res;
        this.utilService.toast(`Se ha eliminado el arma ${this.arma?.nombre}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
}
