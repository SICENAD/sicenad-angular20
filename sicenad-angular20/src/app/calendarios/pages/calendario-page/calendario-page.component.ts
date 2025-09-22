import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
import { CalendarHeaderComponent } from '@app/calendarios/components/calendarHeader/calendarHeader.component';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarHeaderComponent,
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
  private orquestadorService = inject(OrquestadorService);
  private datepipe = inject(DatePipe);
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
    this.cargarEventos();
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

  cargarEventos() {
    const eventos: CalendarEvent[] = [];
    // Añadir solicitudes validadas
    this.solicitudesValidadas().forEach(solicitud => {
      eventos.push(this.mapSolicitudToEvent(solicitud, 'Validada'));
    });
    // Añadir solicitudes solicitadas
    this.solicitudesSolicitadas().forEach(solicitud => {
      eventos.push(this.mapSolicitudToEvent(solicitud, 'Solicitada'));
    });
    this.events.set(eventos);
    this.refresh.next();
  }

  /** Convertir solicitud en evento de angular-calendar */
  private mapSolicitudToEvent(solicitud: any, estado: string): CalendarEvent {
    return {
      id: solicitud.idString,
      title: solicitud.unidadUsuaria,
      start: new Date(solicitud.fechaHoraInicioRecurso),
      end: solicitud.fechaHoraFinRecurso
        ? new Date(solicitud.fechaHoraFinRecurso)
        : addHours(new Date(solicitud.fechaHoraInicioRecurso), 2),
      color: this.estadoColors[estado] || { primary: '#6c757d', secondary: '#e2e3e5' },
      meta: solicitud
    };
  }

  getColor(event: CalendarEvent) {
    return this.getColorForUnit(event.title);
  }


  /** Navegación */
  verTodas(): void {
    this.router.navigate([this.routesPaths.cenadHome, this.cenadVisitado()?.idString, this.routesPaths.solicitudes]);
  }

  // Navegación
  previous() {
    const newDate = new Date(this.viewDate());
    if (this.view() === CalendarView.Month) newDate.setMonth(newDate.getMonth() - 1);
    if (this.view() === CalendarView.Week) newDate.setDate(newDate.getDate() - 7);
    if (this.view() === CalendarView.Day) newDate.setDate(newDate.getDate() - 1);
    this.viewDate.set(newDate);
  }

  next() {
    const newDate = new Date(this.viewDate());
    if (this.view() === CalendarView.Month) newDate.setMonth(newDate.getMonth() + 1);
    if (this.view() === CalendarView.Week) newDate.setDate(newDate.getDate() + 7);
    if (this.view() === CalendarView.Day) newDate.setDate(newDate.getDate() + 1);
    this.viewDate.set(newDate);
  }

  today() {
    this.viewDate.set(new Date());
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


  /** Devuelve el estilo CSS para posicionar la barra del evento dentro de la celda */
  getEventStyle(event: CalendarEvent, dayDate: Date): { [key: string]: string } {
    const start = event.start;
    const end = event.end || event.start;

    // Día actual
    const startOfDay = new Date(dayDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dayDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dayHours = 24;

    // Ajustes para eventos que cruzan varios días
    const effectiveStart = start < startOfDay ? startOfDay : start;
    const effectiveEnd = end > endOfDay ? endOfDay : end;

    const startHour = effectiveStart.getHours() + effectiveStart.getMinutes() / 60;
    const endHour = effectiveEnd.getHours() + effectiveEnd.getMinutes() / 60;

    const left = (startHour / dayHours) * 100;
    const width = ((endHour - startHour) / dayHours) * 100;

    // Obtener color basado en el título (nombre de la unidad)
    const barColor = event.color?.primary || '#6c757d'; // color de fondo por estado

    return {
      position: 'absolute',
      left: `${left}%`,
      width: `${width}%`,
      backgroundColor: barColor,
      color: '#fff',
      padding: '2px 4px',
      fontSize: '0.7rem',
      borderRadius: '4px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    };
  }

  // Colores reservados para casos especiales
  private reservedColors: string[] = [
    '#000000', // Negro - por ejemplo para "Festivo"
    '#ffffff', // Blanco - no usar
    '#ff0000'  // Rojo - no usar para unidades normales
  ];

  // Paleta base de colores para unidades
  private baseColors: string[] = [
    '#1e90ff', // Azul
    '#28a745', // Verde
    '#e67e22', // Naranja
    '#6f42c1', // Morado
    '#20c997', // Verde menta
    '#ffc107', // Amarillo
    '#17a2b8', // Azul verdoso
    '#fd7e14', // Naranja intenso
    '#6610f2', // Violeta fuerte
    '#ff6f61'  // Coral
  ];

  // Mapa para asignar colores a unidades
  private unitColorMap = new Map<string, string>();

  private specialUnitColors: Record<string, string> = {
    'Mantenimiento': '#ff0000', // Rojo
    'Festivo': '#000000'        // Negro
  };

  getColorForUnit(unitName: string): string {
    // Si es un caso especial, devolver ese color fijo
    if (this.specialUnitColors[unitName]) {
      return this.specialUnitColors[unitName];
    }

    // Resto de la lógica igual...
    if (this.unitColorMap.has(unitName)) {
      return this.unitColorMap.get(unitName)!;
    }

    const availableColor = this.baseColors.find(color =>
      !this.reservedColors.includes(color) &&
      !Array.from(this.unitColorMap.values()).includes(color)
    );

    let assignedColor: string;

    if (availableColor) {
      assignedColor = availableColor;
    } else {
      const randomHue = Math.floor(Math.random() * 360);
      assignedColor = `hsl(${randomHue}, 70%, 50%)`;
    }

    this.unitColorMap.set(unitName, assignedColor);

    return assignedColor;
  }

  private estadoColors: Record<string, { primary: string; secondary: string }> = {
    'Borrador': { primary: '#6c757d', secondary: '#e2e3e5' },      // Gris
    'Solicitada': { primary: '#ffc107', secondary: '#fff3cd' },    // Amarillo
    'Validada': { primary: '#28a745', secondary: '#d4edda' },      // Verde
    'Cancelada': { primary: '#dc3545', secondary: '#f8d7da' },     // Rojo
    'Rechazada': { primary: '#343a40', secondary: '#e9ecef' },     // Oscuro
    'Planificación': { primary: '#17a2b8', secondary: '#d1ecf1' },// Azul verdoso
    'Mantenimiento': { primary: '#fd7e14', secondary: '#ffe5d0' }  // Naranja
  };

}
