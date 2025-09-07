import { Injectable, inject } from "@angular/core";
import { forkJoin, Observable, of, tap, catchError, map, switchMap } from "rxjs";
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
import { RolUsuario } from "@interfaces/enums/rolUsuario.enum";


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
      this.datosStore.setMinutosExpiracionLocalStorage(this.utils.minutosExpiracionLocalStorage() ?? 0);
    }
  }
  // --- Inicializar todo desde localStorage + API ---
  initializeDatosPrincipales(): void {
    this.datosStore.loadFromLocalStorage();
    this.ensureUrlApi();            // <-- clave

    this.getDatosPrincipales().subscribe();
    this.datosStore.setUrlApi(this.utils.urlApi());
    this.datosStore.setMinutosExpiracionLocalStorage(this.utils.minutosExpiracionLocalStorage());
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

  registerUsuarioSuperadministrador(
    username: string,
    password: string,
    tfno: string,
    email: string,
    emailAdmitido: boolean,
    descripcion: string,
  ): Observable<RegisterResponse> {
    return this.registerUsuario(
      username,
      password,
      tfno,
      email,
      emailAdmitido,
      descripcion,
      RolUsuario.Superadministrador
    ).pipe(
      tap(() => this.loadAllUsuariosSuperadministrador().subscribe())
    );
  }

  registerUsuarioAdministrador(
    username: string,
    password: string,
    tfno: string,
    email: string,
    emailAdmitido: boolean,
    descripcion: string,
    idCenad: string
  ): Observable<RegisterResponse> {
    return this.registerUsuario(
      username,
      password,
      tfno,
      email,
      emailAdmitido,
      descripcion,
      RolUsuario.Administrador
    ).pipe(
      switchMap(registerRes =>
        this.loadUsuarioAdministradorPorUsername(username).pipe(
          switchMap(usuario => {
            if (!usuario) {
              console.warn(`No se encontró Usuario Administrador con username ${username} tras el registro.`);
              return of(registerRes); // devolvemos el resultado del registro aunque no se pueda actualizar
            }
            // Editamos el usuario para asignarle el CENAD
            return this.actualizarUsuarioAdministrador(
              username,
              tfno,
              email,
              emailAdmitido,
              descripcion,
              idCenad,
              usuario.idString
            ).pipe(
              map(() => registerRes) // seguimos devolviendo la respuesta del registro original
            );
          })
        )
      ),
      tap(() => {
        this.loadAllUsuariosAdministrador().subscribe();
      }),
      catchError(err => {
        console.error('Error en registerUsuarioAdministrador:', err);
        return of(null as unknown as RegisterResponse);
      })
    );
  }

  registerUsuarioGestor(
    username: string,
    password: string,
    tfno: string,
    email: string,
    emailAdmitido: boolean,
    descripcion: string,
    idCenad: string
  ): Observable<RegisterResponse> {
    return this.registerUsuario(
      username,
      password,
      tfno,
      email,
      emailAdmitido,
      descripcion,
      RolUsuario.Gestor
    ).pipe(
      switchMap(registerRes =>
        this.loadUsuarioGestorPorUsername(username).pipe(
          switchMap(usuario => {
            if (!usuario) {
              console.warn(`No se encontró Usuario Administrador con username ${username} tras el registro.`);
              return of(registerRes); // devolvemos el resultado del registro aunque no se pueda actualizar
            }
            // Editamos el usuario para asignarle el CENAD
            return this.actualizarUsuarioGestor(
              username,
              tfno,
              email,
              emailAdmitido,
              descripcion,
              idCenad,
              usuario.idString
            ).pipe(
              map(() => registerRes) // seguimos devolviendo la respuesta del registro original
            );
          })
        )
      ),
      tap(() => {
        this.loadAllUsuariosGestor(idCenad).subscribe();
      }),
      catchError(err => {
        console.error('Error en registerUsuarioGestor:', err);
        return of(null as unknown as RegisterResponse);
      })
    );
  }

  registerUsuarioNormal(
    username: string,
    password: string,
    tfno: string,
    email: string,
    emailAdmitido: boolean,
    descripcion: string,
    idUnidad: string
  ): Observable<RegisterResponse> {
    return this.registerUsuario(
      username,
      password,
      tfno,
      email,
      emailAdmitido,
      descripcion,
      RolUsuario.Normal
    ).pipe(
      switchMap(registerRes =>
        this.loadUsuarioNormalPorUsername(username).pipe(
          switchMap(usuario => {
            if (!usuario) {
              console.warn(`No se encontró Usuario Normal con username ${username} tras el registro.`);
              return of(registerRes); // devolvemos el resultado del registro aunque no se pueda actualizar
            }
            // Editamos el usuario para asignarle el CENAD
            return this.actualizarUsuarioNormal(
              username,
              tfno,
              email,
              emailAdmitido,
              descripcion,
              idUnidad,
              usuario.idString
            ).pipe(
              map(() => registerRes) // seguimos devolviendo la respuesta del registro original
            );
          })
        )
      ),
      tap(() => {
        this.loadAllUsuariosNormal().subscribe();
      }),
      catchError(err => {
        console.error('Error en registerUsuarioNormal:', err);
        return of(null as unknown as RegisterResponse);
      })
    );
  }

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
      }),
      catchError(err => {
        console.error('❌ Error registrando usuario', err);
        throw err;
      })
    );
  }

  // --- CRUD UsuariosSuperadministrador ---
  actualizarUsuarioSuperadministrador(username: string, tfno: string, email: string, emailAdmitido: boolean, descripcion: string, idUsuarioSuperadministrador: string): Observable<any> {
    return this.usuarioService.editarUsuarioSuperadministrador(username, tfno, email, emailAdmitido, descripcion, idUsuarioSuperadministrador).pipe(
      tap(res => {
        if (res) {
          this.loadAllUsuariosSuperadministrador().pipe(
            tap(usuarios => this.datosStore.setUsuariosSuperadministrador(usuarios))
          ).subscribe();
          console.log(`Usuario Superadministrador ${username} actualizado correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando el Usuario Superadministrador ${username}.`);
        }
      })
    );
  }
  borrarUsuarioSuperadministrador(id: string): Observable<any> {
    return this.usuarioService.deleteUsuario(id).pipe(
      tap(res => {
        if (res) {
          this.loadAllUsuariosSuperadministrador().pipe(
            tap(usuarios => this.datosStore.setUsuariosSuperadministrador(usuarios))
          ).subscribe();
          console.log(`Usuario Superadministrador con id ${id} borrado correctamente.`);
        } else {
          console.warn(`Hubo un problema borrando el Usuario Superadministrador con id ${id}.`);
        }
      })
    );
  }

  // --- CRUD UsuariosAdministrador ---
  loadUsuarioAdministradorPorUsername(username: string): Observable<UsuarioAdministrador | null> {
    return this.usuarioService.getUsuarioAdministradorPorUsername(username).pipe(
      catchError(err => {
        console.error('Error cargando usuario administrador', err);
        return of(null);
      })
    );
  }

  actualizarUsuarioAdministrador(username: string, tfno: string, email: string, emailAdmitido: boolean, descripcion: string, idCenad: string, idUsuarioAdministrador: string): Observable<any> {
    return this.usuarioService.editarUsuarioAdministrador(username, tfno, email, emailAdmitido, descripcion, idCenad, idUsuarioAdministrador).pipe(
      tap(res => {
        if (res) {
          this.loadAllUsuariosAdministrador().pipe(
            tap(usuarios => this.datosStore.setUsuariosAdministrador(usuarios))
          ).subscribe();
          console.log(`Usuario Administrador ${username} actualizado correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando el Usuario Administrador ${username}.`);
        }
      })
    );
  }
  borrarUsuarioAdministrador(id: string): Observable<any> {
    return this.usuarioService.deleteUsuario(id).pipe(
      tap(res => {
        if (res) {
          this.loadAllUsuariosAdministrador().pipe(
            tap(usuarios => this.datosStore.setUsuariosAdministrador(usuarios))
          ).subscribe();
          console.log(`Usuario Administrador con id ${id} borrado correctamente.`);
        } else {
          console.warn(`Hubo un problema borrando el Usuario Administrador con id ${id}.`);
        }
      })
    );
  }

  // --- CRUD UsuariosGestor ---
  loadUsuarioGestorPorUsername(username: string): Observable<UsuarioGestor | null> {
    return this.usuarioService.getUsuarioGestorPorUsername(username).pipe(
      catchError(err => {
        console.error('Error cargando usuario gestor', err);
        return of(null);
      })
    );
  }

  actualizarUsuarioGestor(username: string, tfno: string, email: string, emailAdmitido: boolean, descripcion: string, idCenad: string, idUsuarioGestor: string): Observable<any> {
    return this.usuarioService.editarUsuarioGestor(username, tfno, email, emailAdmitido, descripcion, idCenad, idUsuarioGestor).pipe(
      tap(res => {
        if (res) {
          this.loadAllUsuariosGestor(idCenad).pipe(
            tap(usuarios => this.cenadStore.setUsuariosGestor(usuarios))
          ).subscribe();
          console.log(`Usuario Gestor ${username} actualizado correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando el Usuario Gestor ${username}.`);
        }
      })
    );
  }
  borrarUsuarioGestor(idCenad: string, idUsuario: string): Observable<any> {
    return this.usuarioService.deleteUsuario(idUsuario).pipe(
      tap(res => {
        if (res) {
          this.loadAllUsuariosGestor(idCenad).pipe(
            tap(usuarios => this.cenadStore.setUsuariosGestor(usuarios))
          ).subscribe();
          console.log(`Usuario Gestor con id ${idUsuario} borrado correctamente.`);
        } else {
          console.warn(`Hubo un problema borrando el Usuario Gestor con id ${idUsuario}.`);
        }
      })
    );
  }

  // --- CRUD UsuariosNormal ---
  loadUsuarioNormalPorUsername(username: string): Observable<UsuarioNormal | null> {
    return this.usuarioService.getUsuarioNormalPorUsername(username).pipe(
      catchError(err => {
        console.error('Error cargando usuario normal', err);
        return of(null);
      })
    );
  }

  actualizarUsuarioNormal(username: string, tfno: string, email: string, emailAdmitido: boolean, descripcion: string, idUnidad: string, idUsuarioNormal: string): Observable<any> {
    return this.usuarioService.editarUsuarioNormal(username, tfno, email, emailAdmitido, descripcion, idUnidad, idUsuarioNormal).pipe(
      tap(res => {
        if (res) {
          this.loadAllUsuariosNormal().pipe(
            tap(usuarios => this.datosStore.setUsuariosNormal(usuarios))
          ).subscribe();
          console.log(`Usuario Normal ${username} actualizado correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando el Usuario Normal ${username}.`);
        }
      })
    );
  }
  borrarUsuarioNormal(id: string): Observable<any> {
    return this.usuarioService.deleteUsuario(id).pipe(
      tap(res => {
        if (res) {
          this.loadAllUsuariosNormal().pipe(
            tap(usuarios => this.datosStore.setUsuariosNormal(usuarios))
          ).subscribe();
          console.log(`Usuario Normal con id ${id} borrado correctamente.`);
        } else {
          console.warn(`Hubo un problema borrando el Usuario Normal con id ${id}.`);
        }
      })
    );
  }

  // --- CRUD Cenad ---
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
          this.loadAllCenads().pipe(
            tap(cenads => this.datosStore.setCenads(cenads))
          ).subscribe();
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
  ): Observable<any> {
    return this.cenadService.editarCenad(
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
          this.loadAllCenads().pipe(
            tap(cenads => this.datosStore.setCenads(cenads))
          ).subscribe(); console.log(`Cenad ${nombre} actualizado correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando el cenad ${nombre}.`);
        }
      })
    );
  }

  borrarCenad(id: string): Observable<any> {
    return this.cenadService.deleteCenad(id).pipe(
      tap(res => {
        if (res) {
          console.log(`Cenad con id ${id} borrado correctamente.`);
          this.loadAllCenads().pipe(
            tap(cenads => this.datosStore.setCenads(cenads))
          ).subscribe();
        } else {
          console.warn(`Hubo un problema borrando el cenad con id ${id}.`);
        }
      })
    );
  }

  getEscudoCenad(escudo: string, idCenad: string): Observable<Blob> {
    return this.cenadService.getEscudo(escudo, idCenad);
  }

  loadCenadDeAdministrador(idUsuarioAdministrador: string): Observable<Cenad | null> {
    return this.cenadService.getCenadDeAdministrador(idUsuarioAdministrador).pipe(
      catchError(err => {
        console.error('Error cargando cenad del administrador', err);
        return of(null);
      })
    );
  }

  loadCenadDeGestor(idUsuarioGestor: string): Observable<Cenad | null> {
    return this.cenadService.getCenadDeGestor(idUsuarioGestor).pipe(
      catchError(err => {
        console.error('Error cargando cenad del gestor', err);
        return of(null);
      })
    );
  }

  loadCenadsSinAdmin(): Observable<Cenad[] | null> {
    return this.cenadService.getCenadsSinAdmin().pipe(
      catchError(err => {
        console.error('Error cargando cenads', err);
        return of([]);
      })
    );
  }

  // --- CRUD Armas ---
  crearArma(nombre: string, tipoTiro: string): Observable<any> {
    return this.armaService.crearArma(nombre, tipoTiro).pipe(
      tap(res => {
        if (res) {
          this.loadAllArmas().pipe(
            tap(armas => this.datosStore.setArmas(armas))
          ).subscribe();
          console.log(`Arma ${nombre} creada correctamente.`);
        } else {
          console.warn(`Hubo un problema creando el arma ${nombre}.`);
        }
      })
    );
  }
  actualizarArma(nombre: string, tipoTiro: string, idArma: string): Observable<any> {
    return this.armaService.editarArma(nombre, tipoTiro, idArma).pipe(
      tap(res => {
        if (res) {
          this.loadAllArmas().pipe(
            tap(armas => this.datosStore.setArmas(armas))
          ).subscribe();
          console.log(`Arma ${nombre} actualizada correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando el arma ${nombre}.`);
        }
      })
    );
  }
  borrarArma(id: string): Observable<any> {
    return this.armaService.deleteArma(id).pipe(
      tap(res => {
        if (res) {
          this.loadAllArmas().pipe(
            tap(armas => this.datosStore.setArmas(armas))
          ).subscribe();
          console.log(`Arma con id ${id} borrada correctamente.`);
        } else {
          console.warn(`Hubo un problema borrando el arma con id ${id}.`);
        }
      })
    );
  }

  // --- CRUD Unidades ---
  crearUnidad(nombre: string, descripcion: string, email: string, tfno: string, direccion: string, poc: string): Observable<any> {
    return this.unidadService.crearUnidad(nombre, descripcion, email, tfno, direccion, poc).pipe(
      tap(res => {
        if (res) {
          this.loadAllUnidades().pipe(
            tap(unidades => this.datosStore.setUnidades(unidades))
          ).subscribe();
          console.log(`Unidad ${nombre} creada correctamente.`);
        } else {
          console.warn(`Hubo un problema creando la unidad ${nombre}.`);
        }
      })
    );
  }
  actualizarUnidad(nombre: string, descripcion: string, email: string, tfno: string, direccion: string, poc: string, idUnidad: string): Observable<any> {
    return this.unidadService.editarUnidad(nombre, descripcion, email, tfno, direccion, poc, idUnidad).pipe(
      tap(res => {
        if (res) {
          this.loadAllUnidades().pipe(
            tap(unidades => this.datosStore.setUnidades(unidades))
          ).subscribe();
          console.log(`Unidad ${nombre} actualizada correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando la unidad ${nombre}.`);
        }
      })
    );
  }
  borrarUnidad(id: string): Observable<any> {
    return this.unidadService.deleteUnidad(id).pipe(
      tap(res => {
        if (res) {
          this.loadAllUnidades().pipe(
            tap(unidades => this.datosStore.setUnidades(unidades))
          ).subscribe();
          console.log(`Unidad con id ${id} borrada correctamente.`);
        } else {
          console.warn(`Hubo un problema borrando la unidad con id ${id}.`);
        }
      })
    );
  }

  loadUnidadDeUsuarioNormal(idUsuarioNormal: string): Observable<Unidad | null> {
    return this.cenadService.getUnidadDeUsuarioNormal(idUsuarioNormal).pipe(
      catchError(err => {
        console.error('Error cargando unidad del usuario normal', err);
        return of(null);
      })
    );
  }

  // --- CRUD TiposFormulario ---
  crearTipoFormulario(nombre: string, descripcion: string): Observable<any> {
    return this.tipoFormularioService.crearTipoFormulario(nombre, descripcion).pipe(
      tap(res => {
        if (res) {
          this.loadAllTiposFormulario().pipe(
            tap(tipos => this.datosStore.setTiposFormulario(tipos))
          ).subscribe();
          console.log(`Tipo de formulario ${nombre} creado correctamente.`);
        } else {
          console.warn(`Hubo un problema creando el tipo de formulario ${nombre}.`);
        }
      })
    );
  }
  actualizarTipoFormulario(nombre: string, descripcion: string, idTipoFormulario: string): Observable<any> {
    return this.tipoFormularioService.editarTipoFormulario(nombre, descripcion, idTipoFormulario).pipe(
      tap(res => {
        if (res) {
          this.loadAllTiposFormulario().pipe(
            tap(tipos => this.datosStore.setTiposFormulario(tipos))
          ).subscribe();
          console.log(`Tipo de formulario ${nombre} actualizado correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando el tipo de formulario ${nombre}.`);
        }
      })
    );
  }
  borrarTipoFormulario(id: string): Observable<any> {
    return this.tipoFormularioService.deleteTipoFormulario(id).pipe(
      tap(res => {
        if (res) {
          this.loadAllTiposFormulario().pipe(
            tap(tipos => this.datosStore.setTiposFormulario(tipos))
          ).subscribe();
          console.log(`Tipo de formulario con id ${id} borrado correctamente.`);
        } else {
          console.warn(`Hubo un problema borrando el tipo de formulario con id ${id}.`);
        }
      })
    );
  }

  // --- CRUD CategoriasFichero ---
  crearCategoriaFichero(nombre: string, tipo: number, descripcion: string): Observable<any> {
    return this.categoriaFicheroService.crearCategoriaFichero(nombre, tipo, descripcion).pipe(
      tap(res => {
        if (res) {
          this.loadAllCategoriasFichero().pipe(
            tap(categorias => this.datosStore.setCategoriasFichero(categorias))
          ).subscribe();
          console.log(`Categoría de fichero ${nombre} creada correctamente.`);
        } else {
          console.warn(`Hubo un problema creando la categoría de fichero ${nombre}.`);
        }
      })
    );
  }
  actualizarCategoriaFichero(nombre: string, tipo: number, descripcion: string, idCategoriaFichero: string): Observable<any> {
    return this.categoriaFicheroService.editarCategoriaFichero(nombre, tipo, descripcion, idCategoriaFichero).pipe(
      tap(res => {
        if (res) {
          this.loadAllCategoriasFichero().pipe(
            tap(categorias => this.datosStore.setCategoriasFichero(categorias))
          ).subscribe();
          console.log(`Categoría de fichero ${nombre} actualizada correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando la categoría de fichero ${nombre}.`);
        }
      })
    );
  }
  borrarCategoriaFichero(id: string): Observable<any> {
    return this.categoriaFicheroService.deleteCategoriaFichero(id).pipe(
      tap(res => {
        if (res) {
          this.loadAllCategoriasFichero().pipe(
            tap(categorias => this.datosStore.setCategoriasFichero(categorias))
          ).subscribe();
          console.log(`Categoría de fichero con id ${id} borrada correctamente.`);
        } else {
          console.warn(`Hubo un problema borrando la categoría de fichero con id ${id}.`);
        }
      })
    );
  }

  // --- CRUD Cartografias ---
  crearCartografia(
    nombre: string,
    descripcion: string,
    escala: string,
    archivo: File,
    idCenad: string
  ): Observable<any> {
    return this.cartografiaService.crearCartografia(
      nombre,
      descripcion,
      escala,
      archivo,
      idCenad
    ).pipe(
      tap(res => {
        if (res) {
          this.loadAllCartografias(idCenad).pipe(
            tap(cartografias => this.cenadStore.setCartografias(cartografias))
          ).subscribe();
          console.log(`Cartografía ${nombre} creada correctamente.`);
        } else {
          console.warn(`Hubo un problema creando la cartografía ${nombre}.`);
        }
      })
    );
  }

  actualizarCartografia(
    nombre: string,
    descripcion: string,
    escala: string,
    archivoCartografia: File | null,
    archivoActual: string,
    idCenad: string,
    idCartografia: string
  ): Observable<any> {
    return this.cartografiaService.editarCartografia(
      nombre,
      descripcion,
      escala,
      archivoCartografia,
      archivoActual,
      idCenad,
      idCartografia
    ).pipe(
      tap(res => {
        if (res) {
          this.loadAllCartografias(idCenad).pipe(
            tap(cartografias => this.cenadStore.setCartografias(cartografias))
          ).subscribe(); console.log(`Cartografía ${nombre} actualizada correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando la cartografía ${nombre}.`);
        }
      })
    );
  }

  borrarCartografia(nombreArchivo: string, idCartografia: string, idCenad: string): Observable<any> {
    return this.cartografiaService.deleteCartografia(nombreArchivo, idCartografia, idCenad).pipe(
      tap(res => {
        if (res) {
          console.log(`Cartografía ${nombreArchivo} borrada correctamente.`);
          this.loadAllCartografias(idCenad).pipe(
            tap(cartografias => this.cenadStore.setCartografias(cartografias))
          ).subscribe();
        } else {
          console.warn(`Hubo un problema borrando la cartografía ${nombreArchivo}.`);
        }
      })
    );
  }

  getArchivoCartografia(nombreArchivo: string, idCenad: string): Observable<void> {
    return this.cartografiaService.getArchivoCartografia(nombreArchivo, idCenad);
  }


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
