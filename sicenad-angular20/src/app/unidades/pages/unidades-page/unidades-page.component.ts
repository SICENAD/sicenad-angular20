import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { UnidadComponent } from '@app/unidades/components/unidad/unidad.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrquestadorService } from '@services/orquestadorService';
import { AuthStore } from '@stores/auth.store';
import { CenadStore } from '@stores/cenad.store';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { IconosStore } from '@stores/iconos.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';

@Component({
  selector: 'app-unidades-page',
  imports: [FontAwesomeModule, ReactiveFormsModule, RouterLink, UnidadComponent],
  templateUrl: './unidades-page.component.html',
  styleUrls: ['./unidades-page.component.css']
})
export class UnidadesPageComponent {

  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private orquestadorService = inject(OrquestadorService);
  private iconoStore = inject(IconosStore);
  private fb = inject(FormBuilder);
  private auth = inject(AuthStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueado = inject(UsuarioLogueadoStore);
  faVolver = this.iconoStore.faVolver;
  readonly routesPaths = RoutesPaths;
  unidades = computed(() => this.datosPrincipalesStore.unidades());
  name = computed(() => {
    return this.rol() === 'Superadministrador' ? this.routesPaths.superadministrador : this.routesPaths.cenadHome;
  });
  idCenadVisitado = computed(() => {
    return this.cenadStore.cenadVisitado()?.idString;
  });
  isMiCenad = computed(() => {
    let idCenadPropio = this.usuarioLogueado.cenadPropio() ? this.usuarioLogueado.cenadPropio()?.idString : '';
    return (this.idCenadVisitado() == idCenadPropio);
  });
  rol = signal<string | null>(this.auth.rol());
  params = computed(() => {
    return this.rol() === 'Superadministrador' ? {} : this.idCenadVisitado();
  });

  unidadForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    tfno: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    direccion: ['', Validators.required],
    poc: ['', Validators.required]
  });

  get nombre() { return this.unidadForm.get('nombre'); }
  get descripcion() { return this.unidadForm.get('descripcion'); }
  get email() { return this.unidadForm.get('email'); }
  get tfno() { return this.unidadForm.get('tfno'); }
  get direccion() { return this.unidadForm.get('direccion'); }
  get poc() { return this.unidadForm.get('poc'); }

  crearUnidad() {
    if (this.unidadForm.invalid) {
      this.unidadForm.markAllAsTouched();
      return;
    }
    const { nombre, descripcion, email, tfno, direccion, poc } = this.unidadForm.value;
    this.orquestadorService.crearUnidad(nombre, descripcion, email, tfno, direccion, poc).subscribe(success => {
      if (success) {
        this.unidadForm.reset();
      } else {
        console.error('Error al crear la unidad');
      }
    });
  }
}
