import { inject, Injectable } from "@angular/core";
import { catchError, firstValueFrom, map, Observable, of, tap } from "rxjs";
import { ApiService } from "./apiService";
import { Usuario } from "@interfaces/models/usuario";
import { UsuarioSuperAdministrador } from "@interfaces/models/usuarioSuperadministrador";
import { UsuarioAdministrador } from "@interfaces/models/usuarioAdministrador";
import { UsuarioGestor } from "@interfaces/models/usuarioGestor";
import { UsuarioNormal } from "@interfaces/models/usuarioNormal";
import { LoginResponse } from "@interfaces/responses/loginResponse";
import { RegisterResponse } from "@interfaces/responses/registerResponse";
import { Cenad } from "@interfaces/models/cenad";
import { Unidad } from "@interfaces/models/unidad";
import { UtilService } from "./utilService";
import { RolUsuario } from "@interfaces/enums/rolUsuario.enum";
import { ChangePasswordResponse } from "@interfaces/responses/changePasswordResponse";

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);

  // --- REQUEST LOGIN ---
  public login(username: string, password: string): Observable<LoginResponse> {
    const endpoint = `/auth/login`;
    return this.apiService.request<LoginResponse>(endpoint,'POST', { username, password });
  }
  // --- REQUEST REGISTER ---
  public register(username: string, password: string, tfno: string, email: string, emailAdmitido: boolean, descripcion: string, rol: string): Observable<RegisterResponse> {
    const endpoint = `/auth/register`;
    return this.apiService.request<RegisterResponse>(endpoint,'POST', { username, password, tfno, email, emailAdmitido, descripcion, rol });
  }

  // --- REQUEST CHANGE PASSWORD ---
  public changePassword(idUsuario: string, password: string): Observable<ChangePasswordResponse> {
    const endpoint = `/auth/change-password`;
    return this.apiService.request<ChangePasswordResponse>(endpoint, 'POST', { idUsuario, password });
  }

  getAll(): Observable<Usuario[]> {
    const endpoint = `/usuarios?size=1000`;
    return this.apiService.request<{ _embedded: { usuarios: Usuario[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.usuarios.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }
  getAllUsuariosSuperadministrador(): Observable<UsuarioSuperAdministrador[]> {
    const endpoint = `/usuarios_superadministrador?size=1000`;
    return this.apiService.request<{ _embedded: { usuarios_superadministrador: UsuarioSuperAdministrador[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.usuarios_superadministrador.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getAllUsuariosAdministrador(): Observable<UsuarioAdministrador[]> {
    const endpoint = `/usuarios_administrador?size=1000`;
    return this.apiService.request<{ _embedded: { usuarios_administrador: UsuarioAdministrador[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.usuarios_administrador.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getAllUsuariosGestor(): Observable<UsuarioGestor[]> {
    const endpoint = `/usuarios_gestor?size=1000`;
    return this.apiService.request<{ _embedded: { usuarios_gestor: UsuarioGestor[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.usuarios_gestor.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getAllUsuariosGestorCenad(idCenad: string): Observable<UsuarioGestor[]> {
    const endpoint = `/cenads/${idCenad}/usuariosGestores?size=1000`;
    return this.apiService.request<{ _embedded: { usuarios_gestor: UsuarioGestor[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.usuarios_gestor.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getAllUsuariosNormal(): Observable<UsuarioNormal[]> {
    const endpoint = `/usuarios_normal?size=1000`;
    return this.apiService.request<{ _embedded: { usuarios_normal: UsuarioNormal[] } }>(endpoint, 'GET').pipe(
      map(res =>
        res._embedded?.usuarios_normal.map(item => ({ ...item, url: (item as any)._links?.self?.href })) || []
      ),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }

  getUsuarioAdministradorCenad(idCenad: string): Observable<UsuarioAdministrador | null> {
    const endpoint = `/cenads/${idCenad}/usuarioAdministrador`;
    return this.apiService.request<UsuarioAdministrador>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  getUsuarioAdministradorPorUsername(username: string): Observable<UsuarioAdministrador | null> {
    const endpoint = `/usuarios_administrador/search/findByUsername?username=${username}`;
    return this.apiService.request<UsuarioAdministrador>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  getUsuarioGestorPorUsername(username: string): Observable<UsuarioGestor | null> {
    const endpoint = `/usuarios_gestor/search/findByUsername?username=${username}`;
    return this.apiService.request<UsuarioGestor>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  getUsuarioGestorDeRecurso(idRecurso: string): Observable<UsuarioGestor | null> {
    const endpoint = `/recursos/${idRecurso}/usuarioGestor`;
    return this.apiService.request<UsuarioGestor>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }

  getUsuarioNormalPorUsername(username: string): Observable<UsuarioNormal | null> {
    const endpoint = `/usuarios_normal/search/findByUsername?username=${username}`;
    return this.apiService.request<UsuarioNormal>(endpoint, 'GET').pipe(
      map(res => ({ ...res, url: (res as any)._links?.self?.href })),
      catchError(err => { console.error(err); return of(null); })
    );
  }


  editarUsuarioSuperadministrador(username: string, tfno: string, email: string, emailAdmitido: boolean, descripcion: string, idUsuarioSuperadministrador: string): Observable<any> {
    const endpoint = `/usuarios_superadministrador/${idUsuarioSuperadministrador}`;
    return this.apiService.request<any>(endpoint, 'PATCH', { username, tfno, email, emailAdmitido, descripcion }).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha modificado el usuario ${username}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarUsuarioAdministrador(username: string, tfno: string, email: string, emailAdmitido: boolean, descripcion: string, idCenad: string, idUsuarioAdministrador: string): Observable<any> {
    const endpoint = `/usuarios_administrador/${idUsuarioAdministrador}`;
    const cenad = `${this.apiService.getUrlApi()}/cenads/${idCenad}`;
    return this.apiService.request<any>(endpoint, 'PATCH', { username, tfno, email, emailAdmitido, descripcion, cenad }).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha modificado el usuario ${username}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarUsuarioGestor(username: string, tfno: string, email: string, emailAdmitido: boolean, descripcion: string, idCenad: string, idUsuarioGestor: string): Observable<any> {
    const endpoint = `/usuarios_gestor/${idUsuarioGestor}`;
    const cenad = `${this.apiService.getUrlApi()}/cenads/${idCenad}`;
    return this.apiService.request<any>(endpoint, 'PATCH', { username, tfno, email, emailAdmitido, descripcion, cenad }).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha modificado el usuario ${username}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  editarUsuarioNormal(username: string, tfno: string, email: string, emailAdmitido: boolean, descripcion: string, idUnidad: string, idUsuarioNormal: string): Observable<any> {
    const endpoint = `/usuarios_normal/${idUsuarioNormal}`;
    const unidad = `${this.apiService.getUrlApi()}/unidades/${idUnidad}`;
    return this.apiService.request<any>(endpoint, 'PATCH', { username, tfno, email, emailAdmitido, descripcion, unidad }).pipe(
      map(res => !!res),
      tap(() => {
        this.utilService.toast(`Se ha modificado el usuario ${username}`, 'success');
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  deleteUsuario(idUsuario: string): Observable<any> {
    const endpoint = `/usuarios/${idUsuario}`;
    return this.apiService.request<any>(endpoint, 'DELETE').pipe(
      tap(res => {
        if (res) {
          console.log(`Usuario con id ${idUsuario} eliminado correctamente.`);
          let usuario = res;
          console.log(usuario);
          this.utilService.toast(`Se ha eliminado el usuario ${usuario?.username}`, 'success');
        }
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  // --- OBTENER DATOS DE USUARIO SEGUN ROL ---
  async getDatosUsuario(rol: string, username: string): Promise<{
    usuario: any; cenad?: Cenad | null; unidad?: Unidad | null
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
          this.apiService.request(
            `/usuarios_administrador/${usuario.idString}/cenad`,
            'GET',
            null
          )
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
          this.apiService.request(
            `/usuarios_gestor/${usuario.idString}/cenad`,
            'GET',
            null
          )
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
          this.apiService.request(
            `/usuarios_normal/${usuario.idString}/unidad`,
            'GET',
            null
          )
        );
        return { usuario, unidad };
      }
      case RolUsuario.Superadministrador: {
        const usuario: UsuarioSuperAdministrador = await firstValueFrom(
          this.apiService.request(
            `/usuarios_superadministrador/search/findByUsername?username=${username}`,
            'GET',
            null
          )
        );
        return { usuario };
      }
      default:
        throw new Error(`Rol desconocido: ${rol}`);
    }
  }
}

