import { Injectable, inject } from "@angular/core";
import { forkJoin, Observable, of, tap, catchError } from "rxjs";
import { DatosPrincipalesStore } from "@stores/datosPrincipales.store";
import { CenadService } from "./cenadService";
import { Cenad } from "@interfaces/models/cenad";
import { TipoFormulario } from "@interfaces/models/tipoFormulario";
import { Unidad } from "@interfaces/models/unidad";
import { Arma } from "@interfaces/models/arma";
import { UsuarioSuperAdministrador } from "@interfaces/models/usuarioSuperadministrador";
import { UsuarioAdministrador } from "@interfaces/models/usuarioAdministrador";
import { UsuarioNormal } from "@interfaces/models/usuarioNormal";
import { CategoriaFichero } from "@interfaces/models/categoriaFichero";
import { ArmaService } from "./armaService";
import { CategoriaFicheroService } from "./categoriaFicheroService.ts";
import { TipoFormularioService } from "./tipoFormularioService.ts";
import { UnidadService } from "./unidadService";
import { UsuarioService } from "./usuarioService";
import { UtilsStore } from "@stores/utils.store";
import { AuthStore } from "@stores/auth.store";
import { UsuarioLogueadoStore } from "@stores/usuarioLogueado.store";
import { CenadStore } from "@stores/cenad.store";
import { Categoria } from "@interfaces/models/categoria";
import { CategoriaService } from "./categoriaService.ts";
import { Recurso } from "@interfaces/models/recurso";
import { RecursoService } from "./recursoService";
import { CartografiaService } from "./cartografiaService";
import { Cartografia } from "@interfaces/models/cartografia";
import { NormativaService } from "./normativaService";
import { Normativa } from "@interfaces/models/normativa";
import { SolicitudService } from "./solicitudService";
import { Solicitud } from "@interfaces/models/solicitud";
import { UsuarioGestor } from "@interfaces/models/usuarioGestor";
import { RegisterResponse } from "@interfaces/responses/registerResponse";
import { LoginResponse } from "@interfaces/responses/loginResponse";


@Injectable({ providedIn: 'root' })
export class OrquestadorService {
  private datosStore = inject(DatosPrincipalesStore);
  private utils = inject(UtilsStore);
  private auth = inject(AuthStore);
  private usuarioLogueadoStore = inject(UsuarioLogueadoStore);
  private cenadStore = inject(CenadStore);

  private cenadService = inject(CenadService);
  private categoriaFicheroService = inject(CategoriaFicheroService);
  private tipoFormularioService = inject(TipoFormularioService);
  private unidadService = inject(UnidadService);
  private armaService = inject(ArmaService);
  private usuarioService = inject(UsuarioService);
  private categoriaService = inject(CategoriaService);
  private recursoService = inject(RecursoService);
  private cartografiaService = inject(CartografiaService);
  private normativaService = inject(NormativaService);
  private solicitudService = inject(SolicitudService);

  /** Garantiza que el store tenga urlApi válida antes de usar servicios */
  private ensureUrlApi() {
    const current = this.datosStore.urlApi();
    if (!current || !current.trim()) {
      this.datosStore.setUrlApi(this.utils.urlApi() ?? '');
    }
  }
  // --- Inicializar todo desde localStorage + API ---
  initializeDatosPrincipales(): void {
    this.datosStore.loadFromLocalStorage();
    this.ensureUrlApi();            // <-- clave

    this.getDatosPrincipales().subscribe();
    this.datosStore.setUrlApi(this.utils.urlApi());
  }

  // --- ForkJoin multi-entidad ---
  getDatosPrincipales(): Observable<any> {
    this.ensureUrlApi();            // <-- clave
    return forkJoin({
      cenads: this.loadAllCenads(),
      categoriasFichero: this.categoriaFicheroService.getAll(),
      tiposFormulario: this.tipoFormularioService.getAll(),
      unidades: this.unidadService.getAll(),
      armas: this.armaService.getAll(),
      usuariosSuperadministrador: this.usuarioService.getAllUsuariosSuperadministrador(),
      usuariosAdministrador: this.usuarioService.getAllUsuariosAdministrador(),
      usuariosNormal: this.usuarioService.getAllUsuariosNormal(),
    }).pipe(
      tap(data => {
        this.datosStore.setCenads(data.cenads);
        this.datosStore.setCategoriasFichero(data.categoriasFichero);
        this.datosStore.setTiposFormulario(data.tiposFormulario);
        this.datosStore.setUnidades(data.unidades);
        this.datosStore.setArmas(data.armas);
        this.datosStore.setUsuariosSuperadministrador(data.usuariosSuperadministrador);
        this.datosStore.setUsuariosAdministrador(data.usuariosAdministrador);
        this.datosStore.setUsuariosNormal(data.usuariosNormal);
      })
    );
  }

  // --- ForkJoin multi-entidad ---
  getDatosDeCenad(idCenad: string): Observable<any> {
    return forkJoin({
      categorias: this.loadAllCategorias(idCenad),
      categoriasPadre: this.loadAllCategoriasPadre(idCenad),
      recursos: this.loadAllRecursos(idCenad),
      cartografias: this.loadAllCartografias(idCenad),
      normativas: this.loadAllNormativas(idCenad),
      solicitudes: this.loadAllSolicitudes(idCenad),
      usuariosGestor: this.loadAllUsuariosGestor(idCenad),
      usuarioAdministrador: this.loadUsuarioAdministradorCenad(idCenad),
      cenadVisitado: this.loadCenadVisitado(idCenad),
    }).pipe(
      tap(data => {
        this.cenadStore.setCategorias(data.categorias);
        this.cenadStore.setCategoriasPadre(data.categoriasPadre);
        this.cenadStore.setRecursos(data.recursos);
        this.cenadStore.setCartografias(data.cartografias);
        this.cenadStore.setNormativas(data.normativas);
        this.cenadStore.setSolicitudes(data.solicitudes);
        this.cenadStore.setUsuariosGestor(data.usuariosGestor);
        data.usuarioAdministrador ? this.cenadStore.setUsuarioAdministrador(data.usuarioAdministrador) : this.cenadStore.clearUsuarioAdministrador();
        data.cenadVisitado ? this.cenadStore.setCenadVisitado(data.cenadVisitado) : this.cenadStore.clearCenadVisitado();
      })
    );
  }

  // --- LOAD ALL individuales---
  loadAllCenads(): Observable<Cenad[]> {
    return this.cenadService.getAll().pipe(
      catchError(err => {
        console.error('Error cargando cenads', err);
        this.datosStore.clearCenads();
        return of([]);
      })
    );
  }

  loadAllCategoriasFichero(): Observable<CategoriaFichero[]> {
    return this.categoriaFicheroService.getAll().pipe(
      catchError(err => {
        console.error('Error cargando categorias de fichero', err);
        this.datosStore.clearCategoriasFichero();
        return of([]);
      })
    );
  }

  loadAllTiposFormulario(): Observable<TipoFormulario[]> {
    return this.tipoFormularioService.getAll().pipe(
      catchError(err => {
        console.error('Error cargando tipos de formulario', err);
        this.datosStore.clearTiposFormulario();
        return of([]);
      })
    );
  }

  loadAllUnidades(): Observable<Unidad[]> {
    return this.unidadService.getAll().pipe(
      catchError(err => {
        console.error('Error cargando unidades', err);
        this.datosStore.clearUnidades();
        return of([]);
      })
    );
  }

  loadAllArmas(): Observable<Arma[]> {
    return this.armaService.getAll().pipe(
      catchError(err => {
        console.error('Error cargando armas', err);
        this.datosStore.clearArmas();
        return of([]);
      })
    );
  }

  loadAllUsuariosSuperadministrador(): Observable<UsuarioSuperAdministrador[]> {
    return this.usuarioService.getAllUsuariosSuperadministrador().pipe(
      catchError(err => {
        console.error('Error cargando usuarios superadministrador', err);
        this.datosStore.clearUsuariosSuperadministrador();
        return of([]);
      })
    );
  }

  loadAllUsuariosAdministrador(): Observable<UsuarioAdministrador[]> {
    return this.usuarioService.getAllUsuariosAdministrador().pipe(
      catchError(err => {
        console.error('Error cargando usuarios administrador', err);
        this.datosStore.clearUsuariosAdministrador();
        return of([]);
      })
    );
  }

  loadAllUsuariosNormal(): Observable<UsuarioNormal[]> {
    return this.usuarioService.getAllUsuariosNormal().pipe(
      catchError(err => {
        console.error('Error cargando usuarios normal', err);
        this.datosStore.clearUsuariosNormal();
        return of([]);
      })
    );
  }

  // --- LOAD ALL de CENAD---
  loadAllCategorias(idCenad: string): Observable<Categoria[]> {
    return this.categoriaService.getAll(idCenad).pipe(
      catchError(err => {
        console.error('Error cargando categorias', err);
        this.cenadStore.clearCategorias();
        return of([]);
      })
    );
  }

  loadAllCategoriasPadre(idCenad: string): Observable<Categoria[]> {
    return this.categoriaService.getAllCategoriasPadre(idCenad).pipe(
      catchError(err => {
        console.error('Error cargando categorias padre', err);
        this.cenadStore.clearCategoriasPadre();
        return of([]);
      })
    );
  }

  loadAllRecursos(idCenad: string): Observable<Recurso[]> {
    return this.recursoService.getAll(idCenad).pipe(
      catchError(err => {
        console.error('Error cargando recursos', err);
        this.cenadStore.clearRecursos();
        return of([]);
      })
    );
  }

  loadAllCartografias(idCenad: string): Observable<Cartografia[]> {
    return this.cartografiaService.getAll(idCenad).pipe(
      catchError(err => {
        console.error('Error cargando cartografías', err);
        this.cenadStore.clearCartografias();
        return of([]);
      })
    );
  }

  loadAllNormativas(idCenad: string): Observable<Normativa[]> {
    return this.normativaService.getAll(idCenad).pipe(
      catchError(err => {
        console.error('Error cargando normativas', err);
        this.cenadStore.clearNormativas();
        return of([]);
      })
    );
  }

  loadAllSolicitudes(idCenad: string): Observable<Solicitud[]> {
    return this.solicitudService.getAll(idCenad).pipe(
      catchError(err => {
        console.error('Error cargando solicitudes', err);
        this.cenadStore.clearSolicitudes();
        return of([]);
      })
    );
  }

  loadAllUsuariosGestor(idCenad: string): Observable<UsuarioGestor[]> {
    return this.usuarioService.getAllUsuariosGestorCenad(idCenad).pipe(
      catchError(err => {
        console.error('Error cargando usuarios gestor', err);
        this.cenadStore.clearUsuariosGestor();
        return of([]);
      })
    );
  }

  loadUsuarioAdministradorCenad(idCenad: string): Observable<UsuarioAdministrador | null> {
    return this.usuarioService.getUsuarioAdministradorCenad(idCenad).pipe(
      catchError(err => {
        console.error('Error cargando usuario administrador', err);
        this.cenadStore.clearUsuarioAdministrador();
        return of(null);
      })
    );
  }

  loadCenadVisitado(idCenad: string): Observable<Cenad | null> {
    return this.cenadService.getCenadSeleccionado(idCenad).pipe(
      catchError(err => {
        console.error('Error cargando cenad visitado', err);
        this.cenadStore.clearCenadVisitado();
        return of(null);
      })
    );
  }

  // --- USUARIOS ---

  registerUsuario(
    username: string,
    password: string,
    tfno: string,
    email: string,
    emailAdmitido: boolean,
    descripcion: string,
    rol: string
  ): Observable<RegisterResponse> {
    return this.usuarioService.register(
      username,
      password,
      tfno,
      email,
      emailAdmitido,
      descripcion,
      rol
    ).pipe(
      tap(res => {
        console.log('✅ Registro correcto', res);
        this.loadAllUsuariosSuperadministrador();
      }),
      catchError(err => {
        console.error('❌ Error registrando usuario', err);
        throw err;
      })
    );
  }

  loginUsuario(
    username: string,
    password: string,
  ): Observable<LoginResponse> {
        this.ensureUrlApi();            // <-- clave

    return this.usuarioService.login(
      username,
      password
    ).pipe(
      tap(res => {
        console.log('✅ Login correcto', res);
      }),
      catchError(err => {
        console.error('❌ Error logueando usuario', err);
        throw err;
      })
    );
  }

  // --- CRUD Cenad ---

  // --- CRUD Cenad en OrquestadorService ---
  crearCenad(
    nombre: string,
    provincia: number,
    direccion: string,
    tfno: string,
    email: string,
    descripcion: string,
    archivoEscudo: File
  ): Observable<any> {
    return this.cenadService.crearCenad(
      nombre,
      provincia,
      direccion,
      tfno,
      email,
      descripcion,
      archivoEscudo
    ).pipe(
      tap(res => {
        if (res) {
          this.loadAllCenads();
          console.log(`Cenad ${nombre} creado correctamente.`);
        } else {
          console.warn(`Hubo un problema creando el cenad ${nombre}.`);
        }
      })
    );
  }

  actualizarCenad(
    nombre: string,
    provincia: number,
    direccion: string,
    tfno: string,
    email: string,
    descripcion: string,
    archivoEscudo: File | null,
    escudoActual: string,
    idCenad: string
  ): string {
    let nombreArchivo: string = '';
    this.cenadService.editarCenad(
      nombre,
      provincia,
      direccion,
      tfno,
      email,
      descripcion,
      archivoEscudo,
      escudoActual,
      idCenad
    ).pipe(
      tap(res => {
        if (res) {
          nombreArchivo = res;
          this.loadAllCenads(); // refresca la store
          console.log(`Cenad ${nombre} actualizado correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando el cenad ${nombre}.`);
        }
      })
    );
    return nombreArchivo;
  }

  borrarCenad(id: string): Observable<any> {
    return this.cenadService.deleteCenad(id).pipe(
      tap(res => {
        if (res) {
          console.log(`Cenad con id ${id} borrado correctamente.`);
          this.loadAllCenads(); // refresca la store
        } else {
          console.warn(`Hubo un problema borrando el cenad con id ${id}.`);
        }
      })
    );
  }


  /*
    // --- CRUD CategoriasFichero ---
    createCategoriaFichero(c: any): void {
      this.categoriaFicheroService.create(c).subscribe(() => this.loadAllCategoriasFichero());
    }
    updateCategoriaFichero(c: any): void {
      this.categoriaFicheroService.update(c).subscribe(() => this.loadAllCategoriasFichero());
    }
    deleteCategoriaFichero(id: string): void {
      this.categoriaFicheroService.delete(id).subscribe(() => this.loadAllCategoriasFichero());
    }

    // --- CRUD TiposFormulario ---
    createTipoFormulario(c: any): void {
      this.tipoFormularioService.create(c).subscribe(() => this.loadAllTiposFormulario());
    }
    updateTipoFormulario(c: any): void {
      this.tipoFormularioService.update(c).subscribe(() => this.loadAllTiposFormulario());
    }
    deleteTipoFormulario(id: string): void {
      this.tipoFormularioService.delete(id).subscribe(() => this.loadAllTiposFormulario());
    }

    // --- CRUD Unidades ---
    createUnidad(c: any): void {
      this.unidadService.create(c).subscribe(() => this.loadAllUnidades());
    }
    updateUnidad(c: any): void {
      this.unidadService.update(c).subscribe(() => this.loadAllUnidades());
    }
    deleteUnidad(id: string): void {
      this.unidadService.delete(id).subscribe(() => this.loadAllUnidades());
    }

    // --- CRUD Armas ---
    createArma(c: any): void {
      this.armaService.create(c).subscribe(() => this.loadAllArmas());
    }
    updateArma(c: any): void {
      this.armaService.update(c).subscribe(() => this.loadAllArmas());
    }
    deleteArma(id: string): void {
      this.armaService.delete(id).subscribe(() => this.loadAllArmas());
    }

    // --- CRUD UsuariosSuperadministrador ---
    createUsuarioSuper(c: any): void {
      this.usuarioSuperService.create(c).subscribe(() => this.loadAllUsuariosSuperadministrador());
    }
    updateUsuarioSuper(c: any): void {
      this.usuarioSuperService.update(c).subscribe(() => this.loadAllUsuariosSuperadministrador());
    }
    deleteUsuarioSuper(id: string): void {
      this.usuarioSuperService.delete(id).subscribe(() => this.loadAllUsuariosSuperadministrador());
    }

    // --- CRUD UsuariosAdministrador ---
    createUsuarioAdmin(c: any): void {
      this.usuarioAdminService.create(c).subscribe(() => this.loadAllUsuariosAdministrador());
    }
    updateUsuarioAdmin(c: any): void {
      this.usuarioAdminService.update(c).subscribe(() => this.loadAllUsuariosAdministrador());
    }
    deleteUsuarioAdmin(id: string): void {
      this.usuarioAdminService.delete(id).subscribe(() => this.loadAllUsuariosAdministrador());
    }

    // --- CRUD UsuariosNormal ---
    createUsuarioNormal(c: any): void {
      this.usuarioNormalService.create(c).subscribe(() => this.loadAllUsuariosNormal());
    }
    updateUsuarioNormal(c: any): void {
      this.usuarioNormalService.update(c).subscribe(() => this.loadAllUsuariosNormal());
    }
    deleteUsuarioNormal(id: string): void {
      this.usuarioNormalService.delete(id).subscribe(() => this.loadAllUsuariosNormal());
    }
  */

  // --- GETTERS ---
  getCenads(): Cenad[] { return this.datosStore.cenads(); }
  getCategoriasFichero(): CategoriaFichero[] { return this.datosStore.categoriasFichero(); }
  getTiposFormulario(): TipoFormulario[] { return this.datosStore.tiposFormulario(); }
  getUnidades(): Unidad[] { return this.datosStore.unidades(); }
  getArmas(): Arma[] { return this.datosStore.armas(); }
  getUsuariosSuperadministrador(): UsuarioSuperAdministrador[] { return this.datosStore.usuariosSuperadministrador(); }
  getUsuariosAdministrador(): UsuarioAdministrador[] { return this.datosStore.usuariosAdministrador(); }
  getUsuariosNormal(): UsuarioNormal[] { return this.datosStore.usuariosNormal(); }
  getUrlApi(): string | null { return this.datosStore.urlApi(); }
  getUsuarioLogueado() { return this.usuarioLogueadoStore.usuarioLogueado(); }
  getCenadPropio() { return this.usuarioLogueadoStore.cenadPropio(); }
  getUnidad() { return this.usuarioLogueadoStore.unidad(); }
  getcategoriasCenad(): Categoria[] { return this.cenadStore.categorias(); }
  getcategoriasPadreCenad(): Categoria[] { return this.cenadStore.categoriasPadre(); }
  getrecursosCenad(): Recurso[] { return this.cenadStore.recursos(); }
  getcartografiasCenad(): Cartografia[] { return this.cenadStore.cartografias(); }
  getnormativasCenad(): Normativa[] { return this.cenadStore.normativas(); }
  getsolicitudesCenad(): Solicitud[] { return this.cenadStore.solicitudes(); }
  getUsuariosGestorCenad(): UsuarioGestor[] { return this.cenadStore.usuariosGestor(); }
  getUsuarioAdministradorCenad(): UsuarioAdministrador | null { return this.cenadStore.usuarioAdministrador(); }
  getCenadVisitado(): Cenad | null { return this.cenadStore.cenadVisitado(); }












  async getDatosDeUsuario() {
    const rol = this.auth.rol()!;//obliga a que no sea nulo.si fuera nulo petaria, pero es que si fuera nulo no se ha logueado y no se lanza este metodo
    const username = this.auth.username()!;
    const { usuario, cenad, unidad } = await this.usuarioService.getDatosUsuario(rol, username);
    this.usuarioLogueadoStore.setUsuario(usuario);
    this.usuarioLogueadoStore.setCenadPropio(cenad ? cenad : null);
    this.usuarioLogueadoStore.setUnidad(unidad ? unidad : null);
  }
}
