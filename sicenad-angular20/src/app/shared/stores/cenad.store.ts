import { Injectable, signal, inject, effect } from '@angular/core';
import { Categoria } from '@interfaces/models/categoria';
import { Cartografia } from '@interfaces/models/cartografia';
import { Cenad } from '@interfaces/models/cenad';
import { Normativa } from '@interfaces/models/normativa';
import { Recurso } from '@interfaces/models/recurso';
import { Solicitud } from '@interfaces/models/solicitud';
import { UsuarioAdministrador } from '@interfaces/models/usuarioAdministrador';
import { UsuarioGestor } from '@interfaces/models/usuarioGestor';
import { LocalStorageService } from '@services/localStorageService';

@Injectable({ providedIn: 'root' })
export class CenadStore {
  private localStorageService = inject(LocalStorageService);

  // --- STATE ---
  private _categorias = signal<Categoria[]>([]);
  private _categoriasPadre = signal<Categoria[]>([]);
  private _recursos = signal<Recurso[]>([]);
  private _cartografias = signal<Cartografia[]>([]);
  private _normativas = signal<Normativa[]>([]);
  private _solicitudes = signal<Solicitud[]>([]);
  private _usuariosGestor = signal<UsuarioGestor[]>([]);
  private _usuarioAdministrador = signal<UsuarioAdministrador | null>(null);
  private _cenadVisitado = signal<Cenad | null>(null);

// --- GETTERS --- (usando computedAntiExpiracionLocalStorage)
  categorias = this.localStorageService.computedAntiExpiracionLocalStorage(this._categorias);
  categoriasPadre = this.localStorageService.computedAntiExpiracionLocalStorage(this._categoriasPadre);
  recursos = this.localStorageService.computedAntiExpiracionLocalStorage(this._recursos);
  cartografias = this.localStorageService.computedAntiExpiracionLocalStorage(this._cartografias);
  normativas = this.localStorageService.computedAntiExpiracionLocalStorage(this._normativas);
  solicitudes = this.localStorageService.computedAntiExpiracionLocalStorage(this._solicitudes);
  usuariosGestor = this.localStorageService.computedAntiExpiracionLocalStorage(this._usuariosGestor);
  usuarioAdministrador = this.localStorageService.computedAntiExpiracionLocalStorage(this._usuarioAdministrador);
  cenadVisitado = this.localStorageService.computedAntiExpiracionLocalStorage(this._cenadVisitado);

  // --- EFFECTS (persistencia localStorage) ---
  private persist = effect(() => {
    this.localStorageService.setItem('categorias', this._categorias());
    this.localStorageService.setItem('categoriasPadre', this._categoriasPadre());
    this.localStorageService.setItem('recursos', this._recursos());
    this.localStorageService.setItem('cartografias', this._cartografias());
    this.localStorageService.setItem('normativas', this._normativas());
    this.localStorageService.setItem('solicitudes', this._solicitudes());
    this.localStorageService.setItem('usuariosGestor', this._usuariosGestor());
    this.localStorageService.setItem('usuarioAdministrador', this._usuarioAdministrador());
    this.localStorageService.setItem('cenadVisitado', this._cenadVisitado());
  });

  // --- MÉTODOS DE UTILIDAD: SET / ADD / REMOVE / CLEAR ---
  // --- CATEGORIAS ---
  setCategorias(c: Categoria[]) { this._categorias.set([...c]); }
  addCategoria(c: Categoria) { this._categorias.update(arr => [...arr, c]); }
  removeCategoria(id: string) { this._categorias.update(arr => arr.filter(x => x.idString !== id)); }
  clearCategorias() { this._categorias.set([]); }

  // --- CATEGORIAS PADRE ---
  setCategoriasPadre(c: Categoria[]) { this._categoriasPadre.set([...c]); }
  addCategoriaPadre(c: Categoria) { this._categoriasPadre.update(arr => [...arr, c]); }
  removeCategoriaPadre(id: string) { this._categoriasPadre.update(arr => arr.filter(x => x.idString !== id)); }
  clearCategoriasPadre() { this._categoriasPadre.set([]); }

  // --- RECURSOS ---
  setRecursos(r: Recurso[]) { this._recursos.set([...r]); }
  addRecurso(r: Recurso) { this._recursos.update(arr => [...arr, r]); }
  removeRecurso(id: string) { this._recursos.update(arr => arr.filter(x => x.idString !== id)); }
  clearRecursos() { this._recursos.set([]); }

  // --- CARTOGRAFIAS ---
  setCartografias(c: Cartografia[]) { this._cartografias.set([...c]); }
  addCartografia(c: Cartografia) { this._cartografias.update(arr => [...arr, c]); }
  removeCartografia(id: string) { this._cartografias.update(arr => arr.filter(x => x.idString !== id)); }
  clearCartografias() { this._cartografias.set([]); }

  // --- NORMATIVAS ---
  setNormativas(n: Normativa[]) { this._normativas.set([...n]); }
  addNormativa(n: Normativa) { this._normativas.update(arr => [...arr, n]); }
  removeNormativa(id: string) { this._normativas.update(arr => arr.filter(x => x.idString !== id)); }
  clearNormativas() { this._normativas.set([]); }

  // --- SOLICITUDES ---
  setSolicitudes(s: Solicitud[]) { this._solicitudes.set([...s]); }
  addSolicitud(s: Solicitud) { this._solicitudes.update(arr => [...arr, s]); }
  removeSolicitud(id: string) { this._solicitudes.update(arr => arr.filter(x => x.idString !== id)); }
  clearSolicitudes() { this._solicitudes.set([]); }

  // --- USUARIOS GESTOR ---
  setUsuariosGestor(u: UsuarioGestor[]) { this._usuariosGestor.set([...u]); }
  addUsuarioGestor(u: UsuarioGestor) { this._usuariosGestor.update(arr => [...arr, u]); }
  removeUsuarioGestor(id: string) { this._usuariosGestor.update(arr => arr.filter(x => x.idString !== id)); }
  clearUsuariosGestor() { this._usuariosGestor.set([]); }

  // --- USUARIO ADMINISTRADOR ---
  setUsuarioAdministrador(u: UsuarioAdministrador) { this._usuarioAdministrador.set(u); }
  clearUsuarioAdministrador() { this._usuarioAdministrador.set(null); }

  // --- CENAD VISITADO ---
  setCenadVisitado(c: Cenad) { this._cenadVisitado.set(c); }
  clearCenadVisitado() { this._cenadVisitado.set(null); }

  constructor() {
    this.loadFromLocalStorage();
  }

  loadFromLocalStorage() {
    this._categorias.set([...this.localStorageService.getItem<Categoria[]>('categorias') || []]);
    this._categoriasPadre.set([...this.localStorageService.getItem<Categoria[]>('categoriasPadre') || []]);
    this._recursos.set([...this.localStorageService.getItem<Recurso[]>('recursos') || []]);
    this._cartografias.set([...this.localStorageService.getItem<Cartografia[]>('cartografias') || []]);
    this._normativas.set([...this.localStorageService.getItem<Normativa[]>('normativas') || []]);
    this._solicitudes.set([...this.localStorageService.getItem<Solicitud[]>('solicitudes') || []]);
    this._usuariosGestor.set([...this.localStorageService.getItem<UsuarioGestor[]>('usuariosGestor') || []]);
    this._usuarioAdministrador.set(this.localStorageService.getItem<UsuarioAdministrador | null>('usuarioAdministrador'));
    this._cenadVisitado.set(this.localStorageService.getItem<Cenad | null>('cenadVisitado'));
  }

  borrarDatosCenad() {
    this.clearUsuarioAdministrador();
    this.clearCenadVisitado();
    this.clearCategorias();
    this.clearCategoriasPadre();
    this.clearRecursos();
    this.clearCartografias();
    this.clearNormativas();
    this.clearSolicitudes();
    this.clearUsuariosGestor();
  }
}
