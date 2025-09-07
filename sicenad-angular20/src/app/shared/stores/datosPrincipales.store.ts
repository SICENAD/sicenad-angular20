import { effect, inject, Injectable, signal } from "@angular/core";
import { Cenad } from "@interfaces/models/cenad";
import { CategoriaFichero } from "@interfaces/models/categoriaFichero";
import { TipoFormulario } from "@interfaces/models/tipoFormulario";
import { Unidad } from "@interfaces/models/unidad";
import { Arma } from "@interfaces/models/arma";
import { UsuarioSuperAdministrador } from "@interfaces/models/usuarioSuperadministrador";
import { UsuarioAdministrador } from "@interfaces/models/usuarioAdministrador";
import { UsuarioNormal } from "@interfaces/models/usuarioNormal";
import { LocalStorageService } from "@services/localStorageService";

@Injectable({ providedIn: 'root' })
export class DatosPrincipalesStore {
  private localStorageService = inject(LocalStorageService);

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
  private _minutosExpiracionLocalStorage = signal<number>(0);

  // --- GETTERS --- (usando computedAntiExpiracionLocalStorage)
  cenads = this.localStorageService.computedAntiExpiracionLocalStorage(this._cenads);
  categoriasFichero = this.localStorageService.computedAntiExpiracionLocalStorage(this._categoriasFichero);
  tiposFormulario = this.localStorageService.computedAntiExpiracionLocalStorage(this._tiposFormulario);
  unidades = this.localStorageService.computedAntiExpiracionLocalStorage(this._unidades);
  armas = this.localStorageService.computedAntiExpiracionLocalStorage(this._armas);
  usuariosSuperadministrador = this.localStorageService.computedAntiExpiracionLocalStorage(this._usuariosSuperadministrador);
  usuariosAdministrador = this.localStorageService.computedAntiExpiracionLocalStorage(this._usuariosAdministrador);
  usuariosNormal = this.localStorageService.computedAntiExpiracionLocalStorage(this._usuariosNormal);
  urlApi = this.localStorageService.computedAntiExpiracionLocalStorage(this._urlApi);
  minutosExpiracionLocalStorage = this.localStorageService.computedAntiExpiracionLocalStorage(this._minutosExpiracionLocalStorage);

  // --- EFFECTS (persistencia localStorage) ---
  private persist = effect(() => {
    this.localStorageService.setItem('cenads', this._cenads());
    this.localStorageService.setItem('categoriasFichero', this._categoriasFichero());
    this.localStorageService.setItem('tiposFormulario', this._tiposFormulario());
    this.localStorageService.setItem('unidades', this._unidades());
    this.localStorageService.setItem('armas', this._armas());
    this.localStorageService.setItem('usuariosSuperadministrador', this._usuariosSuperadministrador());
    this.localStorageService.setItem('usuariosAdministrador', this._usuariosAdministrador());
    this.localStorageService.setItem('usuariosNormal', this._usuariosNormal());
    this.localStorageService.setItem('urlApi', this._urlApi() ?? '');
    this.localStorageService.setItem('minutosExpiracionLocalStorage', this._minutosExpiracionLocalStorage() ?? 0);
  });

  constructor() {
    this.loadFromLocalStorage();
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

  setMinutosExpiracionLocalStorage(minutos: number) { this._minutosExpiracionLocalStorage.set(minutos); }
  clearMinutosExpiracionLocalStorage() { this._minutosExpiracionLocalStorage.set(0); }

  // --- OTROS MÉTODOS ---
  loadFromLocalStorage() {
    this._cenads.set([...this.localStorageService.getItem<Cenad[]>('cenads') || []]);
    this._categoriasFichero.set([...this.localStorageService.getItem<CategoriaFichero[]>('categoriasFichero') || []]);
    this._tiposFormulario.set([...this.localStorageService.getItem<TipoFormulario[]>('tiposFormulario') || []]);
    this._unidades.set([...this.localStorageService.getItem<Unidad[]>('unidades') || []]);
    this._armas.set([...this.localStorageService.getItem<Arma[]>('armas') || []]);
    this._usuariosSuperadministrador.set([...this.localStorageService.getItem<UsuarioSuperAdministrador[]>('usuariosSuperadministrador') || []]);
    this._usuariosAdministrador.set([...this.localStorageService.getItem<UsuarioAdministrador[]>('usuariosAdministrador') || []]);
    this._usuariosNormal.set([...this.localStorageService.getItem<UsuarioNormal[]>('usuariosNormal') || []]);
    this._urlApi.set(this.localStorageService.getItem<string>('urlApi') ?? '');
    this._minutosExpiracionLocalStorage.set(this.localStorageService.getItem<number>('minutosExpiracionLocalStorage') ?? 0);
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
    this.clearMinutosExpiracionLocalStorage();
  }
}
