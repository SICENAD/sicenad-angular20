import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Arma } from "@interfaces/models/arma";
import { UtilService } from "./utilService";
import { IdiomaService } from "./idiomaService";
import { UtilsStore } from "@stores/utils.store";

@Injectable({ providedIn: 'root' })
export class ArmaService {
  private utils = inject(UtilsStore);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private urlBasic = `${this.utils.urlApi()}/getbytitle('Armas')/items`;

  getAll(): Observable<Arma[]> {
    const endpoint = this.urlBasic;
    return this.apiService.request<any>(endpoint, 'GET').pipe(
      map(res => this.utilService.ensureArray<Arma>(res)),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  crearArma(nombre: string, tipoTiro: string): Observable<any> {
    const endpoint = 'Armas';
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
    const endpoint = 'Armas';
    return this.apiService.request<any>(endpoint, 'PATCH', { nombre: nombre.toUpperCase(), tipoTiro, Id: idArma }).pipe(
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
    const endpoint = 'Armas';
    return this.apiService.request<any>(endpoint, 'DELETE', { Id: idArma }).pipe(
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
