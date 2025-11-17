import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { UtilsStore } from '@stores/utils.store';
import { CenadComponent } from '@app/cenads/components/cenad/cenad.component';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { OrquestadorService } from '@services/orquestadorService';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { IdiomaService } from '@services/idiomaService';
import { UtilService } from '@services/utilService';
@Component({
  selector: 'app-cenads',
  imports: [CenadComponent, ReactiveFormsModule, TranslateModule, UpperCasePipe],
  templateUrl: './cenads-page.component.html',
  styleUrls: ['./cenads-page.component.css'],
})
export class CenadsPageComponent {
  private utils = inject(UtilsStore);
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private orquestadorService = inject(OrquestadorService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private fb = inject(FormBuilder);

  cenads = computed(() => this.datosPrincipalesStore.cenads());
  provincias = signal<{ idProvincia: number; nombre: string }[]>(this.utils.provincias());
  sizeMaxEscudo = computed(() => this.utils.sizeMaxEscudo());
  sizeMaxEscudoBytes = computed<number>(() => {
    const raw = this.sizeMaxEscudo();
    if (raw == null) return 0;
    const val = Number(raw);
    if (isNaN(val) || val <= 0) return 0;
    // Si el valor parece ya estar en bytes (>= 1 MiB), devolver tal cual.
    // Si es un número pequeño (p. ej. 1..1000) lo interpretamos como MB.
    if (val >= 1024 * 1024) return Math.floor(val);
    // Interpretar como MB por defecto
    return Math.floor(val * 1024 * 1024);
  });
  previewEscudo: string | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  cenadForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    provincia: [0, [Validators.required, Validators.min(1)]],
    direccion: ['', Validators.required],
    tfno: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    descripcion: ['', Validators.required],
    escudo: [null, Validators.required],
  });

  get nombre() {
    return this.cenadForm.get('nombre');
  }
  get provincia() {
    return this.cenadForm.get('provincia');
  }
  get direccion() {
    return this.cenadForm.get('direccion');
  }
  get tfno() {
    return this.cenadForm.get('tfno');
  }
  get email() {
    return this.cenadForm.get('email');
  }
  get descripcion() {
    return this.cenadForm.get('descripcion');
  }
  get escudo() {
    return this.cenadForm.get('escudo');
  }

  onFileChange(event: any) {
    const input = event.target as HTMLInputElement;
    const file: File | null = input?.files && input.files[0];
    if (!file) {
      this.cenadForm.patchValue({ escudo: null });
      this.previewEscudo = null;
      return;
    }
    const maxBytes = this.sizeMaxEscudoBytes();
    if (typeof maxBytes === 'number' && file.size > maxBytes) {
      const maxMb = (maxBytes / (1024 * 1024)).toFixed(2);
      const mensaje = this.idiomaService.t('archivos.errorTamanoArchivo');
      this.utilService.toast(`${mensaje}: ${maxMb} MB.`, 'error');
      // limpiar selección
      input.value = '';
      this.cenadForm.patchValue({ escudo: null });
      this.previewEscudo = null;
      return;
    }
    // aceptado
    this.cenadForm.patchValue({ escudo: file });
    this.previewEscudo = URL.createObjectURL(file);
  }

  crearCenad() {
    if (this.cenadForm.invalid) {
      this.cenadForm.markAllAsTouched();
      return;
    }
    const { nombre, provincia, direccion, tfno, email, descripcion, escudo } = this.cenadForm.value;
    this.orquestadorService
      .crearCenad(nombre, provincia, direccion, tfno, email, descripcion, escudo)
      .subscribe((success) => {
        if (success) {
          this.cenadForm.reset({ provincia: 0 });
          this.previewEscudo = null;
          if (this.fileInput) this.fileInput.nativeElement.value = '';
        }
      });
  }
}
