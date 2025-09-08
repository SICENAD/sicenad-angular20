import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-categoriaModal',
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './categoriaModal.component.html',
  styleUrls: ['./categoriaModal.component.css']
})
export class CategoriaModalComponent { }
