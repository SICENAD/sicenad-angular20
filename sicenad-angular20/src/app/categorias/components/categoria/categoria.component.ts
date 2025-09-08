import { Component, input } from '@angular/core';
import { CategoriaModalComponent } from '../categoriaModal/categoriaModal.component';
import { Categoria } from '@interfaces/models/categoria';

@Component({
  selector: 'app-categoria',
  imports: [CategoriaModalComponent],
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css']
})
export class CategoriaComponent {
  categoria = input.required<Categoria>();
 }
