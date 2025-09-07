import { effect, inject, Injectable, signal } from "@angular/core";
import { Cenad } from "@interfaces/models/cenad";
import { Unidad } from "@interfaces/models/unidad";
import { Usuario } from "@interfaces/models/usuario";
import { LocalStorageService } from "@services/localStorageService";

@Injectable({ providedIn: 'root' })
export class UsuarioLogueadoStore {
  private localStorageService = inject(LocalStorageService);

  // --- STATE ---
  private _cenadPropio = signal<Cenad | null>(null);
  private _unidad = signal<Unidad | null>(null);
  private _usuarioLogueado = signal<Usuario | null>(null);

// --- GETTERS --- (usando computedAntiExpiracionLocalStorage)
  cenadPropio = this.localStorageService.computedAntiExpiracionLocalStorage(this._cenadPropio);
  unidad = this.localStorageService.computedAntiExpiracionLocalStorage(this._unidad);
  usuarioLogueado = this.localStorageService.computedAntiExpiracionLocalStorage(this._usuarioLogueado);


// --- EFFECTS ---
  private persist = effect(() => {
    this.localStorageService.setItem('cenadPropio', this._cenadPropio());
    this.localStorageService.setItem('unidad', this._unidad());
    this.localStorageService.setItem('usuarioLogueado', this._usuarioLogueado());
  });

  constructor() {
    this.loadFromLocalStorage();
  }

  // --- MÉTODOS DE UTILIDAD: SET / ADD / REMOVE / CLEAR ---
   setCenadPropio(c: Cenad | null) { this._cenadPropio.set(c); }
  clearCenadPropio() { this._cenadPropio.set(null); }

  setUnidad(u: Unidad | null) { this._unidad.set(u); }
  clearUnidad() { this._unidad.set(null); }

  setUsuario(u: Usuario | null) { this._usuarioLogueado.set(u); }
  clearUsuario() { this._usuarioLogueado.set(null); }

  loadFromLocalStorage() {
    this._cenadPropio.set(this.localStorageService.getItem<Cenad | null>('cenadPropio'));
    this._unidad.set(this.localStorageService.getItem<Unidad | null>('unidad'));
    this._usuarioLogueado.set(this.localStorageService.getItem<Usuario | null>('usuarioLogueado'));
  }

  borrarDatosDeUsuario() {
    this.clearCenadPropio();
    this.clearUnidad();
    this.clearUsuario();
  }
}



