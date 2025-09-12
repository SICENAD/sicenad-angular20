import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-solicitudes-page',
  imports: [FontAwesomeModule, RouterLink, ReactiveFormsModule],
  templateUrl: './solicitudes-page.component.html',
  styleUrls: ['./solicitudes-page.component.css']
})
export class SolicitudesPageComponent { }
