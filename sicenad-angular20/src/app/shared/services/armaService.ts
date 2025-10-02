import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Arma } from "@interfaces/models/arma";
import { UtilService } from "./utilService";
import { IdiomaService } from "./idiomaService";

@Injectable({ providedIn: 'root' })
export class ArmaService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);

  getAll(): Observable<Arma[]> {
    const endpoint = `/armas?size=1000`;
    return this.apiService.request<{ _embedded: { armas: Arma[] } }>(endpoint, 'GET').pipe(
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
    return this.apiService.request<any>(endpoint, 'POST', { nombre: nombre.toUpperCase(), tipoTiro }).pipe(
      map(res => !!res),
      tap(async () => {
        const mensaje = await this.idiomaService.tVars('armas.armaCreada', { nombre });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarArma(nombre: string, tipoTiro: string, idArma: string): Observable<any> {
    const endpoint = `/armas/${idArma}`;
    return this.apiService.request<any>(endpoint, 'PATCH', { nombre: nombre.toUpperCase(), tipoTiro }).pipe(
      map(res => !!res),
      tap(async () => {
        const mensaje = await this.idiomaService.tVars('armas.armaModificada', { nombre });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  deleteArma(idArma: string): Observable<any> {
    const endpoint = `/armas/${idArma}`;
    return this.apiService.request<any>(endpoint, 'DELETE').pipe(
      tap(async res => {
        const mensaje = await this.idiomaService.tVars('armas.armaEliminada', { id: idArma });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
}