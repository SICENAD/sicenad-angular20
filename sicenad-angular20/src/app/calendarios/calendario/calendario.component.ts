import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CalendarEvent,
  CalendarMonthViewComponent,
  CalendarWeekViewComponent,
  CalendarDayViewComponent,
  CalendarView,
  DateAdapter
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { EventosService } from '../eventos.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EVENT_COLORS, TipoEvento } from '../colors.enum';


@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarMonthViewComponent,
    CalendarWeekViewComponent,
    CalendarDayViewComponent
  ],
  templateUrl: './calendario.component.html'
})
export class CalendarioComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate = new Date();

  events: CalendarEvent[] = [];
  selectedEvent: CalendarEvent | null = null;
  editingEvent: CalendarEvent | null = null;

  loading = false;
  loadingCrear = false;

  eventoForm: FormGroup;
  EVENT_COLORS = EVENT_COLORS;
  tiposEventos: TipoEvento[] = ['reunion', 'cumpleaños', 'tarea', 'otro'];

  constructor(private eventosService: EventosService, private fb: FormBuilder) {
    this.eventoForm = this.fb.group({
      title: ['', Validators.required],
      start: ['', Validators.required],
      end: [''],
      description: [''],
      tipo: ['reunion' as TipoEvento, Validators.required]
    });
  }

  ngOnInit() {
      console.log(this.EVENT_COLORS);

    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    this.eventosService.getEventos().subscribe({
      next: data => {
        this.events = data;
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar eventos', err);
        this.loading = false;
      }
    });
  }

  agregarEvento() {
    if (this.eventoForm.invalid) return;

    const formValue = this.eventoForm.value as { title: string; start: string; end?: string; description?: string; tipo: TipoEvento };
    const start = new Date(formValue.start);
    const end = formValue.end ? new Date(formValue.end) : undefined;
    const color = EVENT_COLORS[formValue.tipo];

    const eventoData = { title: formValue.title, start, end, description: formValue.description, tipo: formValue.tipo };

    this.loadingCrear = true;

    if (this.editingEvent) {
      const id = this.editingEvent.meta?.id;
      if (!id) return;

      this.eventosService.editarEvento(id, eventoData).subscribe({
        next: eventoEditado => {
          eventoEditado.color = color;
          this.events = this.events.map(ev => ev.meta?.id === id ? eventoEditado : ev);
          this.eventoForm.reset({ tipo: 'reunion' });
          this.editingEvent = null;
          this.loadingCrear = false;
        },
        error: err => {
          console.error('Error al editar evento', err);
          this.loadingCrear = false;
        }
      });
    } else {
      this.eventosService.crearEvento(eventoData).subscribe({
        next: nuevoEvento => {
          nuevoEvento.color = color;
          this.events = [...this.events, nuevoEvento];
          this.eventoForm.reset({ tipo: 'reunion' });
          this.loadingCrear = false;
        },
        error: err => {
          console.error('Error al crear evento', err);
          this.loadingCrear = false;
        }
      });
    }
  }

  handleEvent(event: CalendarEvent) {
    this.selectedEvent = event;
    this.editingEvent = event;

    this.eventoForm.setValue({
      title: event.title,
      start: this.formatForInput(event.start),
      end: event.end ? this.formatForInput(event.end) : '',
      description: event.meta?.description || '',
      tipo: event.meta?.tipo || 'reunion'
    });
  }

  borrarEvento(evento: CalendarEvent | null) {
    if (!evento || !evento.meta?.id) return;
    const id = evento.meta.id;
    if (!confirm('¿Seguro que quieres eliminar este evento?')) return;

    this.eventosService.eliminarEvento(id).subscribe({
      next: () => {
        this.events = this.events.filter(ev => ev.meta?.id !== id);
        this.selectedEvent = null;
        if (this.editingEvent?.meta?.id === id) this.editingEvent = null;
      },
      error: err => console.error('Error al eliminar evento', err)
    });
  }

  // Navegación
  previous() {
    const newDate = new Date(this.viewDate);
    if (this.view === CalendarView.Month) newDate.setMonth(newDate.getMonth() - 1);
    if (this.view === CalendarView.Week) newDate.setDate(newDate.getDate() - 7);
    if (this.view === CalendarView.Day) newDate.setDate(newDate.getDate() - 1);
    this.viewDate = newDate;
  }

  next() {
    const newDate = new Date(this.viewDate);
    if (this.view === CalendarView.Month) newDate.setMonth(newDate.getMonth() + 1);
    if (this.view === CalendarView.Week) newDate.setDate(newDate.getDate() + 7);
    if (this.view === CalendarView.Day) newDate.setDate(newDate.getDate() + 1);
    this.viewDate = newDate;
  }

  today() {
    this.viewDate = new Date();
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  formatForInput(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }
}
