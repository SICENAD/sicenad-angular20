import { Component, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { TipoFormularioComponent } from '@app/tiposFormulario/components/tipoFormulario/tipoFormulario.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrquestadorService } from '@services/orquestadorService';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-tipos-formulario-page',
  imports: [FontAwesomeModule, ReactiveFormsModule, RouterLink, TipoFormularioComponent],
  templateUrl: './tiposFormulario-page.component.html',
  styleUrls: ['./tiposFormulario-page.component.css']
})
export class TiposFormularioPageComponent {

  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private orquestadorService = inject(OrquestadorService);
  private iconoStore = inject(IconosStore);
  private fb = inject(FormBuilder);

  faVolver = this.iconoStore.faVolver;
  readonly routesPaths = RoutesPaths;
  tiposFormulario = computed(() => this.datosPrincipalesStore.tiposFormulario());
  tipoFormularioForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required]
  });

  get nombre() { return this.tipoFormularioForm.get('nombre'); }
  get descripcion() { return this.tipoFormularioForm.get('descripcion'); }

  crearTipoFormulario() {
    if (this.tipoFormularioForm.invalid) {
      this.tipoFormularioForm.markAllAsTouched();
      return;
    }
    const { nombre, descripcion } = this.tipoFormularioForm.value;
    this.orquestadorService.crearTipoFormulario(nombre, descripcion).subscribe(success => {
      if (success) {
        this.tipoFormularioForm.reset();
      } else {
        console.error('Error al crear el tipo de formulario');
      }
    });
  }
}
