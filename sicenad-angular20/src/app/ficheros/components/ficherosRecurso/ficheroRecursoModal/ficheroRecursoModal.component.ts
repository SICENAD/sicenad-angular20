import { UpperCasePipe } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FicheroRecurso } from '@interfaces/models/ficheroRecurso';
import { TranslateModule } from '@ngx-translate/core';
import { IdiomaService } from '@services/idiomaService';
import { OrquestadorService } from '@services/orquestadorService';
import { UtilService } from '@services/utilService';
import { CenadStore } from '@stores/cenad.store';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-ficheroRecursoModal',
  imports: [FontAwesomeModule, ReactiveFormsModule, TranslateModule, UpperCasePipe],
  templateUrl: './ficheroRecursoModal.component.html',
  styleUrls: ['./ficheroRecursoModal.component.css'],
})
export class FicheroRecursoModalComponent {
  private utils = inject(UtilsStore);
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private cenadStore = inject(CenadStore);
  private orquestadorService = inject(OrquestadorService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private iconos = inject(IconosStore);
  private fb = inject(FormBuilder);

  faEdit = this.iconos.faEdit;

  fichero = input<FicheroRecurso>();
  idRecurso = input.required<string>();
  output = output<void>();

  categoriasFichero = computed(() => this.datosPrincipalesStore.categoriasFichero());
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
  idFichero = computed(() => this.fichero()?.Id || '');
  _idModal = signal('modal-fichero-' + this.fichero()?.Id);
  _idModalEliminar = signal('modal-fichero-eliminar-' + this.fichero()?.Id);
  idModal = computed(() => this._idModal() + this.idFichero());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idFichero());
  nombreCenad = computed(() => this.cenadStore.cenadVisitado()?.nombre || '');
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  archivoActual = signal<string>((this.fichero()?.nombreArchivo || ''));
  urlArchivoActual = signal<string>('');
  archivoFile = signal<File | null>(null);

  ficheroForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    categoriaFichero: [null, Validators.required],
    nombreArchivo: [null]
  });

  get nombre() { return this.ficheroForm.get('nombre'); }
  get descripcion() { return this.ficheroForm.get('descripcion'); }
  get categoriaFichero() { return this.ficheroForm.get('categoriaFichero'); }
  get nombreArchivo() { return this.ficheroForm.get('nombreArchivo'); }

  onFileChange(event: any) {
    const file: File | undefined = event?.target?.files?.[0];
    if (!file) {
      this.ficheroForm.patchValue({ nombreArchivo: null });
      this.archivoFile.set(null);
      return;
    }
    const maxBytes = this.sizeMaxDocRecursoBytes();
    if (typeof maxBytes === 'number' && maxBytes > 0 && file.size > maxBytes) {
      const maxMb = (maxBytes / (1024 * 1024)).toFixed(2);
      const mensaje = this.idiomaService.t('archivos.errorTamanoArchivo');
      this.utilService.toast(`${mensaje}: ${maxMb} MB.`, 'error');      // limpiar selección visual y formulario
      try { if (this.fileInput && this.fileInput.nativeElement) this.fileInput.nativeElement.value = ''; } catch {}
      this.ficheroForm.patchValue({ nombreArchivo: null });
      this.archivoFile.set(null);
      return;
    }
    // aceptado
    this.ficheroForm.patchValue({ nombreArchivo: file });
    this.archivoFile.set(file);
  }

  private esperarYCargarArchivo = void effect(() => {
    this.archivoActual.set(this.fichero()?.nombreArchivo || '');
    const archivo = this.fichero()?.nombreArchivo;
    if (!archivo) return;
    if (!this.idFichero()) return;
  });

  constructor() {
    effect(() => {
      const ficheroActual = this.fichero();
      const categoriasFichero = this.categoriasFichero();
      if (!categoriasFichero || !ficheroActual) return;
      // Cargar la categoría de fichero del fichero
      this.orquestadorService.loadCategoriaFicheroDeFichero(ficheroActual.Id).subscribe({
        next: (categoriaFichero) => {
          const categoriaFicheroRef = categoriaFichero
            ? categoriasFichero.find(c => c.Id === categoriaFichero.Id) || null
            : null;
          this.ficheroForm.patchValue({ categoriaFichero: categoriaFicheroRef });
        },
        error: () => {
          this.ficheroForm.patchValue({ categoriaFichero: null });
        }
      });
    });
  }

  ngOnInit(): void {
    if (this.fichero()) {
      this.ficheroForm.patchValue({
        nombre: this.fichero()?.nombre || '',
        descripcion: this.fichero()?.descripcion || ''
      });
    }
  }

  editarFichero() {
    if (this.ficheroForm.invalid) {
      this.ficheroForm.markAllAsTouched();
      return;
    }
    const { nombre, descripcion, categoriaFichero } = this.ficheroForm.value;
    const archivo = this.archivoFile();
    this.orquestadorService.actualizarFicheroRecurso(nombre, descripcion, archivo, this.archivoActual(), this.nombreCenad(), this.idRecurso(), categoriaFichero.Id, this.idFichero()).subscribe({
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
  borrarFichero() {
    const nombreArchivo = this.fichero()?.nombreArchivo || '';
    this.orquestadorService.borrarFicheroRecurso(nombreArchivo, this.idFichero(), this.nombreCenad(), this.idRecurso()).subscribe(() => {
      this.output.emit(); // notificamos al padre
    });
  }
}

