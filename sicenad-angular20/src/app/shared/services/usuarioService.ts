import { inject, Injectable, signal, Signal } from "@angular/core";
import { catchError, firstValueFrom, map, Observable, of } from "rxjs";
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

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiService = inject(ApiService);

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
    const url = `${this.apiService.getUrlApi()}/auth/login`;
    return this.apiService.postSinToken<LoginResponse>(url, { username, password });
  }
  // --- REQUEST REGISTER ---
  public register(username: string, password: string, tfno: string, email: string, emailAdmitido: boolean, descripcion: string, rol: string): Observable<RegisterResponse> {
    const url = `${this.apiService.getUrlApi()}/auth/register`;
    return this.apiService.postSinToken<RegisterResponse>(url, { username, password, tfno, email, emailAdmitido, descripcion, rol });
  }

  getAll(): Observable<Usuario[]> {
    const url = `${this.apiService.getUrlApi()}/usuarios?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { usuarios: Usuario[] } }>(url, 'GET').pipe(
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
    const url = `${this.apiService.getUrlApi()}/usuarios_superadministrador?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { usuarios_superadministrador: UsuarioSuperAdministrador[] } }>(url, 'GET').pipe(
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
    const url = `${this.apiService.getUrlApi()}/usuarios_administrador?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { usuarios_administrador: UsuarioAdministrador[] } }>(url, 'GET').pipe(
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
    const url = `${this.apiService.getUrlApi()}/usuarios_gestor?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { usuarios_gestor: UsuarioGestor[] } }>(url, 'GET').pipe(
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
    const url = `${this.apiService.getUrlApi()}/cenads/${idCenad}/usuariosGestores?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { usuarios_gestor: UsuarioGestor[] } }>(url, 'GET').pipe(
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
    const url = `${this.apiService.getUrlApi()}/usuarios_normal?size=1000`;
    return this.apiService.peticionConToken<{ _embedded: { usuarios_normal: UsuarioNormal[] } }>(url, 'GET').pipe(
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
  const url = `${this.apiService.getUrlApi()}/cenads/${idCenad}/usuarioAdministrador`;
  return this.apiService.peticionConToken<UsuarioAdministrador>(url, 'GET').pipe(
    map(res => ({...res, url: (res as any)._links?.self?.href})),
          catchError(err => { console.error(err); return of(null); })
  );
}













  async getDatosUsuario(rol: string, username: string): Promise<{
    usuario: any; cenad?: Cenad | null; unidad?: Unidad | null }> {
    switch (rol) {
      case 'Administrador': {
        const usuario: UsuarioAdministrador = await firstValueFrom(
          this.apiService.peticionConToken(
            `${this.apiService.getUrlApi()}/usuarios_administrador/search/findByUsername?username=${username}`,
            'GET',
            null
          )
        );
        const cenad: Cenad = await firstValueFrom(
          this.apiService.peticionConToken(
            `${this.apiService.getUrlApi()}/usuarios_administrador/${usuario.idString}/cenad`,
            'GET',
            null
          )
        );
        return { usuario, cenad };
      }
      case 'Gestor': {
        const usuario: UsuarioGestor = await firstValueFrom(
          this.apiService.peticionConToken(
            `${this.apiService.getUrlApi()}/usuarios_gestor/search/findByUsername?username=${username}`,
            'GET',
            null
          )
        );
        const cenad: Cenad = await firstValueFrom(
          this.apiService.peticionConToken(
            `${this.apiService.getUrlApi()}/usuarios_gestor/${usuario.idString}/cenad`,
            'GET',
            null
          )
        );
        return { usuario, cenad };
      }
      case 'Normal': {
        const usuario: UsuarioNormal = await firstValueFrom(
          this.apiService.peticionConToken(
            `${this.apiService.getUrlApi()}/usuarios_normal/search/findByUsername?username=${username}`,
            'GET',
            null
          )
        );
        const unidad: Unidad = await firstValueFrom(
          this.apiService.peticionConToken(
            `${this.apiService.getUrlApi()}/usuarios_normal/${usuario.idString}/unidad`,
            'GET',
            null
          )
        );
        return { usuario, unidad };
      }
      case 'Superadministrador': {
        const usuario: UsuarioSuperAdministrador = await firstValueFrom(
          this.apiService.peticionConToken(
            `${this.apiService.getUrlApi()}/usuarios_superadministrador/search/findByUsername?username=${username}`,
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

