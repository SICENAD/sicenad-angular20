import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { ReactiveFormsModule } from '@angular/forms';
import { IconosStore } from '@stores/iconos.store';
import { RoutesPaths } from '@app/app.routes';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { AuthStore } from '@stores/auth.store';
import { Recurso } from '@interfaces/models/recurso';
import { Solicitud } from '@interfaces/models/solicitud';
import { CalendarioComponent } from '@app/calendarios/components/calendario/calendario.component';
import { FiltroRecursosComponent } from "@app/recursos/components/filtroRecursos/filtroRecursos.component";
import { forkJoin } from 'rxjs';
import { SolicitudNuevaModalComponent } from "@app/solicitudes/components/solicitudNuevaModal/solicitudNuevaModal.component";

@Component({
  selector: 'app-calendario',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    RouterLink,
    CalendarioComponent,
    FiltroRecursosComponent,
    SolicitudNuevaModalComponent
],
  templateUrl: './calendario-page.component.html',
  styleUrls: ['./calendario-page.component.css'],
  providers: [DatePipe]
})
export class CalendarioPageComponent {
  // Servicios y stores
  private orquestadorService = inject(OrquestadorService);
  private cenadStore = inject(CenadStore);
  private iconoStore = inject(IconosStore);
  private usuarioLogueadoStore = inject(UsuarioLogueadoStore);
  private auth = inject(AuthStore);

  readonly routesPaths = RoutesPaths;
  /** Icono FontAwesome */
  faVolver = this.iconoStore.faVolver;

  /** Referencia directa al select */
  @ViewChild('selectRecurso') selectRecurso!: ElementRef<HTMLSelectElement>;

  /** Signals para estados */
  recursoSeleccionado = signal<Recurso | null>(null);

  isAutenticado = signal(false);
  isUsuarioNormal = signal(false);
  isAdministrador = signal(false);
  isGestor = signal(false);
  isSuperAdmin = signal(false);

  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  recursos = computed(() => this.cenadStore.recursos());
  solicitudesCenad = computed(() => this.cenadStore.solicitudes());
  solicitudes = signal<Solicitud[]>(this.cenadStore.solicitudesValidada());

  constructor() {
    //this.initComponent();
  }

  /** Inicialización principal */
  private initComponent() {
    this.comprobarUser();
  }

  /** Comprueba la sesión del usuario */
  private comprobarUser() {
    this.isAutenticado.set(this.auth.isAuthenticated());
    if (!this.isAutenticado()) {
      this.isUsuarioNormal.set(false);
      this.isAdministrador.set(false);
      this.isGestor.set(false);
      this.isSuperAdmin.set(false);
      return;
    }
    this.isAdministrador.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol === 'Administrador');
    this.isGestor.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol === 'Gestor');
    this.isUsuarioNormal.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol === 'Normal');
    this.isSuperAdmin.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol === 'Superadministrador');
  }

  recursosFiltrados: Recurso[] = this.recursos();

  actualizarRecursosFiltrados(lista: Recurso[]) {
    this.recursosFiltrados = lista;
    console.log('Recursos filtrados desde el hijo:', lista);
    // Limpiar selección y solicitudes
    this.recursoSeleccionado.set(null);
    this.cargarEventosDeRecursos(lista);
    // Resetear el select directamente en el DOM
    if (this.selectRecurso?.nativeElement) {
      this.selectRecurso.nativeElement.value = '';
    }
  }

  actualizarSolicitudesDesdeNuevaSolicitud(lista: Solicitud[]) {
    this.solicitudes.set(lista);
    console.log('Solicitudes filtradas desde el hijo:', lista);
  }

  seleccionarRecurso(id: string) {
    const recurso = this.recursosFiltrados.find(r => r.idString === id) || null;
    this.recursoSeleccionado.set(recurso);
    recurso ? this.cargarEventosDeRecurso(recurso!.idString) : this.solicitudes.set([]);
  }

  cargarEventosDeRecurso(idRecurso: string) {
    this.orquestadorService.loadSolicitudesDeRecurso(idRecurso).subscribe({
      next: (solicitudes) => {
        this.solicitudes.set(solicitudes ?? []);
      },
      error: (err) => {
        console.error('Error cargando solicitudes de recurso', err);
        this.solicitudes.set([]);
      }
    });
  }

  cargarEventosDeRecursos(recursos: Recurso[]) {
    if (!recursos || recursos.length === 0) {
      this.solicitudes.set([]);
      return;
    }
    // Crear un array de observables, uno por cada recurso
    const solicitudesObservables = recursos.map(recurso =>
      this.orquestadorService.loadSolicitudesDeRecurso(recurso.idString)
    );
    // Ejecutar todas las llamadas en paralelo
    forkJoin(solicitudesObservables).subscribe({
      next: (resultados) => {
        // 'resultados' es un array de Solicitud[] o null
        const todasLasSolicitudes: Solicitud[] = resultados
          .flat() // Une todos los arrays en uno solo
          .filter((solicitud): solicitud is Solicitud => solicitud != null); // ✅ Filtra nulos de forma segura
        this.solicitudes.set(todasLasSolicitudes);
      },
      error: (err) => {
        console.error('Error cargando solicitudes de múltiples recursos', err);
        this.solicitudes.set([]);
      }
    });
  }
}