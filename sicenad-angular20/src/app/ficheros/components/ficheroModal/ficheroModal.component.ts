import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-ficheroModal',
  imports: [FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './ficheroModal.component.html',
  styleUrls: ['./ficheroModal.component.css'],
})
export class FicheroModalComponent { }
