import { Component, input } from '@angular/core';
import { Categoria } from '@interfaces/models/categoria';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css']
})
export class CategoriaComponent {
  categoria = input.required<Categoria>();
 }
