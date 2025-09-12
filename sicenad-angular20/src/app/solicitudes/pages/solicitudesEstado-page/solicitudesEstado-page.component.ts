import { Component, input } from '@angular/core';
import { Solicitud } from '@interfaces/models/solicitud';

@Component({
  selector: 'app-solicitudesEstado',
  imports: [],
  templateUrl: './solicitudesEstado-page.component.html',
  styleUrls: ['./solicitudesEstado-page.component.css'],
})
export class SolicitudesEstadoPageComponent {
  estado = input<string>();
  solicitudes = input<Solicitud[]>();
 }
