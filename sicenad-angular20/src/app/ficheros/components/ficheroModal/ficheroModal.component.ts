import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CategoriaFichero } from '@interfaces/models/categoriaFichero';
import { FicheroRecurso } from '@interfaces/models/ficheroRecurso';

@Component({
  selector: 'app-ficheroModal',
  imports: [FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './ficheroModal.component.html',
  styleUrls: ['./ficheroModal.component.css'],
})
export class FicheroModalComponent {




  fichero = input<FicheroRecurso>();
  idRecurso = input<string>();
  categoriaFichero = input<CategoriaFichero>();
  output = output<void>();
}
