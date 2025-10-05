import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrquestadorService } from '@services/orquestadorService';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { AuthStore } from '@stores/auth.store';
import { CenadStore } from '@stores/cenad.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { NormativaComponent } from '@app/normativas/components/normativa/normativa.component';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-normativas',
  imports: [NormativaComponent, FontAwesomeModule, ReactiveFormsModule, RouterLink, TranslateModule, UpperCasePipe],
  templateUrl: './normativas-page.component.html',
  styleUrls: ['./normativas-page.component.css']
})
export class NormativasPageComponent {

  private utils = inject(UtilsStore);
  private orquestadorService = inject(OrquestadorService);
  private iconoStore = inject(IconosStore);
  private fb = inject(FormBuilder);
  private auth = inject(AuthStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueado = inject(UsuarioLogueadoStore);

  faVolver = this.iconoStore.faVolver;
  readonly routesPaths = RoutesPaths;
  normativas = computed(() => this.cenadStore.normativas());
  sizeMaxDocRecurso = computed(() => this.utils.sizeMaxDocRecurso());
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());

  isAdminEsteCenad = computed(() => {
    let idCenadPropio = this.usuarioLogueado.cenadPropio() ? this.usuarioLogueado.cenadPropio()?.idString : '';
    return (this.cenadVisitado()?.idString === idCenadPropio) && (this.auth.rol() === RolUsuario.Administrador);
  });

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  archivoFile = signal<File | null>(null);

  normativaForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    nombreArchivo: [null, Validators.required]
  });

  get nombre() { return this.normativaForm.get('nombre'); }
  get descripcion() { return this.normativaForm.get('descripcion'); }
  get nombreArchivo() { return this.normativaForm.get('nombreArchivo'); }

  onFileChange(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.normativaForm.patchValue({ nombreArchivo: file });
      this.archivoFile.set(file);
    } else {
      this.normativaForm.patchValue({ nombreArchivo: null });
      this.archivoFile.set(null);
    }
  }

  crearNormativa() {
    if (this.normativaForm.invalid) {
      this.normativaForm.markAllAsTouched();
      return;
    }
    const idCenad = this.cenadVisitado()?.idString || '';
    const { nombre, descripcion, nombreArchivo } = this.normativaForm.value;
    this.orquestadorService.crearNormativa(nombre, descripcion, nombreArchivo, idCenad).subscribe(success => {
      if (success) {
        this.normativaForm.reset();
        if (this.fileInput) this.fileInput.nativeElement.value = '';
      }
    });
  }
}
