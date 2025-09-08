import { Component, computed, effect, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Cartografia } from '@interfaces/models/cartografia';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-cartografia-modal',
  imports: [FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './cartografiaModal.component.html',
  styleUrls: ['./cartografiaModal.component.css']
})
export class CartografiaModalComponent {

  private utils = inject(UtilsStore);
  private cenadStore = inject(CenadStore);
  private orquestadorService = inject(OrquestadorService);
  private iconos = inject(IconosStore);
  private fb = inject(FormBuilder);

  faEdit = this.iconos.faEdit;
  // --- Inputs / Outputs ---
  cartografia = input<Cartografia>();
  output = output<void>();

  // --- State ---
  escalas = computed(() => this.utils.escalasCartografia());
  sizeMaxCartografia = computed(() => this.utils.sizeMaxCartografia());
  idCartografia = computed(() => this.cartografia()?.idString || '');
  _idModal = signal('modal-cartografia-' + this.cartografia()?.idString);
  _idModalEliminar = signal('modal-cartografia-eliminar-' + this.cartografia()?.idString);
  idModal = computed(() => this._idModal() + this.idCartografia());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idCartografia());
  idCenad = computed(() => this.cenadStore.cenadVisitado()?.idString || '');
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  archivoActual = signal<string>((this.cartografia()?.nombreArchivo || ''));
  urlArchivoActual = signal<string>('');
  archivoFile = signal<File | null>(null);

  cartografiaForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    escala: ['', Validators.required],
    nombreArchivo: [null]
  });

  get nombre() { return this.cartografiaForm.get('nombre'); }
  get descripcion() { return this.cartografiaForm.get('descripcion'); }
  get escala() { return this.cartografiaForm.get('escala'); }
  get nombreArchivo() { return this.cartografiaForm.get('nombreArchivo'); }

  onFileChange(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.cartografiaForm.patchValue({ nombreArchivo: file });
      this.archivoFile.set(file);
    } else {
      this.archivoFile.set(null);
    }
  }

  private esperarYCargarArchivo = void effect(() => {
    this.archivoActual.set(this.cartografia()?.nombreArchivo || '');
    const archivo = this.cartografia()?.nombreArchivo;
    if (!archivo) return;
    if (!this.idCartografia()) return;
  });

  ngOnInit(): void {
    if (this.cartografia()) {
      this.cartografiaForm.patchValue({
        nombre: this.cartografia()?.nombre || '',
        descripcion: this.cartografia()?.descripcion || '',
        escala: this.cartografia()?.escala || '',
      });
    }
  }

  editarCartografia() {
    if (this.cartografiaForm.invalid) {
      this.cartografiaForm.markAllAsTouched();
      return;
    }
    const { nombre, descripcion, escala } = this.cartografiaForm.value;
    const archivo = this.archivoFile();
    console.log('Archivo nuevo:', archivo);
    console.log('Archivo actual:', this.archivoActual());
    this.orquestadorService.actualizarCartografia(nombre, descripcion, escala, archivo, this.archivoActual(), this.idCenad(), this.idCartografia()).subscribe({
      next: res => {
        if (res) {
          console.log(`Cartografía ${nombre} actualizada correctamente.`);
          this.output.emit(); // notificamos al padre
        }
      },
      error: (error) => {
        console.error('Error actualizando Cartografía:', error);
      }
    });
  }
  borrarCartografia() {
    const nombreArchivo = this.cartografia()?.nombreArchivo || '';
    this.orquestadorService.borrarCartografia(nombreArchivo, this.idCartografia(), this.idCenad()).subscribe(() => {
      this.output.emit(); // notificamos al padre
    });
  }
}
