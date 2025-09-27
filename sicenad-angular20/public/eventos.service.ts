import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CalendarEvent } from 'angular-calendar';





// lo dejo por aqui por si quiero enredar con esto pero actualmente no se usa
@Injectable({ providedIn: 'root' })
export class EventosService {
  private readonly API_URL = 'https://jsonplaceholder.typicode.com/posts'; // ⚠️ Reemplaza con tu API real

  constructor(private http: HttpClient) {}

  getEventos(): Observable<CalendarEvent[]> {
    return this.http.get<any[]>(this.API_URL).pipe(
      map(data => data.map(item => ({
        start: new Date(),
        title: item.title,
        color: { primary: '#1e90ff', secondary: '#D1E8FF' },
        meta: { description: item.body, id: item.id }
      })))
    );
  }

  crearEvento(evento: { title: string; start: Date; end?: Date; description?: string; }): Observable<CalendarEvent> {
    return this.http.post<any>(this.API_URL, evento).pipe(
      map(response => ({
        start: new Date(evento.start),
        end: evento.end ? new Date(evento.end) : undefined,
        title: evento.title,
        color: { primary: '#1e90ff', secondary: '#D1E8FF' },
        meta: { description: evento.description, id: response.id }
      }))
    );
  }

  editarEvento(id: number, evento: { title: string; start: Date; end?: Date; description?: string; }): Observable<CalendarEvent> {
    return this.http.put<any>(`${this.API_URL}/${id}`, evento).pipe(
      map(() => ({
        start: new Date(evento.start),
        end: evento.end ? new Date(evento.end) : undefined,
        title: evento.title,
        color: { primary: '#1e90ff', secondary: '#D1E8FF' },
        meta: { description: evento.description, id }
      }))
    );
  }

  eliminarEvento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
