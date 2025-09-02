import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { UtilsStore } from '@stores/utils.store';
import { Categoria } from '@interfaces/models/categoria';
import { Cartografia } from '@interfaces/models/cartografia';
import { Cenad } from '@interfaces/models/cenad';
import { Normativa } from '@interfaces/models/normativa';
import { Recurso } from '@interfaces/models/recurso';
import { Solicitud } from '@interfaces/models/solicitud';
import { UsuarioAdministrador } from '@interfaces/models/usuarioAdministrador';
import { UsuarioGestor } from '@interfaces/models/usuarioGestor';

@Injectable({ providedIn: 'root' })
export class CenadStore {
  private utils = inject(UtilsStore);

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

  // --- GETTERS ---
  categorias = computed(() => this._categorias());
  categoriasPadre = computed(() => this._categoriasPadre());
  recursos = computed(() => this._recursos());
  cartografias = computed(() => this._cartografias());
  normativas = computed(() => this._normativas());
  solicitudes = computed(() => this._solicitudes());
  usuariosGestor = computed(() => this._usuariosGestor());
  usuarioAdministrador = computed(() => this._usuarioAdministrador());
  cenadVisitado = computed(() => this._cenadVisitado());

  // --- EFFECTS (persistencia localStorage) ---
  private persist = effect(() => {
    localStorage.setItem('categorias', JSON.stringify(this._categorias()));
    localStorage.setItem('categoriasPadre', JSON.stringify(this._categoriasPadre()));
    localStorage.setItem('recursos', JSON.stringify(this._recursos()));
    localStorage.setItem('cartografias', JSON.stringify(this._cartografias()));
    localStorage.setItem('normativas', JSON.stringify(this._normativas()));
    localStorage.setItem('solicitudes', JSON.stringify(this._solicitudes()));
    localStorage.setItem('usuariosGestor', JSON.stringify(this._usuariosGestor()));
    localStorage.setItem('usuarioAdministrador', JSON.stringify(this._usuarioAdministrador()));
    localStorage.setItem('cenadVisitado', JSON.stringify(this._cenadVisitado()));
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
    this.initializeLocalStorage();
  }

  // --- INIT ---
  private initializeLocalStorage() {
    const arrayKeys = ['categorias', 'categoriasPadre', 'recursos', 'cartografias', 'normativas', 'solicitudes', 'usuariosGestor'];
    const objectKeys = ['usuarioAdministrador', 'cenadVisitado'];
    arrayKeys.forEach(k => {
      if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify([]));
    });
    objectKeys.forEach(k => {
      if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(null));
    });

    this._categorias.set([...this.utils.parseJSON<Categoria[]>(localStorage.getItem('categorias'), [])]);
    this._categoriasPadre.set([...this.utils.parseJSON<Categoria[]>(localStorage.getItem('categoriasPadre'), [])]);
    this._recursos.set([...this.utils.parseJSON<Recurso[]>(localStorage.getItem('recursos'), [])]);
    this._cartografias.set([...this.utils.parseJSON<Cartografia[]>(localStorage.getItem('cartografias'), [])]);
    this._normativas.set([...this.utils.parseJSON<Normativa[]>(localStorage.getItem('normativas'), [])]);
    this._solicitudes.set([...this.utils.parseJSON<Solicitud[]>(localStorage.getItem('solicitudes'), [])]);
    this._usuariosGestor.set([...this.utils.parseJSON<UsuarioGestor[]>(localStorage.getItem('usuariosGestor'), [])]);
    this._usuarioAdministrador.set(this.utils.parseJSON<UsuarioAdministrador | null>(localStorage.getItem('usuarioAdministrador'), null));
    this._cenadVisitado.set(this.utils.parseJSON<Cenad | null>(localStorage.getItem('cenadVisitado'), null));
  }

  // --- OTROS MÉTODOS ---
  loadFromLocalStorage() {
    this._categorias.set([...this.utils.parseJSON<Categoria[]>(localStorage.getItem('categorias'), [])]);
    this._categoriasPadre.set([...this.utils.parseJSON<Categoria[]>(localStorage.getItem('categoriasPadre'), [])]);
    this._recursos.set([...this.utils.parseJSON<Recurso[]>(localStorage.getItem('recursos'), [])]);
    this._cartografias.set([...this.utils.parseJSON<Cartografia[]>(localStorage.getItem('cartografias'), [])]);
    this._normativas.set([...this.utils.parseJSON<Normativa[]>(localStorage.getItem('normativas'), [])]);
    this._solicitudes.set([...this.utils.parseJSON<Solicitud[]>(localStorage.getItem('solicitudes'), [])]);
    this._usuariosGestor.set([...this.utils.parseJSON<UsuarioGestor[]>(localStorage.getItem('usuariosGestor'), [])]);
    this._usuarioAdministrador.set(this.utils.parseJSON<UsuarioAdministrador | null>(localStorage.getItem('usuarioAdministrador'), null));
    this._cenadVisitado.set(this.utils.parseJSON<Cenad | null>(localStorage.getItem('cenadVisitado'), null));
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
