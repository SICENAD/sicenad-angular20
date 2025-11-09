import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { ApiService } from './apiService';
import { Unidad } from '@interfaces/models/unidad';
import { UtilService } from './utilService';
import { IdiomaService } from './idiomaService';
import { UtilsStore } from '@stores/utils.store';

@Injectable({ providedIn: 'root' })
export class UnidadService {
  private utils = inject(UtilsStore);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private urlBasic = `${this.utils.urlApi()}/getbytitle('Unidades')/items`;

  getAll(): Observable<Unidad[]> {
    const endpoint = this.urlBasic;
    return this.apiService.request<any>(endpoint, 'GET').pipe(
      map((res) => this.utilService.ensureArray<Unidad>(res)),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getUnidadDeUsuarioNormal(idUsuarioNormal: string): Observable<Unidad | null> {
    const filter = `$select=Id,nombre, descripcion, direccion, tfno, email, poc&$filter=usuarioNormalId eq ${idUsuarioNormal}`;
    const urlUnidades = `${this.urlBasic}?${filter}`;
    return this.apiService.request<any>(urlUnidades, 'GET').pipe(
      map((res) => {
        const unidades = this.utilService.ensureArray<Unidad>(res);
        const unidad = unidades[0];
        if (!unidad) throw new Error('Unidad no encontrada');
        return unidad;
      }),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  crearUnidad(
    nombre: string,
    descripcion: string,
    email: string,
    tfno: string,
    direccion: string,
    poc: string
  ): Observable<any> {
    const endpoint = 'Unidades';
    return this.apiService
      .request<any>(endpoint, 'POST', {
        nombre: nombre.toUpperCase(),
        descripcion,
        email,
        tfno,
        direccion,
        poc,
      })
      .pipe(
        map((res) => !!res),
        tap(async () => {
          const mensaje = await this.idiomaService.tVars('unidades.unidadCreada', { nombre });
          this.utilService.toast(mensaje, 'success');
        }),
        catchError((err) => {
          console.error(err);
          return of(false);
        })
      );
  }

  editarUnidad(
    nombre: string,
    descripcion: string,
    email: string,
    tfno: string,
    direccion: string,
    poc: string,
    idUnidad: string
  ): Observable<any> {
    const endpoint = 'Unidades';
    return this.apiService
      .request<any>(endpoint, 'PATCH', {
        nombre: nombre.toUpperCase(),
        descripcion,
        email,
        tfno,
        direccion,
        poc,
        Id: idUnidad,
      })
      .pipe(
        map((res) => !!res),
        tap(async () => {
          const mensaje = await this.idiomaService.tVars('unidades.unidadModificada', { nombre });
          this.utilService.toast(mensaje, 'success');
        }),
        catchError((err) => {
          console.error(err);
          return of(false);
        })
      );
  }

  deleteUnidad(idUnidad: string): Observable<any> {
    const endpoint = 'Unidades';
    return this.apiService.request<any>(endpoint, 'DELETE', { Id: idUnidad }).pipe(
      tap(async (res) => {
        const mensaje = await this.idiomaService.tVars('unidades.unidadEliminada', {
          id: idUnidad,
        });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }
}
