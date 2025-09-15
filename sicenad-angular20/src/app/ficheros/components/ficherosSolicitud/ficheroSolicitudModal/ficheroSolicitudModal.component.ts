import { Component, computed, effect, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FicheroRecurso } from '@interfaces/models/ficheroRecurso';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-ficheroSolicitudModal',
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './ficheroSolicitudModal.component.html',
  styleUrls: ['./ficheroSolicitudModal.component.css'],
})
export class FicheroSolicitudModalComponent {
  private utils = inject(UtilsStore);
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private cenadStore = inject(CenadStore);
  private orquestadorService = inject(OrquestadorService);
  private iconos = inject(IconosStore);
  private fb = inject(FormBuilder);

  faEdit = this.iconos.faEdit;

  fichero = input<FicheroRecurso>();
  idSolicitud = input.required<string>();
  isCenad = input<boolean>();
  output = output<void>();

  categoriasFichero = computed(() => this.datosPrincipalesStore.categoriasFichero());
  sizeMaxDocSolicitud = computed(() => this.utils.sizeMaxDocSolicitud());
  idFichero = computed(() => this.fichero()?.idString || '');
  _idModal = signal('modal-fichero-' + this.fichero()?.idString);
  _idModalEliminar = signal('modal-fichero-eliminar-' + this.fichero()?.idString);
  idModal = computed(() => this._idModal() + this.idFichero());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idFichero());
  idCenad = computed(() => this.cenadStore.cenadVisitado()?.idString || '');
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
    const file: File = event.target.files[0];
    if (file) {
      this.ficheroForm.patchValue({ nombreArchivo: file });
      this.archivoFile.set(file);
    } else {
      this.archivoFile.set(null);
    }
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
      this.orquestadorService.loadCategoriaFicheroDeFichero(ficheroActual.idString).subscribe({
        next: (categoriaFichero) => {
          const categoriaFicheroRef = categoriaFichero
            ? categoriasFichero.find(c => c.idString === categoriaFichero.idString) || null
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
    console.log('Archivo nuevo:', archivo);
    console.log('Archivo actual:', this.archivoActual());
    if (this.isCenad()) {
      this.orquestadorService.actualizarFicheroSolicitudCenad(nombre, descripcion, archivo, this.archivoActual(), this.idCenad(), this.idSolicitud(), categoriaFichero.idString, this.idFichero()).subscribe({
        next: res => {
          if (res) {
            console.log(`Fichero ${nombre} actualizado correctamente.`);
            this.output.emit(); // notificamos al padre
          }
        },
        error: (error) => {
          console.error('Error actualizando Fichero:', error);
        }
      });
    } else {
      this.orquestadorService.actualizarFicheroSolicitudUnidad(nombre, descripcion, archivo, this.archivoActual(), this.idCenad(), this.idSolicitud(), categoriaFichero.idString, this.idFichero()).subscribe({
        next: res => {
          if (res) {
            console.log(`Fichero ${nombre} actualizado correctamente.`);
            this.output.emit(); // notificamos al padre
          }
        },
        error: (error) => {
          console.error('Error actualizando Fichero:', error);
        }
      });
    }
  }

    borrarFichero() {
      const nombreArchivo = this.fichero()?.nombreArchivo || '';
      if (this.isCenad()) {
      this.orquestadorService.borrarFicheroSolicitudCenad(nombreArchivo, this.idFichero(), this.idCenad(), this.idSolicitud()).subscribe(() => {
        this.output.emit(); // notificamos al padre
      });
    } else {
      this.orquestadorService.borrarFicheroSolicitudUnidad(nombreArchivo, this.idFichero(), this.idCenad(), this.idSolicitud()).subscribe(() => {
        this.output.emit(); // notificamos al padre
      });
    }
  }
}
