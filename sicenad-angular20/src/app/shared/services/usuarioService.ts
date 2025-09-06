import { inject, Injectable, signal, Signal } from "@angular/core";
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

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiService = inject(ApiService);
  private utilService = inject(UtilService);
  private usuarios = signal<Usuario[]>([]);
  private usuarios_superadministrador = signal<UsuarioSuperAdministrador[]>([]);
  private usuarios_administrador = signal<UsuarioAdministrador[]>([]);
  private usuarios_gestor = signal<UsuarioGestor[]>([]);
  private usuarios_normal = signal<UsuarioNormal[]>([]);
  private usuario = signal<Usuario | null>(null);
  private usuario_superadministrador = signal<UsuarioSuperAdministrador | null>(null);
  private usuario_administrador = signal<UsuarioAdministrador | null>(null);
  private usuario_gestor = signal<UsuarioGestor | null>(null);
  private usuario_normal = signal<UsuarioNormal | null>(null);

  getUsuarios(): Signal<Usuario[]> {
    return this.usuarios;
  }
  getUsuariosSuperAdministrador(): Signal<UsuarioSuperAdministrador[]> {
    return this.usuarios_superadministrador;
  }
  getUsuariosAdministrador(): Signal<UsuarioAdministrador[]> {
    return this.usuarios_administrador;
  }
  getUsuariosGestor(): Signal<UsuarioGestor[]> {
    return this.usuarios_gestor;
  }
  getUsuariosNormal(): Signal<UsuarioNormal[]> {
    return this.usuarios_normal;
  }
  getUsuario(): Signal<Usuario | null> {
    return this.usuario;
  }
  getUsuarioSuperAdministrador(): Signal<UsuarioSuperAdministrador | null> {
    return this.usuario_superadministrador;
  }
  getUsuarioAdministrador(): Signal<UsuarioAdministrador | null> {
    return this.usuario_administrador;
  }
  getUsuarioGestor(): Signal<UsuarioGestor | null> {
    return this.usuario_gestor;
  }
  getUsuarioNormal(): Signal<UsuarioNormal | null> {
    return this.usuario_normal;
  }

  // --- REQUEST LOGIN ---
  public login(username: string, password: string): Observable<LoginResponse> {
    const endpoint = `/auth/login`;
    return this.apiService.postSinToken<LoginResponse>(endpoint, { username, password });
  }
  // --- REQUEST REGISTER ---
  public register(username: string, password: string, tfno: string, email: string, emailAdmitido: boolean, descripcion: string, rol: string): Observable<RegisterResponse> {
    const endpoint = `/auth/register`;
    return this.apiService.postSinToken<RegisterResponse>(endpoint, { username, password, tfno, email, emailAdmitido, descripcion, rol });
  }

  getAll(): Observable<Usuario[]> {
    const endpoint = `/usuarios?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { usuarios: Usuario[] } }>(endpoint, 'GET').pipe(
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
    return this.apiService.peticionConToken<{ _embedded: { usuarios_superadministrador: UsuarioSuperAdministrador[] } }>(endpoint, 'GET').pipe(
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
    return this.apiService.peticionConToken<{ _embedded: { usuarios_administrador: UsuarioAdministrador[] } }>(endpoint, 'GET').pipe(
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
    return this.apiService.peticionConToken<{ _embedded: { usuarios_gestor: UsuarioGestor[] } }>(endpoint, 'GET').pipe(
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
    return this.apiService.peticionConToken<{ _embedded: { usuarios_gestor: UsuarioGestor[] } }>(endpoint, 'GET').pipe(
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
    return this.apiService.peticionConToken<{ _embedded: { usuarios_normal: UsuarioNormal[] } }>(endpoint, 'GET').pipe(
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
  return this.apiService.peticionConToken<UsuarioAdministrador>(endpoint, 'GET').pipe(
    map(res => ({...res, url: (res as any)._links?.self?.href})),
          catchError(err => { console.error(err); return of(null); })
  );
}









  editarUsuarioSuperadministrador(username: string, tfno: string, email: string, emailAdmitido: boolean, descripcion: string, idUsuarioSuperadministrador: string): Observable<any> {
    const endpoint = `/usuarios_superadministrador/${idUsuarioSuperadministrador}`;
    return this.apiService.peticionConToken<any>(endpoint, 'PATCH', { username, tfno, email, emailAdmitido, descripcion }).pipe(
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
    return this.apiService.peticionConToken<any>(endpoint, 'DELETE').pipe(
      tap(res => {
        if (res) {
          console.log(`Usuario con id ${idUsuario} eliminado correctamente.`);
          this.usuario.set(res);
          console.log(this.usuario());
          this.utilService.toast(`Se ha eliminado el usuario ${this.usuario()?.username}`, 'success');
        }
      }),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }











  async getDatosUsuario(rol: string, username: string): Promise<{
    usuario: any; cenad?: Cenad | null; unidad?: Unidad | null }> {
    switch (rol) {
      case RolUsuario.Administrador: {
        const usuario: UsuarioAdministrador = await firstValueFrom(
          this.apiService.peticionConToken(
            `/usuarios_administrador/search/findByUsername?username=${username}`,
            'GET',
            null
          )
        );
        const cenad: Cenad = await firstValueFrom(
          this.apiService.peticionConToken(
            `/usuarios_administrador/${usuario.idString}/cenad`,
            'GET',
            null
          )
        );
        return { usuario, cenad };
      }
      case RolUsuario.Gestor: {
        const usuario: UsuarioGestor = await firstValueFrom(
          this.apiService.peticionConToken(
            `/usuarios_gestor/search/findByUsername?username=${username}`,
            'GET',
            null
          )
        );
        const cenad: Cenad = await firstValueFrom(
          this.apiService.peticionConToken(
            `/usuarios_gestor/${usuario.idString}/cenad`,
            'GET',
            null
          )
        );
        return { usuario, cenad };
      }
      case RolUsuario.Normal: {
        const usuario: UsuarioNormal = await firstValueFrom(
          this.apiService.peticionConToken(
            `/usuarios_normal/search/findByUsername?username=${username}`,
            'GET',
            null
          )
        );
        const unidad: Unidad = await firstValueFrom(
          this.apiService.peticionConToken(
            `/usuarios_normal/${usuario.idString}/unidad`,
            'GET',
            null
          )
        );
        return { usuario, unidad };
      }
      case RolUsuario.Superadministrador: {
        const usuario: UsuarioSuperAdministrador = await firstValueFrom(
          this.apiService.peticionConToken(
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

