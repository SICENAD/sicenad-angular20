import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CalendarDayViewComponent, CalendarEvent, CalendarMonthViewComponent, CalendarView, CalendarWeekViewComponent } from 'angular-calendar';
import { addHours, endOfDay, startOfDay } from 'date-fns';
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
import { Categoria } from '@interfaces/models/categoria';
import { Recurso } from '@interfaces/models/recurso';
import { Solicitud } from '@interfaces/models/solicitud';
import { EVENT_COLORS } from '@interfaces/enums/colors.enum';

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
  // Servicios y stores
  private orquestadorService = inject(OrquestadorService);
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
  faSubir = this.iconoStore.faSubir;

  /** Signals para estados */
  recursoSeleccionado = signal<Recurso | null>(null);

  isAutenticado = signal(false);
  isUsuarioNormal = signal(false);
  isAdministrador = signal(false);
  isGestor = signal(false);
  isSuperAdmin = signal(false);

  recursos = computed(() => this.cenadStore.recursos());
  categorias = computed(() => this.cenadStore.categorias());
  categoriasPadre = computed(() => this.cenadStore.categoriasPadre());
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  unidades = computed(() => this.datosPrincipalesStore.unidades());
  solicitudes = signal<Solicitud[]>([]);
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
  eventColors = EVENT_COLORS as Record<string, { primary: string; secondary: string }>;

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

  constructor() {
    this.initComponent();
  }

  /** Inicialización principal */
  private initComponent() {
    this.comprobarUser();
    //this.cargarEventos();
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
      color: this.eventColors[estado] || { primary: '#6c757d', secondary: '#e2e3e5' },
      meta: solicitud
    };
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

  // Categoría seleccionada
  categoriaSeleccionada = signal<Categoria | null>(null);
  subcategorias = signal<Categoria[]>([]);
  recursosCategoriaSeleccionada = signal<Recurso[]>([]);

  // Filtro
  filtro = signal<string>('');

  /** Recursos filtrados en función de categoría seleccionada y texto de búsqueda */
  recursosFiltrados = computed(() => {
    const term = this.filtro().toLowerCase();
    // Base inicial
    let listaBase = this.categoriaSeleccionada()
      ? this.recursosCategoriaSeleccionada()
      : this.recursos();
    // Filtro por nombre
    if (term) {
      listaBase = listaBase.filter(r => r.nombre.toLowerCase().includes(term));
    }
    return listaBase;
  });

  /** Seleccionar una categoría para filtrar los recursos */
  seleccionarCategoria(categoria: Categoria | null) {
    if (categoria) {
      this.categoriaSeleccionada.set(categoria);
      // Cargar recursos de la categoría
      this.orquestadorService.loadRecursosDeSubcategorias(categoria.idString).subscribe({
        next: (recursos) => this.recursosCategoriaSeleccionada.set(recursos ?? []),
        error: (err) => {
          console.error('Error cargando recursos de la categoría', err);
          this.recursosCategoriaSeleccionada.set([]);
        }
      });
      // Cargar subcategorías directas
      this.orquestadorService.loadSubcategorias(categoria.idString).subscribe({
        next: (subcats) => this.subcategorias.set(subcats ?? []),
        error: (err) => {
          console.error('Error cargando subcategorías', err);
          this.subcategorias.set([]);
        }
      });
    } else {
      // Si es null, se resetea a la vista principal
      this.categoriaSeleccionada.set(null);
      this.subcategorias.set([]);
      this.recursosCategoriaSeleccionada.set([]);
    }
  }

  /** Volver a la categoría padre (subir un nivel) */
  volverCategoriaAnterior() {
    const categoriaActual = this.categoriaSeleccionada();
    if (!categoriaActual) return;
    this.orquestadorService.loadCategoriaPadre(categoriaActual.idString).subscribe({
      next: (categoriaPadre) => {
        if (categoriaPadre) {
          // Si hay categoría padre, la seleccionamos
          this.seleccionarCategoria(categoriaPadre);
        } else {
          // Si no tiene padre → volver a la vista raíz
          this.limpiarCategoria();
        }
      },
      error: (err) => {
        console.error('Error cargando la categoría padre', err);
        // Si da error 502 u otro, volvemos a la vista raíz
        this.limpiarCategoria();
      }
    });
  }

  /** Quitar la categoría seleccionada (mostrar todos los recursos) */
  limpiarCategoria() {
    this.categoriaSeleccionada.set(null);
    this.subcategorias.set([]);
    this.recursosCategoriaSeleccionada.set([]);
  }

  /** Devuelve true si la categoría es categoriaPadre */
  esCategoriaPadre(categoria: Categoria | null): boolean {
    if (!categoria) return false; // Si no hay categoría seleccionada, no es padre
    return this.categoriasPadre().some(c => c.idString === categoria.idString);
  }

  seleccionarRecurso(id: string) {
    const recurso = this.recursosFiltrados().find(r => r.idString === id) || null;
    this.recursoSeleccionado.set(recurso);
    this.cargarEventosDeRecurso(recurso!.idString);
  }

  cargarEventosDeRecurso(idRecurso: string) {
    this.orquestadorService.loadSolicitudesDeRecurso(idRecurso).subscribe({
      next: (solicitudes) => {
        this.solicitudes.set(solicitudes ?? []);
        const eventos: CalendarEvent[] = [];
        // Añadir solicitudes
        this.solicitudes().forEach((solicitud: Solicitud) => {
          eventos.push(this.mapSolicitudToEvent(solicitud, solicitud.estado));
        });
        this.events.set(eventos);
        this.refresh.next();
      },
      error: (err) => {
        console.error('Error cargando solicitudes de recurso', err);
        this.solicitudes.set([]);
      }
    });
  }

  get eventosVisibles(): CalendarEvent[] {
    const fecha = this.viewDate();
    let inicio: Date;
    let fin: Date;

    switch (this.view()) {
      case 'month':
        // Para mes: mostrar todos los eventos que tengan algún día dentro del mes actual
        inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1, 0, 0, 0, 0);
        fin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'week':
        // Para semana: mostrar eventos entre el lunes y el domingo de la semana de viewDate
        const day = fecha.getDay(); // 0 = domingo, 1 = lunes, ...
        const diffToMonday = day === 0 ? -6 : 1 - day;
        inicio = startOfDay(new Date(fecha));
        inicio.setDate(inicio.getDate() + diffToMonday);
        fin = endOfDay(new Date(inicio));
        fin.setDate(fin.getDate() + 6);
        break;
      case 'day':
        inicio = startOfDay(fecha);
        fin = endOfDay(fecha);
        break;
      default:
        inicio = startOfDay(fecha);
        fin = endOfDay(fecha);
    }

    return this.events().filter(evento => {
      const eventoInicio = evento.start;
      const eventoFin = evento.end || evento.start;
      // Retornar solo si hay algún solapamiento con el rango visible
      return eventoFin >= inicio && eventoInicio <= fin;
    })
      .sort((a, b) => (a.start.getTime() - b.start.getTime())); // Ordenar por fecha de inicio ascendente
  }

  onEventClick(event: CalendarEvent) {
    if (event.id) {
      this.router.navigate([this.routesPaths.cenadHome, this.cenadVisitado()?.idString, this.routesPaths.solicitudes, event.id]);
    }
  }








  /*
    getColor(event: CalendarEvent) {
      return this.getColorForUnit(event.title);
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

  */
}
