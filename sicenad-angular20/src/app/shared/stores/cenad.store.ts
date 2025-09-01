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
import { firstValueFrom } from 'rxjs';
import { ApiService } from '@services/apiService';

@Injectable({ providedIn: 'root' })
export class CenadStore {
  private utils = inject(UtilsStore);
  private apiService = inject(ApiService);

  // --- STATE ---
  private _categorias = signal<Categoria[]>(this.utils.parseJSON<Categoria[]>(localStorage.getItem('categorias'), []));
  private _categoriasPadre = signal<Categoria[]>(this.utils.parseJSON<Categoria[]>(localStorage.getItem('categoriasPadre'), []));
  private _recursos = signal<Recurso[]>(this.utils.parseJSON<Recurso[]>(localStorage.getItem('recursos'), []));
  private _cartografias = signal<Cartografia[]>(this.utils.parseJSON<Cartografia[]>(localStorage.getItem('cartografias'), []));
  private _normativas = signal<Normativa[]>(this.utils.parseJSON<Normativa[]>(localStorage.getItem('normativas'), []));
  private _solicitudes = signal<Solicitud[]>(this.utils.parseJSON<Solicitud[]>(localStorage.getItem('solicitudes'), []));
  private _usuariosGestor = signal<UsuarioGestor[]>(this.utils.parseJSON<UsuarioGestor[]>(localStorage.getItem('usuariosGestor'), []));
  private _usuarioAdministrador = signal<UsuarioAdministrador | null>(
    this.utils.parseJSON<UsuarioAdministrador | null>(localStorage.getItem('usuarioAdministrador'), null)
  );
  private _cenadVisitado = signal<Cenad | null>(
    this.utils.parseJSON<Cenad | null>(localStorage.getItem('cenadVisitado'), null)
  );

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

  // --- EFFECTS ---
  private categoriasInlocalStorage = void effect(() => {
    localStorage.setItem('categorias', JSON.stringify(this._categorias()));
  });
  private categoriasPadreInlocalStorage = void effect(() => {
    localStorage.setItem('categoriasPadre', JSON.stringify(this._categoriasPadre()));
  });
  private recursosInlocalStorage = void effect(() => {
    localStorage.setItem('recursos', JSON.stringify(this._recursos()));
  });
  private cartografiasInlocalStorage = void effect(() => {
    localStorage.setItem('cartografias', JSON.stringify(this._cartografias()));
  });
  private normativasInlocalStorage = void effect(() => {
    localStorage.setItem('normativas', JSON.stringify(this._normativas()));
  });
  private solicitudesInlocalStorage = void effect(() => {
    localStorage.setItem('solicitudes', JSON.stringify(this._solicitudes()));
  });
  private usuariosGestorInlocalStorage = void effect(() => {
    localStorage.setItem('usuariosGestor', JSON.stringify(this._usuariosGestor()));
  });
  private usuarioAdministradorInlocalStorage = void effect(() => {
    localStorage.setItem('usuarioAdministrador', JSON.stringify(this._usuarioAdministrador()));
  });
  private cenadVisitadoInlocalStorage = void effect(() => {
    localStorage.setItem('cenadVisitado', JSON.stringify(this._cenadVisitado()));
  });

  // --- MÉTODOS DE UTILIDAD ---
  // Categorias
  addCategoria(c: Categoria) {
    this._categorias.update(arr => [...arr, c]);
  }
  removeCategoria(id: string) {
    this._categorias.update(arr => arr.filter(c => c.idString !== id));
  }
  clearCategorias() {
    this._categorias.set([]);
  }

  // Categorias Padre
  addCategoriaPadre(c: Categoria) {
    this._categoriasPadre.update(arr => [...arr, c]);
  }
  removeCategoriaPadre(id: string) {
    this._categoriasPadre.update(arr => arr.filter(c => c.idString !== id));
  }
  clearCategoriasPadre() {
    this._categoriasPadre.set([]);
  }

  // Recursos
  addRecurso(r: Recurso) {
    this._recursos.update(arr => [...arr, r]);
  }
  removeRecurso(id: string) {
    this._recursos.update(arr => arr.filter(r => r.idString !== id));
  }
  clearRecursos() {
    this._recursos.set([]);
  }

  // Cartografias
  addCartografia(c: Cartografia) {
    this._cartografias.update(arr => [...arr, c]);
  }
  removeCartografia(id: string) {
    this._cartografias.update(arr => arr.filter(c => c.idString !== id));
  }
  clearCartografias() {
    this._cartografias.set([]);
  }

  // Normativas
  addNormativa(n: Normativa) {
    this._normativas.update(arr => [...arr, n]);
  }
  removeNormativa(id: string) {
    this._normativas.update(arr => arr.filter(n => n.idString !== id));
  }
  clearNormativas() {
    this._normativas.set([]);
  }

  // Solicitudes
  addSolicitud(s: Solicitud) {
    this._solicitudes.update(arr => [...arr, s]);
  }
  removeSolicitud(id: string) {
    this._solicitudes.update(arr => arr.filter(s => s.idString !== id));
  }
  clearSolicitudes() {
    this._solicitudes.set([]);
  }

  // Usuarios Gestor
  addUsuarioGestor(u: UsuarioGestor) {
    this._usuariosGestor.update(arr => [...arr, u]);
  }
  removeUsuarioGestor(id: string) {
    this._usuariosGestor.update(arr => arr.filter(u => u.idString !== id));
  }
  clearUsuariosGestor() {
    this._usuariosGestor.set([]);
  }

  // UsuarioAdministrador
  setUsuarioAdministrador(usuario: UsuarioAdministrador) {
    this._usuarioAdministrador.set(usuario);
  }
  clearUsuarioAdministrador() {
    this._usuarioAdministrador.set(null);
  }

  // CenadVisitado
  setCenadVisitado(cenad: Cenad) {
    this._cenadVisitado.set(cenad);
  }
  clearCenadVisitado() {
    this._cenadVisitado.set(null);
  }

  // --- ACTIONS ---

  async getDatosCenad(idCenad:string) {
    try {
      const [
        usuarioAdministradorResp,
        cenadVisitadoResp,
        categoriasResp,
        categoriasPadreResp,
        recursosResp,
        cartografiasResp,
        normativasResp,
        solicitudesResp,
        usuariosGestorResp
      ] = await Promise.all([
        firstValueFrom(this.apiService.peticionConToken<UsuarioAdministrador>(
          `${this.utils.urlApi()}/cenads/${idCenad}/usuarioAdministrador`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<Cenad>(
          `${this.utils.urlApi()}/cenads/${idCenad}`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { categorias: Categoria[] } }>(
          `${this.utils.urlApi()}/cenads/${idCenad}/categorias`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { categorias: Categoria[] } }>(
          `${this.utils.urlApi()}/cenads/${idCenad}/categoriasPadre`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { recursos: Recurso[] } }>(
          `${this.utils.urlApi()}/cenads/${idCenad}/recursos`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { cartografias: Cartografia[] } }>(
          `${this.utils.urlApi()}/cenads/${idCenad}/cartografias`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { ficheros: Normativa[] } }>(
          `${this.utils.urlApi()}/cenads/${idCenad}/normativas`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { solicitudes: Solicitud[] } }>(
          `${this.utils.urlApi()}/cenads/${idCenad}/solicitudes`, 'GET', null
        )),
        firstValueFrom(this.apiService.peticionConToken<{ _embedded: { usuarios_gestor: UsuarioGestor[] } }>(
          `${this.utils.urlApi()}/cenads/${idCenad}/usuariosGestores`, 'GET', null
        ))
      ]);
      this._usuarioAdministrador.set(usuarioAdministradorResp ?? null);
      this._cenadVisitado.set(cenadVisitadoResp ?? null);
      this._categorias.set(categoriasResp._embedded?.categorias ?? []);
      this._categoriasPadre.set(categoriasPadreResp._embedded?.categorias ?? []);
      this._recursos.set(recursosResp._embedded?.recursos ?? []);
      this._cartografias.set(cartografiasResp._embedded?.cartografias ?? []);
      this._normativas.set(normativasResp._embedded?.ficheros ?? []);
      this._solicitudes.set(solicitudesResp._embedded?.solicitudes ?? []);
      this._usuariosGestor.set(usuariosGestorResp._embedded?.usuarios_gestor ?? []);

    } catch (err) {
      console.error('Error cargando datos iniciales del Cenad:', err);
    }
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
