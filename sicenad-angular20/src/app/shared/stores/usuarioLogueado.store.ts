import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { Cenad } from "@interfaces/models/cenad";
import { Unidad } from "@interfaces/models/unidad";
import { UtilsStore } from "./utils.store";
import { Usuario } from "@interfaces/models/usuario";

@Injectable({ providedIn: 'root' })
export class UsuarioLogueadoStore {
  private utils = inject(UtilsStore);

  // --- STATE ---
  private _cenadPropio = signal<Cenad | null>(null);
  private _unidad = signal<Unidad | null>(null);
  private _usuarioLogueado = signal<Usuario | null>(null);

  //GETTERS
  cenadPropio = computed(() => this._cenadPropio());
  unidad = computed(() => this._unidad());
  usuarioLogueado = computed(() => this._usuarioLogueado());

// --- EFFECTS ---
  private persist = effect(() => {
    localStorage.setItem('cenadPropio', JSON.stringify(this._cenadPropio()));
    localStorage.setItem('unidad', JSON.stringify(this._unidad()));
    localStorage.setItem('usuarioLogueado', JSON.stringify(this._usuarioLogueado()));
  });

  constructor() {
    this.initializeLocalStorage();
  }

  // --- INIT ---
  private initializeLocalStorage() {
    const keys = ['cenadPropio', 'unidad', 'usuarioLogueado'];
    keys.forEach(k => {
      if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(null));
    });

    this._cenadPropio.set(this.utils.parseJSON<Cenad | null>(localStorage.getItem('cenadPropio'), null));
    this._unidad.set(this.utils.parseJSON<Unidad | null>(localStorage.getItem('unidad'), null));
    this._usuarioLogueado.set(this.utils.parseJSON<Usuario | null>(localStorage.getItem('usuarioLogueado'), null));
  }

  // --- MÉTODOS DE UTILIDAD: SET / ADD / REMOVE / CLEAR ---
   setCenadPropio(c: Cenad | null) { this._cenadPropio.set(c); }
  clearCenadPropio() { this._cenadPropio.set(null); }

  setUnidad(u: Unidad | null) { this._unidad.set(u); }
  clearUnidad() { this._unidad.set(null); }

  setUsuario(u: Usuario | null) { this._usuarioLogueado.set(u); }
  clearUsuario() { this._usuarioLogueado.set(null); }

  loadFromLocalStorage() {
    this._cenadPropio.set(this.utils.parseJSON<Cenad | null>(localStorage.getItem('cenadPropio'), null));
    this._unidad.set(this.utils.parseJSON<Unidad | null>(localStorage.getItem('unidad'), null));
    this._usuarioLogueado.set(this.utils.parseJSON<Usuario | null>(localStorage.getItem('usuarioLogueado'), null));
  }

  borrarDatosDeUsuario() {
    this.clearCenadPropio();
    this.clearUnidad();
    this.clearUsuario();
  }
}



