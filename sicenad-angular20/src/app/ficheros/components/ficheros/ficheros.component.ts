import { Component, input } from '@angular/core';
import { FicheroComponent } from '../fichero/fichero.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FicheroRecurso } from '@interfaces/models/ficheroRecurso';

@Component({
  selector: 'app-ficheros',
  imports: [FicheroComponent, ReactiveFormsModule],
  templateUrl: './ficheros.component.html',
  styleUrls: ['./ficheros.component.css'],
})
export class FicherosComponent {
  isGestorEsteRecurso = input<boolean>();
  ficheros = input<FicheroRecurso[]>();
 }
