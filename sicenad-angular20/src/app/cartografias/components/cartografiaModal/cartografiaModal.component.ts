import { UpperCasePipe } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Cartografia } from '@interfaces/models/cartografia';
import { TranslateModule } from '@ngx-translate/core';
import { IdiomaService } from '@services/idiomaService';
import { OrquestadorService } from '@services/orquestadorService';
import { UtilService } from '@services/utilService';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-cartografia-modal',
  imports: [FontAwesomeModule, ReactiveFormsModule, TranslateModule, UpperCasePipe],
  templateUrl: './cartografiaModal.component.html',
  styleUrls: ['./cartografiaModal.component.css']
})
export class CartografiaModalComponent {

  private utils = inject(UtilsStore);
  private cenadStore = inject(CenadStore);
  private orquestadorService = inject(OrquestadorService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);  
  private iconos = inject(IconosStore);
  private fb = inject(FormBuilder);

  faEdit = this.iconos.faEdit;
  // --- Inputs / Outputs ---
  cartografia = input<Cartografia>();
  output = output<void>();

  // --- State ---
  escalas = computed(() => this.utils.escalasCartografia());
  sizeMaxCartografia = computed(() => this.utils.sizeMaxCartografia());
  sizeMaxCartografiaBytes = computed<number>(() => {
    const raw = this.sizeMaxCartografia();
    if (raw == null) return 0;
    const val = Number(raw);
    if (isNaN(val) || val <= 0) return 0;
    // Si el valor parece ya estar en bytes (>= 1 MiB), devolver tal cual.
    // Si es un número pequeño (p. ej. 1..1000) lo interpretamos como MB.
    if (val >= 1024 * 1024) return Math.floor(val);
    // Interpretar como MB por defecto
    return Math.floor(val * 1024 * 1024);
  });
  idCartografia = computed(() => this.cartografia()?.Id || '');
  _idModal = signal('modal-cartografia-' + this.cartografia()?.Id);
  _idModalEliminar = signal('modal-cartografia-eliminar-' + this.cartografia()?.Id);
  idModal = computed(() => this._idModal() + this.idCartografia());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idCartografia());
  idCenad = computed(() => this.cenadStore.cenadVisitado()?.Id || '');
  nombreCenad = computed(() => this.cenadStore.cenadVisitado()?.nombre || '');
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
    const file: File | undefined = event?.target?.files?.[0];
    if (!file) {
      this.cartografiaForm.patchValue({ nombreArchivo: null });
      this.archivoFile.set(null);
      return;
    }
    const maxBytes = this.sizeMaxCartografiaBytes();
    if (typeof maxBytes === 'number' && maxBytes > 0 && file.size > maxBytes) {
      const maxMb = (maxBytes / (1024 * 1024)).toFixed(2);
      const mensaje = this.idiomaService.t('archivos.errorTamanoArchivo');
      this.utilService.toast(`${mensaje}: ${maxMb} MB.`, 'error');      // limpiar selección visual y formulario
      try { if (this.fileInput && this.fileInput.nativeElement) this.fileInput.nativeElement.value = ''; } catch {}
      this.cartografiaForm.patchValue({ nombreArchivo: null });
      this.archivoFile.set(null);
      return;
    }
    // aceptado
    this.cartografiaForm.patchValue({ nombreArchivo: file });
    this.archivoFile.set(file);
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
    this.orquestadorService.actualizarCartografia(nombre, descripcion, escala, archivo, this.archivoActual(), this.idCenad(), this.nombreCenad(), this.idCartografia()).subscribe({
      next: res => {
        if (res) {
          this.output.emit(); // notificamos al padre
        }
      },
      error: (error) => {
      }
    });
  }
  borrarCartografia() {
    const nombreArchivo = this.cartografia()?.nombreArchivo || '';
    this.orquestadorService.borrarCartografia(nombreArchivo, this.idCartografia(), this.idCenad(), this.nombreCenad()).subscribe(() => {
      this.output.emit(); // notificamos al padre
    });
  }
}
