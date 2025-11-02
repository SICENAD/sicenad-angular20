import { inject, Injectable } from '@angular/core';
import { catchError, firstValueFrom, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { ApiService } from './apiService';
import { Usuario } from '@interfaces/models/usuario';
import { UsuarioSuperAdministrador } from '@interfaces/models/usuarioSuperadministrador';
import { UsuarioAdministrador } from '@interfaces/models/usuarioAdministrador';
import { UsuarioGestor } from '@interfaces/models/usuarioGestor';
import { UsuarioNormal } from '@interfaces/models/usuarioNormal';
import { LoginResponse } from '@interfaces/responses/loginResponse';
import { RegisterResponse } from '@interfaces/responses/registerResponse';
import { Cenad } from '@interfaces/models/cenad';
import { Unidad } from '@interfaces/models/unidad';
import { UtilService } from './utilService';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { ChangePasswordResponse } from '@interfaces/responses/changePasswordResponse';
import { IdiomaService } from './idiomaService';
import { UtilsStore } from '@stores/utils.store';
import { CenadService } from './cenadService';
import { UnidadService } from './unidadService';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private utils = inject(UtilsStore);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private cenadService = inject(CenadService);
  private unidadService = inject(UnidadService);
  private urlBasic = `${this.utils.urlApi()}/getbytitle('Usuarios')/items`;

  // --- REQUEST LOGIN ---
  login(username: string, password: string): Observable<LoginResponse> {
    const lista = 'Usuarios';
    const filtro = `username eq '${username}'`;
    return this.apiService
      .getListaElementosFiltrados(lista, filtro, ['username', 'password', 'rol'])
      .pipe(
        map((res) => {
          const usuarios = res?.d?.results || [];
          const usuario = usuarios[0];
          if (!usuario) throw new Error('Usuario no encontrado');
          if (usuario.password !== password) throw new Error('Contraseña incorrecta');
          return {
            token: this.utilService.generarTokenAleatorio(),
            username: usuario.username,
            rol: usuario.rol || 'Normal',
          } as LoginResponse;
        }),
        catchError((err) => {
          console.error('❌ Error en login:', err);
          return throwError(() => err);
        })
      );
  }

  // --- REQUEST REGISTER ---
  register(
    username: string,
    password: string,
    tfno: string,
    email: string,
    emailAdmitido: boolean,
    descripcion: string,
    rol: string
  ): Observable<RegisterResponse> {
    const nombreLista = 'Usuarios';
    const nuevoUsuario = {
      username: username,
      password: password,
      tfno: tfno,
      email: email,
      emailAdmitido: emailAdmitido,
      descripcion: descripcion,
      rol: rol,
    };
    return this.apiService
      .getListaElementosFiltrados(nombreLista, `username eq '${username}'`)
      .pipe(
        switchMap((usuariosExistentes: any[]) => {
          if (usuariosExistentes.length > 0) {
            // ⚠️ Usuario ya existe → mostramos alerta y terminamos sin error
            alert(`El usuario "${username}" ya existe.`);
            return of({ usernameRegistrado: '', rolRegistrado: '' } as RegisterResponse);
          }
          // Crea el usuario y devuelve solo los campos que espera tu interfaz
          return this.apiService.request<any>(nombreLista, 'POST', nuevoUsuario).pipe(
            map((res) => ({
              usernameRegistrado: res?.username ?? username,
              rolRegistrado: res?.rol ?? rol,
            })),
            catchError((err) => {
              console.error('❌ Error en registerUsuario:', err);
              return throwError(() => err);
            })
          );
        }),
        catchError((err) => {
          console.error('❌ Error en registerUsuario:', err);
          return throwError(() => err);
        })
      );
  }

  // --- REQUEST CHANGE PASSWORD ---
  changePassword(idUsuario: string, password: string): Observable<ChangePasswordResponse> {
    const nombreLista = 'Usuarios';
    const body = { id: idUsuario, password: password };

    return this.apiService.request<any>(nombreLista, 'PATCH', body).pipe(
      map((res) => ({
        username: res?.username ?? '',
        rol: res?.rol ?? '',
      })),
      catchError((err) => {
        console.error('❌ Error al cambiar la contraseña:', err);
        return throwError(() => err);
      })
    );
  }

  getAll(): Observable<Usuario[]> {
    const endpoint = this.urlBasic;
    return this.apiService.request<Usuario[]>(endpoint, 'GET').pipe(
      map((res) => res?.map((item) => ({ ...item, url: (item as any)._links?.self?.href })) || []),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getAllUsuariosSuperadministrador(): Observable<UsuarioSuperAdministrador[]> {
    const lista = 'Usuarios';
    const filtro = `rol eq 'Superadministrador'`;
    return this.apiService.getListaElementosFiltrados(lista, filtro).pipe(
      map(
        (res) => res?.map((item: any) => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getAllUsuariosAdministrador(): Observable<UsuarioAdministrador[]> {
    const lista = 'Usuarios';
    const filtro = `rol eq 'Administrador'`;
    return this.apiService.getListaElementosFiltrados(lista, filtro).pipe(
      map(
        (res) => res?.map((item: any) => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getAllUsuariosGestor(): Observable<UsuarioGestor[]> {
    const lista = 'Usuarios';
    const filtro = `rol eq 'Gestor'`;
    return this.apiService.getListaElementosFiltrados(lista, filtro).pipe(
      map(
        (res) => res?.map((item: any) => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getAllUsuariosGestorCenad(idCenad: string): Observable<UsuarioGestor[]> {
    const urlGestores = `${this.urlBasic}?$expand=cenad&$filter=cenadId eq ${idCenad} and rol eq 'Gestor'`;
    return this.apiService.request<any>(urlGestores, 'GET').pipe(
      map(
        (res) => res?.map((item: any) => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getAllUsuariosNormal(): Observable<UsuarioNormal[]> {
    const lista = 'Usuarios';
    const filtro = `rol eq 'Normal'`;
    return this.apiService.getListaElementosFiltrados(lista, filtro).pipe(
      map(
        (res) => res?.map((item: any) => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getUsuarioAdministradorCenad(idCenad: string): Observable<UsuarioAdministrador | null> {
    const urlAdministradores = `${this.urlBasic}?$expand=cenad&$filter=cenadId eq ${idCenad} and rol eq 'Administrador'`;
    return this.apiService.request<any>(urlAdministradores, 'GET').pipe(
      map((res) => {
        const usuarios = res?.d?.results || [];
        const usuario = usuarios[0];
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
      }),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

    getUsuarioSuperadministradorPorUsername(username: string): Observable<UsuarioSuperAdministrador | null> {
    const urlSuperadministradores = `${this.urlBasic}?$filter=username eq ${username} and rol eq 'Superadministrador'`;
    return this.apiService.request<any>(urlSuperadministradores, 'GET').pipe(
      map((res) => {
        const usuarios = res?.d?.results || [];
        const usuario = usuarios[0];
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
      }),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  getUsuarioAdministradorPorUsername(username: string): Observable<UsuarioAdministrador | null> {
    const urlAdministradores = `${this.urlBasic}?$filter=username eq ${username} and rol eq 'Administrador'`;
    return this.apiService.request<any>(urlAdministradores, 'GET').pipe(
      map((res) => {
        const usuarios = res?.d?.results || [];
        const usuario = usuarios[0];
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
      }),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  getUsuarioGestorPorUsername(username: string): Observable<UsuarioGestor | null> {
    const urlGestores = `${this.urlBasic}?$filter=username eq ${username} and rol eq 'Gestor'`;
    return this.apiService.request<any>(urlGestores, 'GET').pipe(
      map((res) => {
        const usuarios = res?.d?.results || [];
        const usuario = usuarios[0];
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
      }),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  getUsuarioGestorDeRecurso(idRecurso: string): Observable<UsuarioGestor | null> {
    const urlGestores = `${this.urlBasic}?$expand=cenad&$filter=recursoId eq ${idRecurso} and rol eq 'Gestor'`;
    return this.apiService.request<any>(urlGestores, 'GET').pipe(
      map((res) => {
        const usuarios = res?.d?.results || [];
        const usuario = usuarios[0];
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
      }),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  getUsuarioNormalPorUsername(username: string): Observable<UsuarioNormal | null> {
    const urlNormales = `${this.urlBasic}?$filter=username eq ${username} and rol eq 'Normal'`;
    return this.apiService.request<any>(urlNormales, 'GET').pipe(
      map((res) => {
        const usuarios = res?.d?.results || [];
        const usuario = usuarios[0];
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
      }),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  public editarUsuarioSuperadministrador(
    username: string,
    tfno: string,
    email: string,
    emailAdmitido: boolean,
    descripcion: string,
    idUsuario: string
  ): Observable<any> {
    const nombreLista = 'Usuarios';
    const body = {
      Id: idUsuario,
      username: username,
      tfno: tfno,
      email: email,
      emailAdmitido: emailAdmitido,
      descripcion: descripcion,
    };
    return this.apiService.request<any>(nombreLista, 'PATCH', body).pipe(
      map((res) => !!res),
      tap(async (res) => {
        const mensaje = await this.idiomaService.tVars('usuarios.usuarioModificado', {
          username,
        });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarUsuarioAdministrador(
    username: string,
    tfno: string,
    email: string,
    emailAdmitido: boolean,
    descripcion: string,
    idCenad: string,
    idUsuarioAdministrador: string
  ): Observable<any> {
    const nombreLista = 'Usuarios';
    const body = {
      Id: idUsuarioAdministrador,
      username: username,
      tfno: tfno,
      email: email,
      emailAdmitido: emailAdmitido,
      descripcion: descripcion,
      cenadId: idCenad,
    };
    return this.apiService.request<any>(nombreLista, 'PATCH', body).pipe(
      map((res) => !!res),
      tap(async (res) => {
        const mensaje = await this.idiomaService.tVars('usuarios.usuarioModificado', {
          username,
        });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarUsuarioGestor(
    username: string,
    tfno: string,
    email: string,
    emailAdmitido: boolean,
    descripcion: string,
    idCenad: string,
    idUsuarioGestor: string
  ): Observable<any> {
    const nombreLista = 'Usuarios';
    const body = {
      Id: idUsuarioGestor,
      username: username,
      tfno: tfno,
      email: email,
      emailAdmitido: emailAdmitido,
      descripcion: descripcion,
      cenadId: idCenad,
    };
    return this.apiService.request<any>(nombreLista, 'PATCH', body).pipe(
      map((res) => !!res),
      tap(async (res) => {
        const mensaje = await this.idiomaService.tVars('usuarios.usuarioModificado', {
          username,
        });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarUsuarioNormal(
    username: string,
    tfno: string,
    email: string,
    emailAdmitido: boolean,
    descripcion: string,
    idUnidad: string,
    idUsuarioNormal: string
  ): Observable<any> {
    const nombreLista = 'Usuarios';
    const body = {
      Id: idUsuarioNormal,
      username: username,
      tfno: tfno,
      email: email,
      emailAdmitido: emailAdmitido,
      descripcion: descripcion,
      unidadId: idUnidad,
    };
    return this.apiService.request<any>(nombreLista, 'PATCH', body).pipe(
      map((res) => !!res),
      tap(async (res) => {
        const mensaje = await this.idiomaService.tVars('usuarios.usuarioModificado', {
          username,
        });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }

  deleteUsuario(idUsuario: string): Observable<any> {
    const endpoint = 'Usuarios';
    return this.apiService.request<any>(endpoint, 'DELETE', { Id: idUsuario }).pipe(
      tap(async (res) => {
        const mensaje = await this.idiomaService.tVars('usuarios.usuarioEliminado', {
          id: idUsuario,
        });
        this.utilService.toast(mensaje, 'success');
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }

  // --- OBTENER DATOS DE USUARIO SEGUN ROL ---
  async getDatosUsuario(
    rol: string,
    username: string
  ): Promise<{
    usuario: any;
    cenad?: Cenad | null;
    unidad?: Unidad | null;
  }> {
    switch (rol) {
      case RolUsuario.Administrador: {
        const usuario = await firstValueFrom(this.getUsuarioAdministradorPorUsername(username));
        if (!usuario) {
          const mensaje = await this.idiomaService.tVars('usuarios.usuarioNoEncontrado', {
            username,
          });
          throw new Error(mensaje);
        }
        const cenad = await firstValueFrom(this.cenadService.getCenadDeAdministrador(usuario.Id));
        if (!cenad) {
          const mensaje = await this.idiomaService.tVars('cenads.cenadNoEncontrado', {
            cenad: cenad!.nombre || '',
          });
          throw new Error(mensaje);
        }
        return { usuario, cenad };
      }
      case RolUsuario.Gestor: {
        const usuario = await firstValueFrom(this.getUsuarioGestorPorUsername(username));
        if (!usuario) {
          const mensaje = await this.idiomaService.tVars('usuarios.usuarioNoEncontrado', {
            username,
          });
          throw new Error(mensaje);
        }
        const cenad = await firstValueFrom(this.cenadService.getCenadDeGestor(usuario.Id));
        if (!cenad) {
          const mensaje = await this.idiomaService.tVars('cenads.cenadNoEncontrado', {
            cenad: cenad!.nombre || '',
          });
          throw new Error(mensaje);
        }
        return { usuario, cenad };
      }
      case RolUsuario.Normal: {
        const usuario = await firstValueFrom(this.getUsuarioNormalPorUsername(username));
        if (!usuario) {
          const mensaje = await this.idiomaService.tVars('usuarios.usuarioNoEncontrado', {
            username,
          });
          throw new Error(mensaje);
        }
        const unidad = await firstValueFrom(
          this.unidadService.getUnidadDeUsuarioNormal(usuario.Id)
        );
        if (!unidad) {
          const mensaje = await this.idiomaService.tVars('unidades.unidadNoEncontrada', {
            unidad: unidad!.nombre || '',
          });
          throw new Error(mensaje);
        }
        return { usuario, unidad };
      }
      case RolUsuario.Superadministrador: {
        const usuario = await firstValueFrom(this.getUsuarioSuperadministradorPorUsername(username));
        if (!usuario) {
          const mensaje = await this.idiomaService.tVars('usuarios.usuarioNoEncontrado', {
            username,
          });
          throw new Error(mensaje);
        }
        return { usuario };
      }
      default: {
        const mensaje = await this.idiomaService.tVars('usuarios.rolDesconocido', { rol });
        throw new Error(mensaje);
      }
    }
  }
}
