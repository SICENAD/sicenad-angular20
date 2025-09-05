import { Component, input } from '@angular/core';
import { CategoriaFicheroModalComponent } from '../categoriaFicheroModal/categoriaFicheroModal.component';
import { CategoriaFichero } from '@interfaces/models/categoriaFichero';

@Component({
  selector: 'app-categoriaFichero',
  imports: [CategoriaFicheroModalComponent],
  templateUrl: './categoriaFichero.component.html',
  styleUrls: ['./categoriaFichero.component.css']
})
export class CategoriaFicheroComponent {

    categoriaFichero = input.required<CategoriaFichero>();
}
