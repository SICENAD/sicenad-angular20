import { UpperCasePipe } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Normativa } from '@interfaces/models/normativa';
import { TranslateModule } from '@ngx-translate/core';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-normativa-modal',
  imports: [FontAwesomeModule, ReactiveFormsModule, TranslateModule, UpperCasePipe],
  templateUrl: './normativaModal.component.html',
  styleUrls: ['./normativaModal.component.css']
})
export class NormativaModalComponent {

  private utils = inject(UtilsStore);
  private cenadStore = inject(CenadStore);
  private orquestadorService = inject(OrquestadorService);
  private iconos = inject(IconosStore);
  private fb = inject(FormBuilder);

  faEdit = this.iconos.faEdit;
  // --- Inputs / Outputs ---
  normativa = input<Normativa>();
  output = output<void>();

  // --- State ---
  sizeMaxDocRecurso = computed(() => this.utils.sizeMaxDocRecurso());
  idNormativa = computed(() => this.normativa()?.idString || '');
  _idModal = signal('modal-normativa-' + this.normativa()?.idString);
  _idModalEliminar = signal('modal-normativa-eliminar-' + this.normativa()?.idString);
  idModal = computed(() => this._idModal() + this.idNormativa());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idNormativa());
  idCenad = computed(() => this.cenadStore.cenadVisitado()?.idString || '');
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  archivoActual = signal<string>((this.normativa()?.nombreArchivo || ''));
  urlArchivoActual = signal<string>('');
  archivoFile = signal<File | null>(null);

  normativaForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    nombreArchivo: [null]
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
      this.archivoFile.set(null);
    }
  }

  private esperarYCargarArchivo = void effect(() => {
    this.archivoActual.set(this.normativa()?.nombreArchivo || '');
    const archivo = this.normativa()?.nombreArchivo;
    if (!archivo) return;
    if (!this.idNormativa()) return;
  });

  ngOnInit(): void {
    if (this.normativa()) {
      this.normativaForm.patchValue({
        nombre: this.normativa()?.nombre || '',
        descripcion: this.normativa()?.descripcion || '',
      });
    }
  }

  editarNormativa() {
    if (this.normativaForm.invalid) {
      this.normativaForm.markAllAsTouched();
      return;
    }
    const { nombre, descripcion } = this.normativaForm.value;
    const archivo = this.archivoFile();
    this.orquestadorService.actualizarNormativa(nombre, descripcion, archivo, this.archivoActual(), this.idCenad(), this.idNormativa()).subscribe({
      next: res => {
        if (res) {
          this.output.emit(); // notificamos al padre
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
  borrarNormativa() {
    const nombreArchivo = this.normativa()?.nombreArchivo || '';
    this.orquestadorService.borrarNormativa(nombreArchivo, this.idNormativa(), this.idCenad()).subscribe(() => {
      this.output.emit(); // notificamos al padre
    });
  }
}
