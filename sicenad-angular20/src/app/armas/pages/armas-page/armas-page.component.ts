import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { ArmaComponent } from '@app/armas/components/arma/arma.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { IdiomaService } from '@services/idiomaService';
import { OrquestadorService } from '@services/orquestadorService';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-armas',
  imports: [ArmaComponent, FontAwesomeModule, ReactiveFormsModule, RouterLink, UpperCasePipe, TranslateModule],
  templateUrl: './armas-page.component.html',
  styleUrls: ['./armas-page.component.css']
})
export class ArmasPageComponent {

  private utils = inject(UtilsStore);
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private orquestadorService = inject(OrquestadorService);
  private iconoStore = inject(IconosStore);
  private fb = inject(FormBuilder);
  private idiomaService = inject(IdiomaService);

  faVolver = this.iconoStore.faVolver;
  readonly routesPaths = RoutesPaths;
  armas = computed(() => this.datosPrincipalesStore.armas());
  tiposTiro = signal<{ idTipoTiro: number, nombre: string }[]>(this.utils.tiposTiro());
  armaForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    tipoTiro: ['', Validators.required]
  });

  get nombre() { return this.armaForm.get('nombre'); }
  get tipoTiro() { return this.armaForm.get('tipoTiro'); }

  crearArma() {
    if (this.armaForm.invalid) {
      this.armaForm.markAllAsTouched();
      return;
    }
    const { nombre, tipoTiro } = this.armaForm.value;
    this.orquestadorService.crearArma(nombre, tipoTiro).subscribe(success => {
      if (success) {
        this.armaForm.reset();
      } else {
        this.idiomaService.tVars('orquestador.errorCreandoArma', { nombre }).then(mensaje => {
          console.log(mensaje);
        });
      }
    });
  }
}
