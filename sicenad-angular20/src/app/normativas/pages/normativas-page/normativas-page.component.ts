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
import { IdiomaService } from '@services/idiomaService';
import { UtilService } from '@services/utilService';

@Component({
  selector: 'app-normativas',
  imports: [NormativaComponent, FontAwesomeModule, ReactiveFormsModule, RouterLink, TranslateModule, UpperCasePipe],
  templateUrl: './normativas-page.component.html',
  styleUrls: ['./normativas-page.component.css']
})
export class NormativasPageComponent {

  private utils = inject(UtilsStore);
  private orquestadorService = inject(OrquestadorService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private iconoStore = inject(IconosStore);
  private fb = inject(FormBuilder);
  private auth = inject(AuthStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueado = inject(UsuarioLogueadoStore);

  faVolver = this.iconoStore.faVolver;
  readonly routesPaths = RoutesPaths;
  normativas = computed(() => this.cenadStore.normativas());
  sizeMaxDocRecurso = computed(() => this.utils.sizeMaxDocRecurso());
  sizeMaxDocRecursoBytes = computed<number>(() => {
    const raw = this.sizeMaxDocRecurso();
    if (raw == null) return 0;
    const val = Number(raw);
    if (isNaN(val) || val <= 0) return 0;
    // Si el valor parece ya estar en bytes (>= 1 MiB), devolver tal cual.
    // Si es un número pequeño (p. ej. 1..1000) lo interpretamos como MB.
    if (val >= 1024 * 1024) return Math.floor(val);
    // Interpretar como MB por defecto
    return Math.floor(val * 1024 * 1024);
  });
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());

  isAdminEsteCenad = computed(() => {
    let idCenadPropio = this.usuarioLogueado.cenadPropio() ? this.usuarioLogueado.cenadPropio()?.Id : '';
    return (this.cenadVisitado()?.Id === idCenadPropio) && (this.auth.rol() === RolUsuario.Administrador);
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
    const input = event.target as HTMLInputElement;
    const file: File | null = input?.files && input.files[0];
    if (!file) {
      this.normativaForm.patchValue({ nombreArchivo: null });
      this.archivoFile.set(null);
      return;
    }
    const maxBytes = this.sizeMaxDocRecursoBytes(); 
    if (typeof maxBytes === 'number' && file.size > maxBytes) {
      const maxMb = (maxBytes / (1024 * 1024)).toFixed(2);
      const mensaje = this.idiomaService.t('archivos.errorTamanoArchivo');
      this.utilService.toast(`${mensaje}: ${maxMb} MB.`, 'error');
      // limpiar selección
      input.value = '';
      this.normativaForm.patchValue({ nombreArchivo: null });
      this.archivoFile.set(null);
      return;
    }
    // aceptado
    this.normativaForm.patchValue({ nombreArchivo: file });
    this.archivoFile.set(file);
  }

  crearNormativa() {
    if (this.normativaForm.invalid) {
      this.normativaForm.markAllAsTouched();
      return;
    }
    const idCenad = this.cenadVisitado()?.Id || '';
    const nombreCenad = this.cenadVisitado()?.nombre || '';
    const { nombre, descripcion, nombreArchivo } = this.normativaForm.value;
    this.orquestadorService.crearNormativa(nombre, descripcion, nombreArchivo, idCenad, nombreCenad).subscribe(success => {
      if (success) {
        this.normativaForm.reset();
        if (this.fileInput) this.fileInput.nativeElement.value = '';
      }
    });
  }
}
