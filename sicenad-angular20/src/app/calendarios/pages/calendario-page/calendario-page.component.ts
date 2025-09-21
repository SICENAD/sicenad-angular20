import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGlasses } from '@fortawesome/free-solid-svg-icons';

import { CalendarDayViewComponent, CalendarEvent, CalendarMonthViewComponent, CalendarView, CalendarWeekViewComponent } from 'angular-calendar';
import { addHours } from 'date-fns';
import { OrquestadorService } from '@services/orquestadorService';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { CenadStore } from '@stores/cenad.store';
import { ReactiveFormsModule } from '@angular/forms';
import { IconosStore } from '@stores/iconos.store';
import { RoutesPaths } from '@app/app.routes';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { AuthStore } from '@stores/auth.store';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarMonthViewComponent,
    CalendarWeekViewComponent,
    CalendarDayViewComponent,
    FontAwesomeModule,
    RouterLink
  ],
  templateUrl: './calendario-page.component.html',
  styleUrls: ['./calendario-page.component.css'],
  providers: [DatePipe]
})
export class CalendarioPageComponent {
[x: string]: any;
  // Servicios
  private route = inject(ActivatedRoute);
  private orquestadorService = inject(OrquestadorService);
  private datePipe = inject(DatePipe);
  private router = inject(Router);
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private cenadStore = inject(CenadStore);
  private iconoStore = inject(IconosStore);
  private usuarioLogueadoStore = inject(UsuarioLogueadoStore);
  private auth = inject(AuthStore);

  readonly routesPaths = RoutesPaths;
  /** Icono FontAwesome */
  faVista = this.iconoStore.faVista;
  faVolver = this.iconoStore.faVolver;

  /** Signals para estados */
  idSolicitud = signal('');

  isAutenticado = signal(false);
  isUsuarioNormal = signal(false);
  isAdministrador = signal(false);
  isGestor = signal(false);
  isSuperAdmin = signal(false);

  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  categorias = computed(() => this.cenadStore.categorias());
  unidades = computed(() => this.datosPrincipalesStore.unidades());
  solicitudes = computed(() => this.cenadStore.solicitudes());
  solicitudesValidadas = computed(() => this.cenadStore.solicitudesValidada());
  // solicitudesPlanificadas = computed(() => this.cenadStore.solicitudesPlanificada());
  solicitudesSolicitadas = computed(() => this.cenadStore.solicitudesSolicitada());

  fechaActual = signal(new Date());

  /** Configuración angular-calendar */
  view = signal<CalendarView>(CalendarView.Month); // vista por defecto: mes
  viewDate = signal<Date>(new Date());
  events = signal<CalendarEvent[]>([]);

  /** Subject para refrescar la vista */
  refresh = new Subject<void>();

  /** Método ejemplo para añadir un evento dinámicamente */
  addEvento() {
    this.events.update(eventos => [
      ...eventos,
      {
        start: new Date(),
        title: 'Nuevo evento',
        color: { primary: '#1e90ff', secondary: '#D1E8FF' }
      }
    ]);
    this.refresh.next(); // <- Aquí notificamos al calendario
  }


  // Control de vistas y visibilidad
  calendarVisible = signal(true);
  todasVisible = signal(false);

  constructor() {
    this.initComponent();
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

    this.isAdministrador.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol ===  'Administrador');
    this.isGestor.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol ===  'Gestor');
    this.isUsuarioNormal.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol ===  'Normal');
    this.isSuperAdmin.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol ===  'Superadministrador');
  }

  /** Convertir solicitud en evento de angular-calendar */
  private mapSolicitudToEvent(solicitud: any, estado: string): CalendarEvent {
    return {
      id: solicitud.id,
      title: `${estado} - ${solicitud.recurso?.nombre || 'Recurso desconocido'}`,
      start: new Date(solicitud.fechaInicio),
      end: solicitud.fechaFin ? new Date(solicitud.fechaFin) : addHours(new Date(solicitud.fechaInicio), 2),
      color: this.getColorEstado(estado),
      meta: solicitud
    };
  }

  /** Colores según estado */
  private getColorEstado(estado: string) {
    switch (estado) {
      case 'Validada':
        return { primary: '#28a745', secondary: '#d4edda' };
      case 'Planificada':
        return { primary: '#17a2b8', secondary: '#d1ecf1' };
      case 'Solicitada':
        return { primary: '#ffc107', secondary: '#fff3cd' };
      default:
        return { primary: '#6c757d', secondary: '#e2e3e5' };
    }
  }

  /** Navegación */
  verTodas(): void {
    this.router.navigate([this.routesPaths.cenadHome, this.cenadVisitado()?.idString, this.routesPaths.solicitudes]);
  }

  /** Cambiar vista de calendario */
  cambiarVista(nuevaVista: string) {
    switch (nuevaVista) {
      case 'month':
        this.view.set(CalendarView.Month);
        break;
      case 'week':
        this.view.set(CalendarView.Week);
        break;
      case 'day':
        this.view.set(CalendarView.Day);
        break;
      default:
        this.view.set(CalendarView.Month);
    }
  }
}

