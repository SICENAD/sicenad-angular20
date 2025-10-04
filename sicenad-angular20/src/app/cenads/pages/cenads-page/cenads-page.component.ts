import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { UtilsStore } from '@stores/utils.store';
import { CenadComponent } from '@app/cenads/components/cenad/cenad.component';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { OrquestadorService } from '@services/orquestadorService';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
@Component({
  selector: 'app-cenads',
  imports: [CenadComponent,ReactiveFormsModule, TranslateModule, UpperCasePipe],
  templateUrl: './cenads-page.component.html',
  styleUrls: ['./cenads-page.component.css'],
})
export class CenadsPageComponent {

  private utils = inject(UtilsStore);
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private orquestadorService = inject(OrquestadorService);
  private fb = inject(FormBuilder);

  cenads = computed(() => this.datosPrincipalesStore.cenads());
  provincias = signal<{ idProvincia: number, nombre: string }[]>(this.utils.provincias());
  sizeMaxEscudo = computed(() => this.utils.sizeMaxEscudo());
  previewEscudo: string | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

 cenadForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    provincia: [0, [Validators.required, Validators.min(1)]],
    direccion: ['', Validators.required],
    tfno: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    descripcion: ['', Validators.required],
    escudo: [null, Validators.required]
  });

  get nombre() { return this.cenadForm.get('nombre'); }
  get provincia() { return this.cenadForm.get('provincia'); }
  get direccion() { return this.cenadForm.get('direccion'); }
  get tfno() { return this.cenadForm.get('tfno'); }
  get email() { return this.cenadForm.get('email'); }
  get descripcion() { return this.cenadForm.get('descripcion'); }
  get escudo() { return this.cenadForm.get('escudo'); }

  onFileChange(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.cenadForm.patchValue({ escudo: file });
      this.previewEscudo = URL.createObjectURL(file);
    } else {
      this.cenadForm.patchValue({ escudo: null });
      this.previewEscudo = null;
    }
  }

   crearCenad() {
    if (this.cenadForm.invalid) {
      this.cenadForm.markAllAsTouched();
      return;
    }
    const { nombre, provincia, direccion, tfno, email, descripcion, escudo } = this.cenadForm.value;
    this.orquestadorService.crearCenad(
      nombre, provincia, direccion, tfno, email, descripcion, escudo
    ).subscribe(success => {
      if (success) {
        this.cenadForm.reset({ provincia: 0 });
        this.previewEscudo = null;
        if (this.fileInput) this.fileInput.nativeElement.value = '';
      }
    });
  }
}
