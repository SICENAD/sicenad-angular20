import { UpperCasePipe } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Cenad } from '@interfaces/models/cenad';
import { TranslateModule } from '@ngx-translate/core';
import { IdiomaService } from '@services/idiomaService';
import { OrquestadorService } from '@services/orquestadorService';
import { UtilService } from '@services/utilService';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-cenad-modal',
  imports: [FontAwesomeModule, ReactiveFormsModule, TranslateModule, UpperCasePipe],
  templateUrl: './cenadModal.component.html',
  styleUrls: ['./cenadModal.component.css'],
})
export class CenadModalComponent {
  private utils = inject(UtilsStore);
  private orquestadorService = inject(OrquestadorService);
  private utilService = inject(UtilService);
  private idiomaService = inject(IdiomaService);
  private iconos = inject(IconosStore);
  private fb = inject(FormBuilder);

  faEdit = this.iconos.faEdit;
  // --- Inputs / Outputs ---
  cenad = input<Cenad>();
  output = output<void>();

  // --- State ---
  provincias = signal<{ idProvincia: number, nombre: string }[]>(this.utils.provincias());
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
  idCenad = computed(() => this.cenad()?.Id || '');
  _idModal = signal('modal-cenad-' + this.cenad()?.Id);
  _idModalEliminar = signal('modal-cenad-eliminar-' + this.cenad()?.Id);
  idModal = computed(() => this._idModal() + this.idCenad());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idCenad());
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  previewEscudo = signal<string>('');
  escudoActual = signal<string>((this.cenad()?.escudo || ''));
  urlEscudoActual = signal<string>('');
  escudoFile = signal<File | null>(null);
  cenadForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    provincia: [0, [Validators.required, Validators.min(1)]],
    direccion: ['', Validators.required],
    tfno: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    descripcion: ['', Validators.required],
    escudo: [null] // archivo opcional, se reemplaza si se carga uno nuevo
  });

  get nombre() { return this.cenadForm.get('nombre'); }
  get provincia() { return this.cenadForm.get('provincia'); }
  get direccion() { return this.cenadForm.get('direccion'); }
  get tfno() { return this.cenadForm.get('tfno'); }
  get email() { return this.cenadForm.get('email'); }
  get descripcion() { return this.cenadForm.get('descripcion'); }
  get escudo() { return this.cenadForm.get('escudo'); }

  private esperarYCargarEscudo = void effect(() => {
    this.escudoActual.set(this.cenad()?.escudo || '');
    const escudo = this.cenad()?.escudo;
    if (!escudo) return;
    if (!this.idCenad()) return;
    this.orquestadorService.getEscudoCenad(escudo, this.cenad()!.nombre).subscribe(
      {
        next: blob => this.urlEscudoActual.set(URL.createObjectURL(blob)),
        error: err => console.error(err)
      });
  });

  ngOnInit(): void {
    if (this.cenad()) {
      this.cenadForm.patchValue({
        nombre: this.cenad()?.nombre,
        provincia: this.cenad()?.provincia,
        direccion: this.cenad()?.direccion,
        tfno: this.cenad()?.tfno,
        email: this.cenad()?.email,
        descripcion: this.cenad()?.descripcion,
      });
    }
  }

  onFileChange(event: any) {
    const file: File | undefined = event?.target?.files?.[0];
    if (!file) {
      this.cenadForm.patchValue({ escudo: null });
      this.escudoFile.set(null);
      return;
    }
    const maxBytes = this.sizeMaxEscudoBytes();
    if (typeof maxBytes === 'number' && maxBytes > 0 && file.size > maxBytes) {
      const maxMb = (maxBytes / (1024 * 1024)).toFixed(2);
      const mensaje = this.idiomaService.t('archivos.errorTamanoArchivo');
      this.utilService.toast(`${mensaje}: ${maxMb} MB.`, 'error');      // limpiar selección visual y formulario
      try { if (this.fileInput && this.fileInput.nativeElement) this.fileInput.nativeElement.value = ''; } catch {}
      this.cenadForm.patchValue({ escudo: null });
      this.escudoFile.set(null);
      return;
    }
    // aceptado
      this.cenadForm.patchValue({ escudo: file });
      const reader = new FileReader();
      reader.onload = e => this.previewEscudo.set(e.target?.result as string)
      reader.readAsDataURL(file);
      this.escudoFile.set(file);
  }

  editarCenad() {
    if (this.cenadForm.invalid) {
      this.cenadForm.markAllAsTouched();
      return;
    }
    const { nombre, provincia, direccion, tfno, email, descripcion } = this.cenadForm.value;
    const archivoEscudo = this.escudoFile();
    this.orquestadorService.actualizarCenad(
      nombre,
      provincia,
      direccion,
      tfno,
      email,
      descripcion,
      archivoEscudo,             // archivo opcional
      this.escudoActual(),  // archivo anterior
      this.idCenad()
    ).subscribe({
      next: res => {
        if (res) {
          this.escudoActual.set(res);
          this.cenad()!.escudo = this.escudoActual(); // actualizamos el escudo en el objeto cenad
          this.cenadForm.patchValue({ escudo: null });
          this.previewEscudo.set('');
          this.escudoFile.set(null);
          if (this.fileInput) this.fileInput.nativeElement.value = '';
        }
        this.output.emit(); // notificamos al padre
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  borrarCenad() {
    this.orquestadorService.borrarCenad(this.idCenad()).subscribe(() => {
      this.output.emit(); // notificamos al padre
    });
  }
}
