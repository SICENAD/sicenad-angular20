import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoriaComponent } from '@app/categorias/components/categoria/categoria.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-categorias',
  imports: [RouterLink, FontAwesomeModule, ReactiveFormsModule, CategoriaComponent],
  templateUrl: './categorias-page.component.html',
  styleUrls: ['./categorias-page.component.css']
})
export class CategoriasPageComponent { }
