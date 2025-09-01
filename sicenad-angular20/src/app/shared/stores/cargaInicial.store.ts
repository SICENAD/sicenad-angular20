import { Injectable, signal, computed, inject, effect, Injector } from '@angular/core';
import { UtilsStore } from '@stores/utils.store';
import { firstValueFrom } from 'rxjs';
import { Cenad } from '@interfaces/models/cenad';
import { CategoriaFichero } from '@interfaces/models/categoriaFichero';
import { TipoFormulario } from '@interfaces/models/tipoFormulario';
import { Unidad } from '@interfaces/models/unidad';
import { Arma } from '@interfaces/models/arma';
import { UsuarioSuperAdministrador } from '@interfaces/models/usuarioSuperadministrador';
import { UsuarioAdministrador } from '@interfaces/models/usuarioAdministrador';
import { UsuarioNormal } from '@interfaces/models/usuarioNormal';
import { Usuario } from '@interfaces/models/usuario';
import { ApiService } from '@services/apiService';
import { UsuarioGestor } from '@interfaces/models/usuarioGestor';
import { AuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export class CargaInicialStore {
  private injector = inject(Injector); // Injector general
  private utils = inject(UtilsStore);
  private apiService = inject(ApiService);

  // getter para authStore, se resuelve solo cuando se usa
  private get auth(): AuthStore {
    return this.injector.get(AuthStore);
  }

  // --- STATE ---
  private _cenads = signal<Cenad[]>(this.utils.parseJSON<Cenad[]>(localStorage.getItem('cenads'), []));
  private _categoriasFichero = signal<CategoriaFichero[]>(this.utils.parseJSON<CategoriaFichero[]>(localStorage.getItem('categoriasFichero'), []));
  private _tiposFormulario = signal<TipoFormulario[]>(this.utils.parseJSON<TipoFormulario[]>(localStorage.getItem('tiposFormulario'), []));
  private _unidades = signal<Unidad[]>(this.utils.parseJSON<Unidad[]>(localStorage.getItem('unidades'), []));
  private _armas = signal<Arma[]>(this.utils.parseJSON<Arma[]>(localStorage.getItem('armas'), []));
  private _usuariosSuperadministrador = signal<UsuarioSuperAdministrador[]>(this.utils.parseJSON<UsuarioSuperAdministrador[]>(localStorage.getItem('usuariosSuperadministrador'), []));
  private _usuariosAdministrador = signal<UsuarioAdministrador[]>(this.utils.parseJSON<UsuarioAdministrador[]>(localStorage.getItem('usuariosAdministrador'), []));
  private _usuariosNormal = signal<UsuarioNormal[]>(this.utils.parseJSON<UsuarioNormal[]>(localStorage.getItem('usuariosNormal'), []));
  private _cenadPropio = signal<Cenad | null>(this.utils.parseJSON<Cenad | null>(localStorage.getItem('cenadPropio'), null));
  private _unidad = signal<Unidad | null>(this.utils.parseJSON<Unidad | null>(localStorage.getItem('unidad'), null));
  private _usuario = signal<Usuario | null>(this.utils.parseJSON<Usuario | null>(localStorage.getItem('usuario'), null));
  private _urlApi = signal<string | null>(localStorage.getItem('urlApi'));

  // --- GETTERS ---
  cenads = computed(() => this._cenads());
  categoriasFichero = computed(() => this._categoriasFichero());
  tiposFormulario = computed(() => this._tiposFormulario());
  unidades = computed(() => this._unidades());
  armas = computed(() => this._armas());
  usuariosSuperadministrador = computed(() => this._usuariosSuperadministrador());
  usuariosAdministrador = computed(() => this._usuariosAdministrador());
  usuariosNormal = computed(() => this._usuariosNormal());
  cenadPropio = computed(() => this._cenadPropio());
  unidad = computed(() => this._unidad());
  usuario = computed(() => this._usuario());
  urlApi = computed(() => this._urlApi());

  // --- EFFECTS ---
  private cenadsInlocalStorage = void effect(() => {
    localStorage.setItem('cenads', JSON.stringify(this._cenads()));
  });
  private categoriasFicheroInlocalStorage = void effect(() => {
    localStorage.setItem('categoriasFichero', JSON.stringify(this._categoriasFichero()));
  });
  private tiposFormularioInlocalStorage = void effect(() => {
    localStorage.setItem('tiposFormulario', JSON.stringify(this._tiposFormulario()));
  });
  private unidadesInlocalStorage = void effect(() => {
    localStorage.setItem('unidades', JSON.stringify(this._unidades()));
  });
  private armasInlocalStorage = void effect(() => {
    localStorage.setItem('armas', JSON.stringify(this._armas()));
  });
  private usuariosSuperadministradorInlocalStorage = void effect(() => {
    localStorage.setItem('usuariosSuperadministrador', JSON.stringify(this._usuariosSuperadministrador()));
  });
  private usuariosAdministradorInlocalStorage = void effect(() => {
    localStorage.setItem('usuariosAdministrador', JSON.stringify(this._usuariosAdministrador()));
  });
  private usuariosNormalInlocalStorage = void effect(() => {
    localStorage.setItem('usuariosNormal', JSON.stringify(this._usuariosNormal()));
  });
  private cenadPropioInlocalStorage = void effect(() => {
    localStorage.setItem('cenadPropio', JSON.stringify(this._cenadPropio()));
  });
  private unidadInlocalStorage = void effect(() => {
    localStorage.setItem('unidad', JSON.stringify(this._unidad()));
  });
  private usuarioInlocalStorage = void effect(() => {
    localStorage.setItem('usuario', JSON.stringify(this._usuario()));
  });
  // --- EFFECTS ---
  private urlApiInlocalStorage = void effect(() => {
    localStorage.setItem('urlApi', this._urlApi() ?? '');
  });

  // --- MÉTODOS DE UTILIDAD ---

  // Cenads
  addCenad(cenad: Cenad) {
    this._cenads.update(arr => [...arr, cenad]);
  }
  removeCenad(idString: string) {
    this._cenads.update(arr => arr.filter(c => c.idString !== idString));
  }
  clearCenads() {
    this._cenads.set([]);
  }

  // Categorias Fichero
  addCategoriaFichero(cat: CategoriaFichero) {
    this._categoriasFichero.update(arr => [...arr, cat]);
  }
  removeCategoriaFichero(id: string) {
    this._categoriasFichero.update(arr => arr.filter(c => c.idString !== id));
  }
  clearCategoriasFichero() {
    this._categoriasFichero.set([]);
  }

  // Tipos Formulario
  addTipoFormulario(tipo: TipoFormulario) {
    this._tiposFormulario.update(arr => [...arr, tipo]);
  }
  removeTipoFormulario(id: string) {
    this._tiposFormulario.update(arr => arr.filter(t => t.idString !== id));
  }
  clearTiposFormulario() {
    this._tiposFormulario.set([]);
  }

  // Unidades
  addUnidad(unidad: Unidad) {
    this._unidades.update(arr => [...arr, unidad]);
  }
  removeUnidad(id: string) {
    this._unidades.update(arr => arr.filter(u => u.idString !== id));
  }
  clearUnidades() {
    this._unidades.set([]);
  }

  // Armas
  addArma(arma: Arma) {
    this._armas.update(arr => [...arr, arma]);
  }
  removeArma(id: string) {
    this._armas.update(arr => arr.filter(a => a.idString !== id));
  }
  clearArmas() {
    this._armas.set([]);
  }

  // Usuarios Superadministrador
  addUsuarioSuperadministrador(u: UsuarioSuperAdministrador) {
    this._usuariosSuperadministrador.update(arr => [...arr, u]);
  }
  removeUsuarioSuperadministrador(id: string) {
    this._usuariosSuperadministrador.update(arr => arr.filter(u => u.idString !== id));
  }
  clearUsuariosSuperadministrador() {
    this._usuariosSuperadministrador.set([]);
  }

  // Usuarios Administrador
  addUsuarioAdministrador(u: UsuarioAdministrador) {
    this._usuariosAdministrador.update(arr => [...arr, u]);
  }
  removeUsuarioAdministrador(id: string) {
    this._usuariosAdministrador.update(arr => arr.filter(u => u.idString !== id));
  }
  clearUsuariosAdministrador() {
    this._usuariosAdministrador.set([]);
  }

  // Usuarios Normal
  addUsuarioNormal(u: UsuarioNormal) {
    this._usuariosNormal.update(arr => [...arr, u]);
  }
  removeUsuarioNormal(id: string) {
    this._usuariosNormal.update(arr => arr.filter(u => u.idString !== id));
  }
  clearUsuariosNormal() {
    this._usuariosNormal.set([]);
  }

  // Usuario
  setUsuario(usuario: Usuario) {
    this._usuario.set(usuario);
  }
  clearUsuario() {
    this._usuario.set(null as any);
  }

  // Unidad
  setUnidad(unidad: Unidad) {
    this._unidad.set(unidad);
  }
  clearUnidad() {
    this._unidad.set(null as any);
  }

  // CenadPropio
  setCenadPropio(cenad: Cenad) {
    this._cenadPropio.set(cenad);
  }
  clearCenadPropio() {
    this._cenadPropio.set(null as any);
  }

  clearUrlApi() {
    this._urlApi.set(null);
  }
  // --- ACTIONS ---

  async getDatosIniciales() {
    try {
      const [
        cenadsResp,
        categoriasResp,
        tiposFormularioResp,
        unidadesResp,
        armasResp,
        usuariosSuperResp,
        usuariosAdminResp,
        usuariosNormalResp
      ] = await Promise.all([
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { cenads: Cenad[] } }>(
          `${this.utils.urlApi()}/cenads`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { categorias_fichero: CategoriaFichero[] } }>(
          `${this.utils.urlApi()}/categorias_fichero`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { tipos_formulario: TipoFormulario[] } }>(
          `${this.utils.urlApi()}/tipos_formulario`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { unidades: Unidad[] } }>(
          `${this.utils.urlApi()}/unidades`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { armas: Arma[] } }>(
          `${this.utils.urlApi()}/armas`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { usuarios_superadministrador: UsuarioSuperAdministrador[] } }>(
          `${this.utils.urlApi()}/usuarios_superadministrador`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { usuarios_administrador: UsuarioAdministrador[] } }>(
          `${this.utils.urlApi()}/usuarios_administrador`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { usuarios_normal: UsuarioNormal[] } }>(
          `${this.utils.urlApi()}/usuarios_normal`, 'GET', null
        )),
      ]);
      this._cenads.set(cenadsResp._embedded?.cenads ?? []);
      this._categoriasFichero.set(categoriasResp._embedded?.categorias_fichero ?? []);
      this._tiposFormulario.set(tiposFormularioResp._embedded?.tipos_formulario ?? []);
      this._unidades.set(unidadesResp._embedded?.unidades ?? []);
      this._armas.set(armasResp._embedded?.armas ?? []);
      this._usuariosSuperadministrador.set(usuariosSuperResp._embedded?.usuarios_superadministrador ?? []);
      this._usuariosAdministrador.set(usuariosAdminResp._embedded?.usuarios_administrador ?? []);
      this._usuariosNormal.set(usuariosNormalResp._embedded?.usuarios_normal ?? []);

    } catch (err) {
      console.error('Error cargando datos iniciales:', err);
    }
    this._urlApi.set(this.utils.urlApi());
  }

  async getDatosDeUsuario() {
    try {
      const rolActual = this.auth.rol();
      const usernameActual = this.auth.username();

      if (rolActual === 'Administrador') {
        const usuarioData: UsuarioAdministrador = await firstValueFrom(
          this.apiService.peticionConToken(
            `${this.utils.urlApi()}/usuarios_administrador/search/findByUsername?username=${usernameActual}`,
            'GET',
            null
          )
        );
        this._usuario.set(usuarioData);

        const cenadData: Cenad = await firstValueFrom(
          this.apiService.peticionConToken(
            `${this.utils.urlApi()}/usuarios_administrador/${usuarioData.idString}/cenad`,
            'GET',
            null
          )
        );
        this._cenadPropio.set(cenadData);
      }

      if (rolActual === 'Gestor') {
        const usuarioData: UsuarioGestor = await firstValueFrom(
          this.apiService.peticionConToken(
            `${this.utils.urlApi()}/usuarios_gestor/search/findByUsername?username=${usernameActual}`,
            'GET',
            null
          )
        );
        this._usuario.set(usuarioData);

        const cenadData: Cenad = await firstValueFrom(
          this.apiService.peticionConToken(
            `${this.utils.urlApi()}/usuarios_gestor/${usuarioData.idString}/cenad`,
            'GET',
            null
          )
        );
        this._cenadPropio.set(cenadData);
      }

      if (rolActual === 'Normal') {
        const usuarioData: UsuarioNormal = await firstValueFrom(
          this.apiService.peticionConToken(
            `${this.utils.urlApi()}/usuarios_normal/search/findByUsername?username=${usernameActual}`,
            'GET',
            null
          )
        );
        this._usuario.set(usuarioData);

        const unidadData: Unidad = await firstValueFrom(
          this.apiService.peticionConToken(
            `${this.utils.urlApi()}/usuarios_normal/${usuarioData.idString}/unidad`,
            'GET',
            null
          )
        );
        this._unidad.set(unidadData);
      }

      if (rolActual === 'Superadministrador') {
        const usuarioData: UsuarioSuperAdministrador = await firstValueFrom(
          this.apiService.peticionConToken(
            `${this.utils.urlApi()}/usuarios_superadministrador/search/findByUsername?username=${usernameActual}`,
            'GET',
            null
          )
        );
        this._usuario.set(usuarioData);
      }

    } catch (err) {
      console.error('Error cargando datos estáticos del usuario:', err);
    }
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
  borrarDatosDeUsuario() {
    this.clearCenadPropio();
    this.clearUnidad();
    this.clearUsuario();
  }
}
