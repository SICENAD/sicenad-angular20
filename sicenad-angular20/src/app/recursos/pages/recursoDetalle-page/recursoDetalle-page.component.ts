import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-recursoDetalle',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink],
  templateUrl: './recursoDetalle-page.component.html',
  styleUrls: ['./recursoDetalle-page.component.css']
})
export class RecursoDetallePageComponent {
}
