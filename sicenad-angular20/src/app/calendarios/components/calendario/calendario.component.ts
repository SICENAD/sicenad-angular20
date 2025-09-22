import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { CalendarDayViewComponent, CalendarEvent, CalendarMonthViewComponent, CalendarView, CalendarWeekViewComponent } from 'angular-calendar';
import { addHours, endOfDay, startOfDay } from 'date-fns';
import { CenadStore } from '@stores/cenad.store';
import { RoutesPaths } from '@app/app.routes';
import { Subject } from 'rxjs';
import { CalendarHeaderComponent } from '@app/calendarios/components/calendarHeader/calendarHeader.component';
import { Solicitud } from '@interfaces/models/solicitud';
import { EVENT_COLORS } from '@interfaces/enums/colors.enum';

@Component({
  selector: 'app-calendarioComponente',
  standalone: true,
  imports: [
    CommonModule,
    CalendarHeaderComponent,
    CalendarMonthViewComponent,
    CalendarWeekViewComponent,
    CalendarDayViewComponent,
  ],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css'],
  providers: [DatePipe]
})
export class CalendarioComponent {
  // Stores
  private router = inject(Router);
  private cenadStore = inject(CenadStore);

  readonly routesPaths = RoutesPaths;

  /** Signals para estados */
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  solicitudes = input<Solicitud[]>();

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

  constructor() {
    effect(() => {
      const eventos: CalendarEvent[] = [];
      // Añadir solicitudes
      this.solicitudes()?.forEach(solicitud => {
        eventos.push(this.mapSolicitudToEvent(solicitud, solicitud.estado));
      });
      this.events.set(eventos);
      this.refresh.next();
    });
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
}
