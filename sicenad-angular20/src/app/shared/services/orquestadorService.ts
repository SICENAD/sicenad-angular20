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
import { FicheroService } from "./ficheroService";
import { FicheroRecurso } from "@interfaces/models/ficheroRecurso";
import { FicheroSolicitud } from "@interfaces/models/ficheroSolicitud";


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
  private ficheroService = inject(FicheroService);

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
      solicitudesBorrador: this.loadAllSolicitudesEstado(idCenad, 'Borrador'),
      solicitudesSolicitada: this.loadAllSolicitudesEstado(idCenad, 'Solicitada'),
      solicitudesRechazada: this.loadAllSolicitudesEstado(idCenad, 'Rechazada'),
      solicitudesValidada: this.loadAllSolicitudesEstado(idCenad, 'Validada'),
      solicitudesCancelada: this.loadAllSolicitudesEstado(idCenad, 'Cancelada'),
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
        this.cenadStore.setSolicitudesBorrador(data.solicitudesBorrador);
        this.cenadStore.setSolicitudesSolicitada(data.solicitudesSolicitada);
        this.cenadStore.setSolicitudesRechazada(data.solicitudesRechazada);
        this.cenadStore.setSolicitudesValidada(data.solicitudesValidada);
        this.cenadStore.setSolicitudesCancelada(data.solicitudesCancelada);
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

  loadAllSolicitudesEstado(idCenad: string, estado: string): Observable<Solicitud[]> {
    return this.solicitudService.getSolicitudesPorEstado(idCenad, estado).pipe(
      catchError(err => {
        console.error('Error cargando solicitudes', err);
        switch (estado) {
          case 'Borrador':
            this.cenadStore.clearSolicitudesBorrador();
            break;
          case 'Solicitada':
            this.cenadStore.clearSolicitudesSolicitada();
            break;
          case 'Rechazada':
            this.cenadStore.clearSolicitudesRechazada();
            break;
          case 'Validada':
            this.cenadStore.clearSolicitudesValidada();
            break;
          case 'Cancelada':
            this.cenadStore.clearSolicitudesCancelada();
            break;
        }
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

  loadUsuarioGestorDeRecurso(idRecurso: string): Observable<UsuarioGestor | null> {
    return this.usuarioService.getUsuarioGestorDeRecurso(idRecurso).pipe(
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

  actualizarInfoCenad(
    nombre: string,
    direccion: string,
    tfno: string,
    email: string,
    descripcion: string,
    archivoInfoCenad: File | null,
    infoCenadActual: string,
    idCenad: string
  ): Observable<any> {
    return this.cenadService.editarInfoCenad(
      direccion,
      tfno,
      email,
      descripcion,
      archivoInfoCenad,
      infoCenadActual,
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

  getInfoCenad(infoCenad: string, idCenad: string): Observable<Blob> {
    return this.cenadService.getInfoCenad(infoCenad, idCenad);
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

  // --- CRUD Categoria ---
  crearCategoria(
    nombre: string,
    descripcion: string,
    idCenad: string,
    idCategoriaPadre: string,
  ): Observable<any> {
    return this.categoriaService.crearCategoria(
      nombre,
      descripcion,
      idCenad,
      idCategoriaPadre
    ).pipe(
      tap(res => {
        if (res) {
          this.loadAllCategorias(idCenad).pipe(
            tap(categorias => this.cenadStore.setCategorias(categorias))
          ).subscribe();
          this.loadAllCategoriasPadre(idCenad).pipe(
            tap(categorias => this.cenadStore.setCategoriasPadre(categorias))
          ).subscribe();
          console.log(`Categoría ${nombre} creada correctamente.`);
        } else {
          console.warn(`Hubo un problema creando la categoría ${nombre}.`);
        }
      })
    );
  }

  actualizarCategoria(
    nombre: string,
    descripcion: string,
    idCenad: string,
    idCategoria: string,
    idCategoriaPadre: string
  ): Observable<any> {
    return this.categoriaService.editarCategoria(
      nombre,
      descripcion,
      idCategoria,
      idCategoriaPadre
    ).pipe(
      tap(res => {
        if (res) {
          this.loadAllCategorias(idCenad).pipe(
            tap(categorias => this.cenadStore.setCategorias(categorias))
          ).subscribe();
          this.loadAllCategoriasPadre(idCenad).pipe(
            tap(categorias => this.cenadStore.setCategoriasPadre(categorias))
          ).subscribe();
          console.log(`Categoría ${nombre} actualizada correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando la categoría ${nombre}.`);
        }
      })
    );
  }

  borrarCategoria(idCategoria: string, idCenad: string): Observable<any> {
    return this.categoriaService.deleteCategoria(idCategoria).pipe(
      tap(res => {
        if (res) {
          console.log(`Categoría con id ${idCategoria} borrada correctamente.`);
          this.loadAllCategorias(idCenad).pipe(
            tap(categorias => this.cenadStore.setCategorias(categorias))
          ).subscribe();
          this.loadAllCategoriasPadre(idCenad).pipe(
            tap(categorias => this.cenadStore.setCategoriasPadre(categorias))
          ).subscribe();
        } else {
          console.warn(`Hubo un problema borrando la categoría con id ${idCategoria}.`);
        }
      })
    );
  }

  loadSubcategorias(idCategoria: string): Observable<Categoria[] | null> {
    return this.categoriaService.getSubCategorias(idCategoria).pipe(
      catchError(err => {
        console.error('Error cargando subcategorías', err);
        return of([]);
      })
    );
  }

  loadSubcategoriasAnidadas(idCategoria: string): Observable<Categoria[] | null> {
    return this.categoriaService.getSubCategoriasAnidadas(idCategoria).pipe(
      catchError(err => {
        console.error('Error cargando subcategorías', err);
        return of([]);
      })
    );
  }

  loadCategoriaSeleccionada(idCategoria: string): Observable<Categoria | null> {
    return this.categoriaService.getCategoriaSeleccionada(idCategoria).pipe(
      catchError(err => {
        console.error('Error cargando la categoria', err);
        return of(null);
      })
    );
  }

  loadCategoriaPadre(idCategoria: string): Observable<Categoria | null> {
    return this.categoriaService.getCategoriaPadre(idCategoria).pipe(
      catchError(err => {
        console.error('Error cargando la categoria padre', err);
        return of(null);
      })
    );
  }

  loadCategoriaDeRecurso(idRecurso: string): Observable<Categoria | null> {
    return this.categoriaService.getCategoriaDeRecurso(idRecurso).pipe(
      catchError(err => {
        console.error('Error cargando la categoria de recurso', err);
        return of(null);
      })
    );
  }

  // --- CRUD Recurso ---
  crearRecurso(nombre: string, descripcion: string, otros: string, idCenad: string, idTipoFormulario: string, idCategoria: string, idGestor: string): Observable<any> {
    return this.recursoService.crearRecurso(
      nombre,
      descripcion,
      otros,
      idTipoFormulario,
      idCategoria,
      idGestor
    ).pipe(
      tap(res => {
        if (res) {
          this.loadAllRecursos(idCenad).pipe(
            tap(recursos => this.cenadStore.setRecursos(recursos))
          ).subscribe();
          console.log(`Recurso ${nombre} creado correctamente.`);
        } else {
          console.warn(`Hubo un problema creando el recurso ${nombre}.`);
        }
      })
    );
  }

  actualizarRecurso(nombre: string, descripcion: string, otros: string, idCenad: string, idTipoFormulario: string, idCategoria: string, idGestor: string, idRecurso: string): Observable<any> {
    return this.recursoService.editarRecurso(
      nombre,
      descripcion,
      otros,
      idTipoFormulario,
      idCategoria,
      idGestor,
      idRecurso
    ).pipe(
      tap(res => {
        if (res) {
          this.loadAllRecursos(idCenad).pipe(
            tap(recursos => this.cenadStore.setRecursos(recursos))
          ).subscribe();
          console.log(`Recurso ${nombre} actualizado correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando el recurso ${nombre}.`);
        }
      })
    );
  }

  actualizarRecursoDetalle(nombre: string, descripcion: string, otros: string, conDatosEspecificosSolicitud: boolean, datosEspecificosSolicitud: string, idCenad: string, idRecurso: string): Observable<any> {
    return this.recursoService.editarRecursoDetalle(
      nombre,
      descripcion,
      otros,
      conDatosEspecificosSolicitud,
      datosEspecificosSolicitud,
      idRecurso,
    ).pipe(
      tap(res => {
        if (res) {
          this.loadAllRecursos(idCenad).pipe(
            tap(recursos => this.cenadStore.setRecursos(recursos))
          ).subscribe();
          console.log(`Recurso ${nombre} actualizado correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando el recurso ${nombre}.`);
        }
      })
    );
  }

  borrarRecurso(idRecurso: string, idCenad: string): Observable<any> {
    return this.recursoService.deleteRecurso(idRecurso).pipe(
      tap(res => {
        if (res) {
          console.log(`Recurso con id ${idRecurso} borrado correctamente.`);
          this.loadAllRecursos(idCenad).pipe(
            tap(recursos => this.cenadStore.setRecursos(recursos))
          ).subscribe();
        } else {
          console.warn(`Hubo un problema borrando el recurso con id ${idRecurso}.`);
        }
      })
    );
  }

  loadRecursosDeCategoria(idCategoria: string): Observable<Recurso[] | null> {
    return this.recursoService.getRecursosDeCategoria(idCategoria).pipe(
      catchError(err => {
        console.error('Error cargando recursos de la categoría', err);
        return of([]);
      })
    );
  }

  loadRecursosDeSubcategorias(idCategoria: string): Observable<Recurso[] | null> {
    return this.recursoService.getRecursosDeSubcategorias(idCategoria).pipe(
      catchError(err => {
        console.error('Error cargando recursos de las subcategorías', err);
        return of([]);
      })
    );
  }

  loadRecursosDeGestor(idGestor: string): Observable<Recurso[] | null> {
    return this.recursoService.getRecursosDeGestor(idGestor).pipe(
      catchError(err => {
        console.error('Error cargando recursos del gestor', err);
        return of([]);
      })
    );
  }

  loadRecursoSeleccionado(idRecurso: string): Observable<Recurso | null> {
    return this.recursoService.getRecursoSeleccionado(idRecurso).pipe(
      catchError(err => {
        console.error('Error cargando el recurso', err);
        return of(null);
      })
    );
  }

  loadRecursoDeSolicitud(idSolicitud: string): Observable<Recurso | null> {
    return this.recursoService.getRecursoDeSolicitud(idSolicitud).pipe(
      catchError(err => {
        console.error('Error cargando el recurso de solicitud', err);
        return of(null);
      })
    );
  }

  // --- CRUD Solicitud ---
  crearSolicitud(
    observaciones: string,
    unidadUsuaria: string,
    jefeUnidadUsuaria: string,
    pocEjercicio: string,
    tlfnRedactor: string,
    fechaSolicitud: Date,
    fechaHoraInicioRecurso: Date,
    fechaHoraFinRecurso: Date,
    estado: string,
    idCenad: string,
    idRecurso: string,
    idUsuarioNormal: string
  ): Observable<any> {
    return this.solicitudService.crearSolicitud(
      observaciones,
      unidadUsuaria,
      jefeUnidadUsuaria,
      pocEjercicio,
      tlfnRedactor,
      fechaSolicitud,
      fechaHoraInicioRecurso,
      fechaHoraFinRecurso,
      estado,
      idRecurso,
      idUsuarioNormal,
    ).pipe(
      tap(res => {
        if (res) {
          this.loadAllSolicitudes(idCenad).pipe(
            tap(solicitudes => this.cenadStore.setSolicitudes(solicitudes))
          ).subscribe();
          this.loadAllSolicitudesEstado(idCenad, estado).pipe(
            tap(solicitudes => {
              switch (estado) {
                case 'Borrador':
                  this.cenadStore.setSolicitudesBorrador(solicitudes);
                  break;
                case 'Solicitada':
                  this.cenadStore.setSolicitudesSolicitada(solicitudes);
                  break;
              }
            })
          ).subscribe();
          console.log(`Solicitud creada correctamente.`);
        } else {
          console.warn(`Hubo un problema creando la solicitud.`);
        }
      })
    );
  }

  actualizarSolicitud(
    observaciones: string,
    jefeUnidadUsuaria: string,
    pocEjercicio: string,
    tlfnRedactor: string,
    fechaHoraInicioRecurso: Date,
    fechaHoraFinRecurso: Date,
    estado: string,
    idCenad: string,
    idSolicitud: string,
    observacionesCenad: string,
    fechaFinDocumentacion: Date
  ): Observable<any> {
    return this.solicitudService.editarSolicitud(
      observaciones,
      jefeUnidadUsuaria,
      pocEjercicio,
      tlfnRedactor,
      fechaHoraInicioRecurso,
      fechaHoraFinRecurso,
      estado,
      idSolicitud,
      observacionesCenad,
      fechaFinDocumentacion
    ).pipe(
      tap(res => {
        if (res) {
          this.loadAllSolicitudes(idCenad).pipe(
            tap(solicitudes => this.cenadStore.setSolicitudes(solicitudes))
          ).subscribe();
          this.loadAllSolicitudesEstado(idCenad, "Borrador").pipe(
            tap(solicitudes => this.cenadStore.setSolicitudesBorrador(solicitudes))
          ).subscribe();
          this.loadAllSolicitudesEstado(idCenad, "Solicitada").pipe(
            tap(solicitudes => this.cenadStore.setSolicitudesSolicitada(solicitudes))
          ).subscribe();
          this.loadAllSolicitudesEstado(idCenad, "Rechazada").pipe(
            tap(solicitudes => this.cenadStore.setSolicitudesRechazada(solicitudes))
          ).subscribe();
          this.loadAllSolicitudesEstado(idCenad, "Validada").pipe(
            tap(solicitudes => this.cenadStore.setSolicitudesValidada(solicitudes))
          ).subscribe();
          this.loadAllSolicitudesEstado(idCenad, "Cancelada").pipe(
            tap(solicitudes => this.cenadStore.setSolicitudesCancelada(solicitudes))
          ).subscribe();
          console.log(`Solicitud ${idSolicitud} actualizada correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando la solicitud ${idSolicitud}.`);
        }
      })
    );
  }

  borrarSolicitud(idSolicitud: string, idCenad: string, estado: string): Observable<any> {
    return this.solicitudService.deleteSolicitud(idSolicitud).pipe(
      tap(res => {
        if (res) {
          console.log(`Solicitud con id ${idSolicitud} borrada correctamente.`);
          this.loadAllSolicitudes(idCenad).pipe(
            tap(solicitudes => {
              this.cenadStore.setSolicitudes(solicitudes);
              this.loadAllSolicitudesEstado(idCenad, estado).pipe(
                tap(solicitudes => {
                  switch (estado) {
                    case 'Borrador':
                      this.cenadStore.setSolicitudesBorrador(solicitudes);
                      break;
                    case 'Solicitada':
                      this.cenadStore.setSolicitudesSolicitada(solicitudes);
                      break;
                    case 'Rechazada':
                      this.cenadStore.setSolicitudesRechazada(solicitudes);
                      break;
                    case 'Validada':
                      this.cenadStore.setSolicitudesValidada(solicitudes);
                      break;
                    case 'Cancelada':
                      this.cenadStore.setSolicitudesCancelada(solicitudes);
                      break;
                  }
                })
              ).subscribe();
            })
          ).subscribe();
        } else {
          console.warn(`Hubo un problema borrando la solicitud con id ${idSolicitud}.`);
        }
      })
    );
  }

  loadSolicitudSeleccionada(idSolicitud: string): Observable<Solicitud | null> {
    return this.solicitudService.getSolicitudSeleccionada(idSolicitud).pipe(
      catchError(err => {
        console.error('Error cargando la solicitud', err);
        return of(null);
      })
    );
  }

  loadSolicitudesDeRecurso(idRecurso: string): Observable<Solicitud[] | null> {
    return this.solicitudService.getSolicitudesDeRecurso(idRecurso).pipe(
      catchError(err => {
        console.error('Error cargando solicitudes del recurso', err);
        return of([]);
      })
    );
  }

  loadSolicitudesDeRecursoPorEstado(idRecurso: string, estado: string): Observable<Solicitud[] | null> {
    return this.solicitudService.getSolicitudesDeRecursoPorEstado(idRecurso, estado).pipe(
      catchError(err => {
        console.error('Error cargando solicitudes del recurso', err);
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
    return this.unidadService.getUnidadDeUsuarioNormal(idUsuarioNormal).pipe(
      catchError(err => {
        console.error('Error cargando unidad del usuario normal', err);
        return of(null);
      })
    );
  }

  // --- CRUD TiposFormulario ---

  loadTipoFormularioDeRecurso(idRecurso: string): Observable<TipoFormulario | null> {
    return this.tipoFormularioService.getTipoFormularioDeRecurso(idRecurso).pipe(
      catchError(err => {
        console.error('Error cargando tipo de formulario', err);
        return of(null);
      })
    );
  }

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
  loadCategoriaFicheroDeFichero(idFichero: string): Observable<CategoriaFichero | null> {
    return this.categoriaFicheroService.getCategoriaFicheroDeFichero(idFichero).pipe(
      catchError(err => {
        console.error('Error cargando la categoria de fichero', err);
        return of(null);
      })
    );
  }

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

  // --- CRUD FicherosRecurso ---
  loadFicherosDeRecurso(idRecurso: string): Observable<FicheroRecurso[] | null> {
    return this.ficheroService.getAllFicherosDeRecurso(idRecurso).pipe(
      catchError(err => {
        console.error('Error cargando ficheros del recurso', err);
        return of([]);
      })
    );
  }

  loadFicheroRecursoSeleccionado(idFichero: string): Observable<FicheroRecurso | null> {
    return this.ficheroService.getFicheroRecursoSeleccionado(idFichero).pipe(
      catchError(err => {
        console.error('Error cargando el recurso', err);
        return of(null);
      })
    );
  }
  crearFicheroRecurso(
    nombre: string,
    descripcion: string,
    archivo: File,
    idCategoriaFichero: string,
    idCenad: string,
    idRecurso: string
  ): Observable<any> {
    return this.ficheroService.crearFicheroRecurso(
      nombre,
      descripcion,
      archivo,
      idCategoriaFichero,
      idCenad,
      idRecurso
    ).pipe(
      tap(res => {
        if (res) {
          this.loadFicherosDeRecurso(idRecurso).subscribe();
          console.log(`Fichero ${nombre} creado correctamente.`);
        } else {
          console.warn(`Hubo un problema creando el fichero ${nombre}.`);
        }
      })
    );
  }

  actualizarFicheroRecurso(
    nombre: string,
    descripcion: string,
    archivo: File | null,
    nombreArchivoActual: string,
    idCenad: string,
    idRecurso: string,
    idCategoriaFichero: string,
    idFichero: string
  ): Observable<any> {
    return this.ficheroService.editarFicheroRecurso(
      nombre,
      descripcion,
      archivo,
      nombreArchivoActual,
      idCenad,
      idRecurso,
      idCategoriaFichero,
      idFichero
    ).pipe(
      tap(res => {
        if (res) {
          this.loadFicherosDeRecurso(idRecurso).subscribe();
          console.log(`Fichero ${nombre} actualizado correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando el fichero ${nombre}.`);
        }
      })
    );
  }

  borrarFicheroRecurso(nombreArchivo: string, idFichero: string, idCenad: string, idRecurso: string): Observable<any> {
    return this.ficheroService.deleteFicheroRecurso(nombreArchivo, idFichero, idCenad, idRecurso).pipe(
      tap(res => {
        if (res) {
          this.loadFicherosDeRecurso(idRecurso).subscribe();
          console.log(`Fichero ${nombreArchivo} borrado correctamente.`);
        } else {
          console.warn(`Hubo un problema borrando el fichero ${nombreArchivo}.`);
        }
      })
    );
  }

  getArchivoRecurso(nombreArchivo: string, idCenad: string, idRecurso: string): Observable<void> {
    return this.ficheroService.getArchivoRecurso(nombreArchivo, idCenad, idRecurso);
  }
  getImagenRecurso(nombreArchivo: string, idCenad: string, idRecurso: string): Observable<Blob> {
    return this.ficheroService.getImagenRecurso(nombreArchivo, idCenad, idRecurso);
  }

  //--- CRUD FicherosSolicitud ---
  loadDocumentacionCenad(idSolicitud: string): Observable<FicheroSolicitud[] | null> {
    return this.ficheroService.getAllDocumentacionSolicitudCenad(idSolicitud).pipe(
      catchError(err => {
        console.error('Error cargando ficheros del recurso', err);
        return of([]);
      })
    );
  }

  loadDocumentacionUnidad(idSolicitud: string): Observable<FicheroSolicitud[] | null> {
    return this.ficheroService.getAllDocumentacionSolicitudUnidad(idSolicitud).pipe(
      catchError(err => {
        console.error('Error cargando ficheros del recurso', err);
        return of([]);
      })
    );
  }

  loadFicheroSolicitudSeleccionado(idFichero: string): Observable<FicheroSolicitud | null> {
    return this.ficheroService.getFicheroSolicitudSeleccionado(idFichero).pipe(
      catchError(err => {
        console.error('Error cargando el recurso', err);
        return of(null);
      })
    );
  }
  crearFicheroSolicitudCenad(
    nombre: string,
    descripcion: string,
    archivo: File,
    idCategoriaFichero: string,
    idCenad: string,
    idSolicitud: string
  ): Observable<any> {
    return this.ficheroService.crearFicheroSolicitudCenad(
      nombre,
      descripcion,
      archivo,
      idCategoriaFichero,
      idCenad,
      idSolicitud
    ).pipe(
      tap(res => {
        if (res) {
          this.loadDocumentacionCenad(idSolicitud).subscribe();
          console.log(`Fichero ${nombre} creado correctamente.`);
        } else {
          console.warn(`Hubo un problema creando el fichero ${nombre}.`);
        }
      })
    );
  }

  crearFicheroSolicitudUnidad(
    nombre: string,
    descripcion: string,
    archivo: File,
    idCategoriaFichero: string,
    idCenad: string,
    idSolicitud: string
  ): Observable<any> {
    return this.ficheroService.crearFicheroSolicitudUnidad(
      nombre,
      descripcion,
      archivo,
      idCategoriaFichero,
      idCenad,
      idSolicitud
    ).pipe(
      tap(res => {
        if (res) {
          this.loadDocumentacionUnidad(idSolicitud).subscribe();
          console.log(`Fichero ${nombre} creado correctamente.`);
        } else {
          console.warn(`Hubo un problema creando el fichero ${nombre}.`);
        }
      })
    );
  }

  actualizarFicheroSolicitudCenad(
    nombre: string,
    descripcion: string,
    archivo: File | null,
    nombreArchivoActual: string,
    idCenad: string,
    idSolicitud: string,
    idCategoriaFichero: string,
    idFichero: string
  ): Observable<any> {
    return this.ficheroService.editarFicheroSolicitud(
      nombre,
      descripcion,
      archivo,
      nombreArchivoActual,
      idCenad,
      idSolicitud,
      idCategoriaFichero,
      idFichero
    ).pipe(
      tap(res => {
        if (res) {
          this.loadDocumentacionCenad(idSolicitud).subscribe();
          console.log(`Fichero ${nombre} actualizado correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando el fichero ${nombre}.`);
        }
      })
    );
  }

  actualizarFicheroSolicitudUnidad(
    nombre: string,
    descripcion: string,
    archivo: File | null,
    nombreArchivoActual: string,
    idCenad: string,
    idSolicitud: string,
    idCategoriaFichero: string,
    idFichero: string
  ): Observable<any> {
    return this.ficheroService.editarFicheroSolicitud(
      nombre,
      descripcion,
      archivo,
      nombreArchivoActual,
      idCenad,
      idSolicitud,
      idCategoriaFichero,
      idFichero
    ).pipe(
      tap(res => {
        if (res) {
          this.loadDocumentacionUnidad(idSolicitud).subscribe();
          console.log(`Fichero ${nombre} actualizado correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando el fichero ${nombre}.`);
        }
      })
    );
  }

  borrarFicheroSolicitudCenad(nombreArchivo: string, idFichero: string, idCenad: string, idSolicitud: string): Observable<any> {
    return this.ficheroService.deleteFicheroSolicitud(nombreArchivo, idFichero, idCenad, idSolicitud).pipe(
      tap(res => {
        if (res) {
          this.loadDocumentacionCenad(idSolicitud).subscribe();
          console.log(`Fichero ${nombreArchivo} borrado correctamente.`);
        } else {
          console.warn(`Hubo un problema borrando el fichero ${nombreArchivo}.`);
        }
      })
    );
  }

  borrarFicheroSolicitudUnidad(nombreArchivo: string, idFichero: string, idCenad: string, idSolicitud: string): Observable<any> {
    return this.ficheroService.deleteFicheroSolicitud(nombreArchivo, idFichero, idCenad, idSolicitud).pipe(
      tap(res => {
        if (res) {
          this.loadDocumentacionUnidad(idSolicitud).subscribe();
          console.log(`Fichero ${nombreArchivo} borrado correctamente.`);
        } else {
          console.warn(`Hubo un problema borrando el fichero ${nombreArchivo}.`);
        }
      })
    );
  }

  getArchivoSolicitud(nombreArchivo: string, idCenad: string, idSolicitud: string): Observable<void> {
    return this.ficheroService.getArchivoSolicitud(nombreArchivo, idCenad, idSolicitud);
  }
  getImagenSolicitud(nombreArchivo: string, idCenad: string, idSolicitud: string): Observable<Blob> {
    return this.ficheroService.getImagenSolicitud(nombreArchivo, idCenad, idSolicitud);
  }

  // --- CRUD Normativas ---
  crearNormativa(
    nombre: string,
    descripcion: string,
    archivo: File,
    idCenad: string
  ): Observable<any> {
    return this.normativaService.crearNormativa(
      nombre,
      descripcion,
      archivo,
      idCenad
    ).pipe(
      tap(res => {
        if (res) {
          this.loadAllNormativas(idCenad).pipe(
            tap(normativas => this.cenadStore.setNormativas(normativas))
          ).subscribe();
          console.log(`Normativa ${nombre} creada correctamente.`);
        } else {
          console.warn(`Hubo un problema creando la normativa ${nombre}.`);
        }
      })
    );
  }

  actualizarNormativa(
    nombre: string,
    descripcion: string,
    archivoNormativa: File | null,
    archivoActual: string,
    idCenad: string,
    idNormativa: string
  ): Observable<any> {
    return this.normativaService.editarNormativa(
      nombre,
      descripcion,
      archivoNormativa,
      archivoActual,
      idCenad,
      idNormativa
    ).pipe(
      tap(res => {
        if (res) {
          this.loadAllNormativas(idCenad).pipe(
            tap(normativas => this.cenadStore.setNormativas(normativas))
          ).subscribe();
          console.log(`Normativa ${nombre} actualizada correctamente.`);
        } else {
          console.warn(`Hubo un problema actualizando la normativa ${nombre}.`);
        }
      })
    );
  }

  borrarNormativa(nombreArchivo: string, idNormativa: string, idCenad: string): Observable<any> {
    return this.normativaService.deleteNormativa(nombreArchivo, idNormativa, idCenad).pipe(
      tap(res => {
        if (res) {
          console.log(`Normativa ${nombreArchivo} borrada correctamente.`);
          this.loadAllNormativas(idCenad).pipe(
            tap(normativas => this.cenadStore.setNormativas(normativas))
          ).subscribe();
        } else {
          console.warn(`Hubo un problema borrando la normativa ${nombreArchivo}.`);
        }
      })
    );
  }

  getArchivoNormativa(nombreArchivo: string, idCenad: string): Observable<void> {
    return this.normativaService.getArchivoNormativa(nombreArchivo, idCenad);
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
