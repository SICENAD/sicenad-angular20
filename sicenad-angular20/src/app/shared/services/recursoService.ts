import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap, switchMap, forkJoin } from 'rxjs';
import { ApiService } from './apiService';
import { Recurso } from '@interfaces/models/recurso';
import { UtilService } from './utilService';
import { IdiomaService } from './idiomaService';
import { UtilsStore } from '@stores/utils.store';
import { Categoria } from '@interfaces/models/categoria';
import { CategoriaService } from './categoriaService.ts';

@Injectable({ providedIn: 'root' })
export class RecursoService {
  private utils = inject(UtilsStore);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private categoriaService = inject(CategoriaService);
  private urlBasic = `${this.utils.urlApi()}/getbytitle('Recursos')/items`;

  getAll(idCenad: string): Observable<Recurso[]> {
    const urlRecursos = `${this.urlBasic}?$select=Id,nombre,descripcion,otros,conDatosEspecificosSolicitud,datosEspecificosSolicitud,cenad/nombre,categoria/Id,categoria/nombre,categoria/descripcion,tipoFormulario/Id,tipoFormulario/nombre,usuarioGestor/Id,usuarioGestor/username&$expand=tipoFormulario&$expand=categoria&$expand=cenad&$expand=usuarioGestor&$filter=cenadId eq ${idCenad}`;
    return this.apiService.request<any>(urlRecursos, 'GET').pipe(
      map((res) => this.utilService.ensureArray<Recurso>(res)),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getRecursosDeCategoria(idCategoria: string): Observable<Recurso[]> {
    const urlRecursos = `${this.urlBasic}?$select=Id,nombre,descripcion,otros,conDatosEspecificosSolicitud,datosEspecificosSolicitud,cenad/nombre,categoria/Id,categoria/nombre,categoria/descripcion,tipoFormulario/Id,tipoFormulario/nombre,usuarioGestor/Id,usuarioGestor/username&$expand=tipoFormulario&$expand=categoria&$expand=cenad&$expand=usuarioGestor&$filter=categoriaId eq ${idCategoria}`;
    return this.apiService.request<any>(urlRecursos, 'GET').pipe(
      map((res) => this.utilService.ensureArray<Recurso>(res)),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getRecursosDeSubcategorias(idCategoria: string): Observable<Recurso[]> {
    // Obtenemos recursivamente las subcategorías y luego pedimos los recursos de cada una,
    // aplanamos el resultado y eliminamos duplicados por Id.
    return this.categoriaService.getSubCategoriasAnidadas(idCategoria).pipe(
      switchMap((subcats: Categoria[]) => {
        // Incluir la propia categoría (raíz) para que si es hoja se obtengan sus recursos
        const childIds = (subcats || [])
          .map((c) => (c as any)?.Id)
          .filter(Boolean)
          .map(String);
        const ids = Array.from(new Set<string>([String(idCategoria), ...childIds]));
        const calls = ids.map((id) => this.getRecursosDeCategoria(String(id)));
        return forkJoin(calls).pipe(
          map((arrays: Recurso[][]) => {
            const flat = ([] as Recurso[]).concat(...arrays.map((a) => a || []));
            const mapById = new Map<string, Recurso>();
            for (const r of flat) {
              const rid = String((r as any)?.Id || (r as any)?.id || '');
              if (!rid) continue;
              if (!mapById.has(rid)) mapById.set(rid, r);
            }
            return Array.from(mapById.values());
          })
        );
      }),
      catchError((err) => {
        console.error('Error obteniendo recursos de subcategorías:', err);
        return of([]);
      })
    );
  }

  getRecursosDeGestor(idGestor: string): Observable<Recurso[]> {
    const urlRecursos = `${this.urlBasic}?$select=Id,nombre,descripcion,otros,conDatosEspecificosSolicitud,datosEspecificosSolicitud,cenad/nombre,categoria/Id,categoria/nombre,categoria/descripcion,tipoFormulario/Id,tipoFormulario/nombre,usuarioGestor/Id,usuarioGestor/username&$expand=tipoFormulario&$expand=categoria&$expand=cenad&$expand=usuarioGestor&$filter=usuarioGestorId eq ${idGestor}`;
    return this.apiService.request<any>(urlRecursos, 'GET').pipe(
      map((res) => this.utilService.ensureArray<Recurso>(res)),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getRecursoSeleccionado(idRecurso: string): Observable<Recurso | null> {
    const urlRecurso = `${this.urlBasic}(${idRecurso})?$select=Id,nombre,descripcion,otros,conDatosEspecificosSolicitud,datosEspecificosSolicitud,cenad/nombre,categoria/Id,categoria/nombre,categoria/descripcion,tipoFormulario/Id,tipoFormulario/nombre,usuarioGestor/Id,usuarioGestor/username&$expand=tipoFormulario&$expand=categoria&$expand=cenad&$expand=usuarioGestor`;
    return this.apiService.getElemento(urlRecurso).pipe(
      map((c) => {
        if (!c) throw new Error('Recurso no encontrado');
        return c as Recurso;
      }),
      catchError((err) => {
        console.error('Error obteniendo Recurso seleccionado:', err);
        return of(null);
      })
    );
  }

  getRecursoDeSolicitud(idSolicitud: string): Observable<Recurso | null> {
    const urlRecurso = `${this.utils.urlApi()}/getbytitle('Solicitudes')/items(${idSolicitud})?$select=recurso/Id,recurso/nombre,recurso/descripcion&$expand=recurso`;
    return this.apiService.getElemento(urlRecurso).pipe(
      map((r) => {
        if (!r) throw new Error('Recurso no encontrado');
        return r as Recurso;
      }),
      catchError((err) => {
        console.error('Error obteniendo Recurso seleccionado:', err);
        return of(null);
      })
    );
  }

  crearRecurso(
    nombre: string,
    descripcion: string,
    otros: string,
    idTipoFormulario: string,
    idCategoria: string,
    idGestor: string,
    idCenad: string
  ): Observable<any> {
    const endpoint = 'Recursos';
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion: descripcion,
      otros: otros,
      cenadId: idCenad,
      tipoFormularioId: idTipoFormulario,
      categoriaId: idCategoria,
      usuarioGestorId: idGestor,
    };
    return this.apiService.request<any>(endpoint, 'POST', body).pipe(
      map((res) => !!res),
      tap(async () => {
        const mensaje = await this.idiomaService.tVars('recursos.recursoCreado', { nombre });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarRecurso(
    nombre: string,
    descripcion: string,
    otros: string,
    idTipoFormulario: string,
    idCategoria: string,
    idGestor: string,
    idRecurso: string
  ): Observable<any> {
    const endpoint = 'Recursos';
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion: descripcion,
      otros: otros,
      tipoFormularioId: idTipoFormulario,
      categoriaId: idCategoria,
      usuarioGestorId: idGestor,
      Id: idRecurso
    };
    return this.apiService.request<any>(endpoint, 'PATCH', body).pipe(
      map((res) => !!res),
      tap(async () => {
        const mensaje = await this.idiomaService.tVars('recursos.recursoModificado', {
          nombre: body.nombre,
        });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarRecursoDetalle(
    nombre: string,
    descripcion: string,
    otros: string,
    conDatosEspecificosSolicitud: boolean,
    datosEspecificosSolicitud: string,
    idRecurso: string
  ): Observable<any> {
    const endpoint = 'Recursos';
    const body: any = {
      nombre: nombre.toUpperCase(),
      descripcion: descripcion,
      otros: otros,
      conDatosEspecificosSolicitud: conDatosEspecificosSolicitud,
      datosEspecificosSolicitud: datosEspecificosSolicitud,
      Id: idRecurso
    };
    return this.apiService.request<any>(endpoint, 'PATCH', body).pipe(
      map((res) => !!res),
      tap(async () => {
        const mensaje = await this.idiomaService.tVars('recursos.recursoModificado', {
          nombre: body.nombre,
        });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }

  deleteRecurso(idRecurso: string, nombreCenad: string): Observable<any> {
    const endpoint = 'Recursos';
    // Intentamos borrar la carpeta; si falla (404/409 u otro), lo registramos y continuamos
    return this.apiService.borrarCarpeta(`/${nombreCenad}/recursos/${idRecurso}`).pipe(
      catchError((err) => {
        console.warn(
          `No se pudo borrar la carpeta del recurso ${idRecurso}, se continúa con el borrado del recurso: ${err}`
        );
        return of(false);
      }),
      switchMap(() => this.apiService.request<any>(endpoint, 'DELETE', { Id: idRecurso })
      ),
      tap(async (res) => {
        const mensaje = await this.idiomaService.tVars('recursos.recursoEliminado', {
          id: idRecurso,
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
