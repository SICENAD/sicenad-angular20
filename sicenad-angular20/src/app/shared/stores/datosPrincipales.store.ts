import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { Cenad } from "@interfaces/models/cenad";
import { CategoriaFichero } from "@interfaces/models/categoriaFichero";
import { TipoFormulario } from "@interfaces/models/tipoFormulario";
import { Unidad } from "@interfaces/models/unidad";
import { Arma } from "@interfaces/models/arma";
import { UsuarioSuperAdministrador } from "@interfaces/models/usuarioSuperadministrador";
import { UsuarioAdministrador } from "@interfaces/models/usuarioAdministrador";
import { UsuarioNormal } from "@interfaces/models/usuarioNormal";
import { UtilsStore } from "./utils.store";

@Injectable({ providedIn: 'root' })
export class DatosPrincipalesStore {
  private utils = inject(UtilsStore);

  // --- STATE ---
  private _cenads = signal<Cenad[]>([]);
  private _categoriasFichero = signal<CategoriaFichero[]>([]);
  private _tiposFormulario = signal<TipoFormulario[]>([]);
  private _unidades = signal<Unidad[]>([]);
  private _armas = signal<Arma[]>([]);
  private _usuariosSuperadministrador = signal<UsuarioSuperAdministrador[]>([]);
  private _usuariosAdministrador = signal<UsuarioAdministrador[]>([]);
  private _usuariosNormal = signal<UsuarioNormal[]>([]);
  private _urlApi = signal<string | null>(null);

  // --- GETTERS ---
  cenads = computed(() => this._cenads());
  categoriasFichero = computed(() => this._categoriasFichero());
  tiposFormulario = computed(() => this._tiposFormulario());
  unidades = computed(() => this._unidades());
  armas = computed(() => this._armas());
  usuariosSuperadministrador = computed(() => this._usuariosSuperadministrador());
  usuariosAdministrador = computed(() => this._usuariosAdministrador());
  usuariosNormal = computed(() => this._usuariosNormal());
  urlApi = computed(() => this._urlApi());

  // --- EFFECTS ---
  private persist = effect(() => {
    localStorage.setItem('cenads', JSON.stringify(this._cenads()));
    localStorage.setItem('categoriasFichero', JSON.stringify(this._categoriasFichero()));
    localStorage.setItem('tiposFormulario', JSON.stringify(this._tiposFormulario()));
    localStorage.setItem('unidades', JSON.stringify(this._unidades()));
    localStorage.setItem('armas', JSON.stringify(this._armas()));
    localStorage.setItem('usuariosSuperadministrador', JSON.stringify(this._usuariosSuperadministrador()));
    localStorage.setItem('usuariosAdministrador', JSON.stringify(this._usuariosAdministrador()));
    localStorage.setItem('usuariosNormal', JSON.stringify(this._usuariosNormal()));
    localStorage.setItem('urlApi', JSON.stringify(this._urlApi() ?? ''));
  });

  constructor() {
    this.initializeLocalStorage();
  }

  // --- INIT ---
  private initializeLocalStorage() {
    const keys = ['cenads', 'categoriasFichero', 'tiposFormulario', 'unidades', 'armas', 'usuariosSuperadministrador', 'usuariosAdministrador', 'usuariosNormal'];
    keys.forEach(k => {
      if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify([]));
    });
    if (!localStorage.getItem('urlApi')) {
      // usa tu fuente de verdad (utils.urlApi() o environment.apiUrl)
      localStorage.setItem('urlApi', JSON.stringify(this.utils.urlApi() ?? ''));
    }

    this._cenads.set([...this.utils.parseJSON<Cenad[]>(localStorage.getItem('cenads'), [])]);
    this._categoriasFichero.set([...this.utils.parseJSON<CategoriaFichero[]>(localStorage.getItem('categoriasFichero'), [])]);
    this._tiposFormulario.set([...this.utils.parseJSON<TipoFormulario[]>(localStorage.getItem('tiposFormulario'), [])]);
    this._unidades.set([...this.utils.parseJSON<Unidad[]>(localStorage.getItem('unidades'), [])]);
    this._armas.set([...this.utils.parseJSON<Arma[]>(localStorage.getItem('armas'), [])]);
    this._usuariosSuperadministrador.set([...this.utils.parseJSON<UsuarioSuperAdministrador[]>(localStorage.getItem('usuariosSuperadministrador'), [])]);
    this._usuariosAdministrador.set([...this.utils.parseJSON<UsuarioAdministrador[]>(localStorage.getItem('usuariosAdministrador'), [])]);
    this._usuariosNormal.set([...this.utils.parseJSON<UsuarioNormal[]>(localStorage.getItem('usuariosNormal'), [])]);
    this._urlApi.set(this.utils.parseJSON<string>(localStorage.getItem('urlApi'),  this.utils.urlApi() ?? ''));
  }

  // --- MÉTODOS DE UTILIDAD: SET / ADD / REMOVE / CLEAR ---
  setCenads(c: Cenad[]) { this._cenads.set([...c]); }
  addCenad(c: Cenad) { this._cenads.update(arr => [...arr, c]); }
  removeCenad(id: string) { this._cenads.update(arr => arr.filter(x => x.idString !== id)); }
  clearCenads() { this._cenads.set([]); }

  setCategoriasFichero(c: CategoriaFichero[]) { this._categoriasFichero.set([...c]); }
  addCategoriaFichero(c: CategoriaFichero) { this._categoriasFichero.update(arr => [...arr, c]); }
  removeCategoriaFichero(id: string) { this._categoriasFichero.update(arr => arr.filter(x => x.idString !== id)); }
  clearCategoriasFichero() { this._categoriasFichero.set([]); }

  setTiposFormulario(c: TipoFormulario[]) { this._tiposFormulario.set([...c]); }
  addTipoFormulario(c: TipoFormulario) { this._tiposFormulario.update(arr => [...arr, c]); }
  removeTipoFormulario(id: string) { this._tiposFormulario.update(arr => arr.filter(x => x.idString !== id)); }
  clearTiposFormulario() { this._tiposFormulario.set([]); }

  setUnidades(c: Unidad[]) { this._unidades.set([...c]); }
  addUnidad(c: Unidad) { this._unidades.update(arr => [...arr, c]); }
  removeUnidad(id: string) { this._unidades.update(arr => arr.filter(x => x.idString !== id)); }
  clearUnidades() { this._unidades.set([]); }

  setArmas(c: Arma[]) { this._armas.set([...c]); }
  addArma(c: Arma) { this._armas.update(arr => [...arr, c]); }
  removeArma(id: string) { this._armas.update(arr => arr.filter(x => x.idString !== id)); }
  clearArmas() { this._armas.set([]); }

  setUsuariosSuperadministrador(c: UsuarioSuperAdministrador[]) { this._usuariosSuperadministrador.set([...c]); }
  addUsuarioSuperadministrador(c: UsuarioSuperAdministrador) { this._usuariosSuperadministrador.update(arr => [...arr, c]); }
  removeUsuarioSuperadministrador(id: string) { this._usuariosSuperadministrador.update(arr => arr.filter(x => x.idString !== id)); }
  clearUsuariosSuperadministrador() { this._usuariosSuperadministrador.set([]); }

  setUsuariosAdministrador(c: UsuarioAdministrador[]) { this._usuariosAdministrador.set([...c]); }
  addUsuarioAdministrador(c: UsuarioAdministrador) { this._usuariosAdministrador.update(arr => [...arr, c]); }
  removeUsuarioAdministrador(id: string) { this._usuariosAdministrador.update(arr => arr.filter(x => x.idString !== id)); }
  clearUsuariosAdministrador() { this._usuariosAdministrador.set([]); }

  setUsuariosNormal(c: UsuarioNormal[]) { this._usuariosNormal.set([...c]); }
  addUsuarioNormal(c: UsuarioNormal) { this._usuariosNormal.update(arr => [...arr, c]); }
  removeUsuarioNormal(id: string) { this._usuariosNormal.update(arr => arr.filter(x => x.idString !== id)); }
  clearUsuariosNormal() { this._usuariosNormal.set([]); }

  setUrlApi(url: string) { this._urlApi.set(url); }
  clearUrlApi() { this._urlApi.set(null); }

  // --- OTROS MÉTODOS ---
  loadFromLocalStorage() {
    this._cenads.set([...this.utils.parseJSON<Cenad[]>(localStorage.getItem('cenads'), [])]);
    this._categoriasFichero.set([...this.utils.parseJSON<CategoriaFichero[]>(localStorage.getItem('categoriasFichero'), [])]);
    this._tiposFormulario.set([...this.utils.parseJSON<TipoFormulario[]>(localStorage.getItem('tiposFormulario'), [])]);
    this._unidades.set([...this.utils.parseJSON<Unidad[]>(localStorage.getItem('unidades'), [])]);
    this._armas.set([...this.utils.parseJSON<Arma[]>(localStorage.getItem('armas'), [])]);
    this._usuariosSuperadministrador.set([...this.utils.parseJSON<UsuarioSuperAdministrador[]>(localStorage.getItem('usuariosSuperadministrador'), [])]);
    this._usuariosAdministrador.set([...this.utils.parseJSON<UsuarioAdministrador[]>(localStorage.getItem('usuariosAdministrador'), [])]);
    this._usuariosNormal.set([...this.utils.parseJSON<UsuarioNormal[]>(localStorage.getItem('usuariosNormal'), [])]);
    this._urlApi.set(this.utils.parseJSON<string>(localStorage.getItem('urlApi'), this.utils.urlApi() ?? ''));
  }
  borrarDatosIniciales() {
    this.clearCenads();
    this.clearCategoriasFichero();
    this.clearTiposFormulario();
    this.clearUnidades();
    this.clearArmas();
    this.clearUsuariosSuperadministrador();
    this.clearUsuariosAdministrador();
    this.clearUsuariosNormal();
    this.clearUrlApi();
  }
}



