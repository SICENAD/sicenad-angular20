import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { CenadStore } from './cenad.store';
import { DatosPrincipalesStore } from './datosPrincipales.store';
import { UsuarioLogueadoStore } from './usuarioLogueado.store';
import { Router } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { LocalStorageService } from '@services/localStorageService';

@Injectable({ providedIn: 'root' })
export class AuthStore {

  private localStorageService = inject(LocalStorageService);
  private usuarioLogueado = inject(UsuarioLogueadoStore);
  private cargaCenad = inject(CenadStore);
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private route = inject(Router);
  readonly routesPaths = RoutesPaths;

  // --- STATE ---
  private _token = signal<string | null>(this.localStorageService.getItem<string | null>('token'));
  private _username = signal<string | null>(this.localStorageService.getItem<string | null>('username'));
  private _rol = signal<string | null>(this.localStorageService.getItem<string | null>('rol'));


  // --- GETTERS --- (usando computedAntiExpiracionLocalStorage)
  token = this.localStorageService.computedAntiExpiracionLocalStorage(this._token);
  username = this.localStorageService.computedAntiExpiracionLocalStorage(this._username);
  rol = this.localStorageService.computedAntiExpiracionLocalStorage(this._rol);
  isAuthenticated = this.localStorageService.computedAntiExpiracionLocalStorage(
    computed(() => !!this._token())
  );

  constructor() {
    // Reaccionar a expiración automática
    this.localStorageService.setOnExpire(() => this.logout());
  }

  // --- EFFECTS ---
  private persistSeguridad = void effect(() => {
    this.localStorageService.setItem('token', this._token());
    this.localStorageService.setItem('username', this._username());
    this.localStorageService.setItem('rol', this._rol());
  });

  // --- ACTIONS ---
  async logout() {
    this.usuarioLogueado.borrarDatosDeUsuario();
    this.datosPrincipalesStore.borrarDatosIniciales();
    this.cargaCenad.borrarDatosCenad();
    this.borrarDatosSeguridad();
    this.route.navigate([this.routesPaths.home]);
  }

  getDatosSeguridad(token: string, username: string, rol: string) {
    this._token.set(token);
    this._username.set(username);
    this._rol.set(rol);
  }

  borrarDatosSeguridad() {
    this._username.set(null);
    this._rol.set(null);
    this._token.set(null);
  }
}
