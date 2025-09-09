import { Component } from '@angular/core';
import { FicheroModalComponent } from '../ficheroModal/ficheroModal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-fichero',
  imports: [FicheroModalComponent, FontAwesomeModule],
  templateUrl: './fichero.component.html',
  styleUrls: ['./fichero.component.css'],
})
export class FicheroComponent { }
