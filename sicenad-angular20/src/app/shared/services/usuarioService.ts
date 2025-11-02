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

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private utils = inject(UtilsStore);
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
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
    const endpoint = `/usuarios?size=1000`;
    return this.apiService.request<{ _embedded: { usuarios: Usuario[] } }>(endpoint, 'GET').pipe(
      map(
        (res) =>
          res._embedded?.usuarios.map((item) => ({
            ...item,
            url: (item as any)._links?.self?.href,
          })) || []
      ),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }

  getAllUsuariosSuperadministrador(): Observable<UsuarioSuperAdministrador[]> {
    const endpoint = this.urlBasic;
    return this.apiService.request<UsuarioSuperAdministrador[]>(endpoint, 'GET').pipe(
      map(res =>
        res?.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getAllUsuariosAdministrador(): Observable<UsuarioAdministrador[]> {
    const endpoint = `/usuarios_administrador?size=1000`;
    return this.apiService
      .request<{ _embedded: { usuarios_administrador: UsuarioAdministrador[] } }>(endpoint, 'GET')
      .pipe(
        map(
          (res) =>
            res._embedded?.usuarios_administrador.map((item) => ({
              ...item,
              url: (item as any)._links?.self?.href,
            })) || []
        ),
        catchError((err) => {
          console.error(err);
          return of([]);
        })
      );
  }

  getAllUsuariosGestor(): Observable<UsuarioGestor[]> {
    const endpoint = `/usuarios_gestor?size=1000`;
    return this.apiService
      .request<{ _embedded: { usuarios_gestor: UsuarioGestor[] } }>(endpoint, 'GET')
      .pipe(
        map(
          (res) =>
            res._embedded?.usuarios_gestor.map((item) => ({
              ...item,
              url: (item as any)._links?.self?.href,
            })) || []
        ),
        catchError((err) => {
          console.error(err);
          return of([]);
        })
      );
  }

  getAllUsuariosGestorCenad(idCenad: string): Observable<UsuarioGestor[]> {
    const endpoint = `/cenads/${idCenad}/usuariosGestores?size=1000`;
    return this.apiService
      .request<{ _embedded: { usuarios_gestor: UsuarioGestor[] } }>(endpoint, 'GET')
      .pipe(
        map(
          (res) =>
            res._embedded?.usuarios_gestor.map((item) => ({
              ...item,
              url: (item as any)._links?.self?.href,
            })) || []
        ),
        catchError((err) => {
          console.error(err);
          return of([]);
        })
      );
  }

  getAllUsuariosNormal(): Observable<UsuarioNormal[]> {
    const endpoint = `/usuarios_normal?size=1000`;
    return this.apiService
      .request<{ _embedded: { usuarios_normal: UsuarioNormal[] } }>(endpoint, 'GET')
      .pipe(
        map(
          (res) =>
            res._embedded?.usuarios_normal.map((item) => ({
              ...item,
              url: (item as any)._links?.self?.href,
            })) || []
        ),
        catchError((err) => {
          console.error(err);
          return of([]);
        })
      );
  }

  getUsuarioAdministradorCenad(idCenad: string): Observable<UsuarioAdministrador | null> {
    const endpoint = `/cenads/${idCenad}/usuarioAdministrador`;
    return this.apiService.request<UsuarioAdministrador>(endpoint, 'GET').pipe(
      map((res) => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  getUsuarioAdministradorPorUsername(username: string): Observable<UsuarioAdministrador | null> {
    const endpoint = `/usuarios_administrador/search/findByUsername?username=${username}`;
    return this.apiService.request<UsuarioAdministrador>(endpoint, 'GET').pipe(
      map((res) => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  getUsuarioGestorPorUsername(username: string): Observable<UsuarioGestor | null> {
    const endpoint = `/usuarios_gestor/search/findByUsername?username=${username}`;
    return this.apiService.request<UsuarioGestor>(endpoint, 'GET').pipe(
      map((res) => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  getUsuarioGestorDeRecurso(idRecurso: string): Observable<UsuarioGestor | null> {
    const endpoint = `/recursos/${idRecurso}/usuarioGestor`;
    return this.apiService.request<UsuarioGestor>(endpoint, 'GET').pipe(
      map((res) => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  getUsuarioNormalPorUsername(username: string): Observable<UsuarioNormal | null> {
    const endpoint = `/usuarios_normal/search/findByUsername?username=${username}`;
    return this.apiService.request<UsuarioNormal>(endpoint, 'GET').pipe(
      map((res) => ({ ...res, url: (res as any)._links?.self?.href })),
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
      id: idUsuario,
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
    const endpoint = `/usuarios_administrador/${idUsuarioAdministrador}`;
    const cenad = `${this.apiService.getUrlApi()}/cenads/${idCenad}`;
    return this.apiService
      .request<any>(endpoint, 'PATCH', { username, tfno, email, emailAdmitido, descripcion, cenad })
      .pipe(
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
    const endpoint = `/usuarios_gestor/${idUsuarioGestor}`;
    const cenad = `${this.apiService.getUrlApi()}/cenads/${idCenad}`;
    return this.apiService
      .request<any>(endpoint, 'PATCH', { username, tfno, email, emailAdmitido, descripcion, cenad })
      .pipe(
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
    const endpoint = `/usuarios_normal/${idUsuarioNormal}`;
    const unidad = `${this.apiService.getUrlApi()}/unidades/${idUnidad}`;
    return this.apiService
      .request<any>(endpoint, 'PATCH', {
        username,
        tfno,
        email,
        emailAdmitido,
        descripcion,
        unidad,
      })
      .pipe(
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
    const endpoint = `/usuarios/${idUsuario}`;
    return this.apiService.request<any>(endpoint, 'DELETE').pipe(
      tap(async (res) => {
        if (res) {
          const mensaje = await this.idiomaService.tVars('usuarios.usuarioEliminado', {
            id: idUsuario,
          });
          this.utilService.toast(mensaje, 'success');
        }
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
        const usuario: UsuarioAdministrador = await firstValueFrom(
          this.apiService.request(
            `/usuarios_administrador/search/findByUsername?username=${username}`,
            'GET',
            null
          )
        );
        const cenad: Cenad = await firstValueFrom(
          this.apiService.request(`/usuarios_administrador/${usuario.Id}/cenad`, 'GET', null)
        );
        return { usuario, cenad };
      }
      case RolUsuario.Gestor: {
        const usuario: UsuarioGestor = await firstValueFrom(
          this.apiService.request(
            `/usuarios_gestor/search/findByUsername?username=${username}`,
            'GET',
            null
          )
        );
        const cenad: Cenad = await firstValueFrom(
          this.apiService.request(`/usuarios_gestor/${usuario.Id}/cenad`, 'GET', null)
        );
        return { usuario, cenad };
      }
      case RolUsuario.Normal: {
        const usuario: UsuarioNormal = await firstValueFrom(
          this.apiService.request(
            `/usuarios_normal/search/findByUsername?username=${username}`,
            'GET',
            null
          )
        );
        const unidad: Unidad = await firstValueFrom(
          this.apiService.request(`/usuarios_normal/${usuario.Id}/unidad`, 'GET', null)
        );
        return { usuario, unidad };
      }
      case RolUsuario.Superadministrador: {
        const usuario = await firstValueFrom(
          //this.apiService.request(
           // `/usuarios_superadministrador/search/findByUsername?username=${username}`,
          //  'GET',
          //  null
          this.apiService.getListaElementosFiltrados('Usuarios', `username eq ${username}`)
          );
        return { usuario };
      }
      default: {
        const mensaje = await this.idiomaService.tVars('usuarios.rolDesconocido', { rol });
        throw new Error(mensaje);
      }
    }
  }
}
