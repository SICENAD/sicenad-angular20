import { Component, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrquestadorService } from '@services/orquestadorService';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { IconosStore } from '@stores/iconos.store';
import { CategoriaFicheroComponent } from "@app/categoriasFichero/components/categoriaFichero/categoriaFichero.component";
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-categoriasFichero-page',
  imports: [FontAwesomeModule, ReactiveFormsModule, RouterLink, CategoriaFicheroComponent, TranslateModule, UpperCasePipe],
  templateUrl: './categoriasFichero-page.component.html',
  styleUrls: ['./categoriasFichero-page.component.css']
})
export class CategoriasFicheroPageComponent {

  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private orquestadorService = inject(OrquestadorService);
  private iconoStore = inject(IconosStore);
  private fb = inject(FormBuilder);

  faVolver = this.iconoStore.faVolver;
  readonly routesPaths = RoutesPaths;
  categoriasFichero = computed(() => this.datosPrincipalesStore.categoriasFichero());
  categoriaFicheroForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    tipo: [9, Validators.required],
    descripcion: ['', Validators.required],

  });

  get nombre() { return this.categoriaFicheroForm.get('nombre'); }
  get tipo() { return this.categoriaFicheroForm.get('tipo'); }
  get descripcion() { return this.categoriaFicheroForm.get('descripcion'); }

  crearCategoriaFichero() {
    if (this.categoriaFicheroForm.invalid) {
      this.categoriaFicheroForm.markAllAsTouched();
      return;
    }
    const { nombre, descripcion, tipo } = this.categoriaFicheroForm.value;
    this.orquestadorService.crearCategoriaFichero(nombre, tipo, descripcion).subscribe(success => {
      if (success) {
        this.categoriaFicheroForm.reset();
      } 
    });
  }
}
