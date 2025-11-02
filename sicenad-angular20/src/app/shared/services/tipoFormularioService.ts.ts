import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { ApiService } from './apiService';
import { TipoFormulario } from '@interfaces/models/tipoFormulario';
import { UtilService } from './utilService';
import { IdiomaService } from './idiomaService';
import { UtilsStore } from '@stores/utils.store';

@Injectable({ providedIn: 'root' })
export class TipoFormularioService {
  private utils = inject(UtilsStore);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private urlBasic = `${this.utils.urlApi()}/getbytitle('TiposFormulario')/items`;

  getAll(): Observable<TipoFormulario[]> {
    const endpoint = this.urlBasic;
    return this.apiService.request<TipoFormulario[]>(endpoint, 'GET').pipe(
      map((res) => res?.map((item) => ({ ...item, url: (item as any)._links?.self?.href })) || []),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getTipoFormularioDeRecurso(idRecurso: string): Observable<TipoFormulario> {
    const urlTipoFormulario = `${this.urlBasic}?$expand=recurso&$filter=recursoId eq ${idRecurso}`;
    return this.apiService.request<any>(urlTipoFormulario, 'GET').pipe(
      map((res) => {
        const tiposFormulario = res?.d?.results || [];
        const tipoFormulario = tiposFormulario[0];
        if (!tipoFormulario) throw new Error('Tipo de formulario no encontrado');
        return tipoFormulario;
      }),
      catchError((err) => {
        console.error('❌ Error en login:', err);
        return throwError(() => err);
      })
    );
  }

  crearTipoFormulario(nombre: string, descripcion: string): Observable<any> {
    const endpoint = 'TiposFormulario';
    return this.apiService
      .request<any>(endpoint, 'POST', { nombre: nombre.toUpperCase(), descripcion })
      .pipe(
        map((res) => !!res),
        tap(async () => {
          const mensaje = await this.idiomaService.tVars('tiposFormulario.tipoFormularioCreado', {
            nombre,
          });
          this.utilService.toast(mensaje, 'success');
        }),
        catchError((err) => {
          console.error(err);
          return of(false);
        })
      );
  }

  editarTipoFormulario(
    nombre: string,
    descripcion: string,
    idTipoFormulario: string
  ): Observable<any> {
    const endpoint = 'TiposFormulario';
    return this.apiService
      .request<any>(endpoint, 'PATCH', {
        nombre: nombre.toUpperCase(),
        descripcion,
        Id: idTipoFormulario,
      })
      .pipe(
        map((res) => !!res),
        tap(async () => {
          const mensaje = await this.idiomaService.tVars(
            'tiposFormulario.tipoFormularioModificado',
            { nombre }
          );
          this.utilService.toast(mensaje, 'success');
        }),
        catchError((err) => {
          console.error(err);
          return of(false);
        })
      );
  }

  deleteTipoFormulario(idTipoFormulario: string): Observable<any> {
    const endpoint = 'TiposFormulario';
    return this.apiService.request<any>(endpoint, 'DELETE', { Id: idTipoFormulario }).pipe(
      tap(async (res) => {
        const mensaje = await this.idiomaService.tVars('tiposFormulario.tipoFormularioEliminado', {
          id: idTipoFormulario,
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
