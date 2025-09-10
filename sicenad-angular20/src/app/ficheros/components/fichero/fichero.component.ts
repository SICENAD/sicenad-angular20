import { Component, input } from '@angular/core';
import { FicheroModalComponent } from '../ficheroModal/ficheroModal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FicheroRecurso } from '@interfaces/models/ficheroRecurso';

@Component({
  selector: 'app-fichero',
  imports: [FicheroModalComponent, FontAwesomeModule],
  templateUrl: './fichero.component.html',
  styleUrls: ['./fichero.component.css'],
})
export class FicheroComponent {
  fichero = input<FicheroRecurso>();
}
