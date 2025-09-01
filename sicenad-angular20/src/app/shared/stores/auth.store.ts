import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { CargaInicialStore } from './cargaInicial.store';
import { CenadStore } from './cenad.store';

@Injectable({ providedIn: 'root' })
export class AuthStore {

  private cargaInicial = inject(CargaInicialStore);
  private cargaCenad = inject(CenadStore);

  // --- STATE ---
  private _token = signal<string | null>(localStorage.getItem('token'));
  private _username = signal<string | null>(localStorage.getItem('username'));
  private _rol = signal<string | null>(localStorage.getItem('rol'));

  // --- GETTERS ---
  token = computed(() => this._token());
  username = computed(() => this._username());
  rol = computed(() => this._rol());
  isAuthenticated = computed(() => !!this._token());

  // --- EFFECTS ---
  private tokenInlocalStorage = void effect(() => {
    localStorage.setItem('token', this._token() ?? '');
  });
  private usernameInlocalStorage = void effect(() => {
    localStorage.setItem('username', this._username() ?? '');
  });
  private rolInlocalStorage = void effect(() => {
    localStorage.setItem('rol', this._rol() ?? '');
  });

  // --- ACTIONS ---

  loginSuccessfull(token: string, username: string, rol: string) {
    this.getDatosSeguridad(token, username, rol);
        this.cargaInicial.getDatosIniciales();
        this.cargaInicial.getDatosDeUsuario();
  }
  async logout() {
    this.borrarDatosSeguridad();
    this.cargaInicial.borrarDatosIniciales();
    this.cargaInicial.borrarDatosDeUsuario();
    this.cargaCenad.borrarDatosCenad();
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
