import { Component, input } from '@angular/core';
import { UnidadModalComponent } from '../unidadModal/unidadModal.component';
import { Unidad } from '@interfaces/models/unidad';

@Component({
  selector: 'app-unidad',
  imports: [UnidadModalComponent],
  templateUrl: './unidad.component.html',
  styleUrls: ['./unidad.component.css']
})
export class UnidadComponent {
  unidad = input.required<Unidad>();
}
