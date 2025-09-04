import { Component, computed, effect, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Cenad } from '@interfaces/models/cenad';
import { OrquestadorService } from '@services/orquestadorService';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';
import { tap } from 'rxjs';

@Component({
  selector: 'app-cenad-modal',
  imports: [FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './cenadModal.component.html',
  styleUrls: ['./cenadModal.component.css'],
})
export class CenadModalComponent {
  private utils = inject(UtilsStore);
  private orquestadorService = inject(OrquestadorService);
  private iconos = inject(IconosStore);
  private fb = inject(FormBuilder);

  faEdit = this.iconos.faEdit;
  // --- Inputs / Outputs ---
  cenad = input<Cenad>();
  output = output<void>();

  // --- State ---
  provincias = signal<{ idProvincia: number, nombre: string }[]>(this.utils.provincias());
  sizeMaxEscudo = computed(() => this.utils.sizeMaxEscudo());
  idCenad = computed(() => this.cenad()?.idString || '');
  _idModal = signal('modal-cenad-' + this.cenad()?.idString);
  _idModalEliminar = signal('modal-cenad-eliminar-' + this.cenad()?.idString);
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

  private esperarYCargarEscudo = void effect(() => {
    this.escudoActual.set(this.cenad()?.escudo || '');
    const escudo = this.cenad()?.escudo;
    if (!escudo) return;
    if (!this.idCenad()) return;
    this.orquestadorService.getEscudoCenad(escudo, this.idCenad()).subscribe(
      {
        next: blob => this.urlEscudoActual.set(URL.createObjectURL(blob)),
        error: err => console.error('Error cargando escudo', err)
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
      const reader = new FileReader();
      reader.onload = e => this.previewEscudo.set(e.target?.result as string)
      reader.readAsDataURL(file);
      this.escudoFile.set(file);
    } else {
      this.escudoFile.set(null);
    }
  }

  editarCenad() {
    if (this.cenadForm.invalid) {
      this.cenadForm.markAllAsTouched();
      return;
    }
    const { nombre, provincia, direccion, tfno, email, descripcion } = this.cenadForm.value;
    const archivoEscudo = this.escudoFile();
    console.log('Archivo nuevo:', archivoEscudo);
    console.log('Escudo actual:', this.escudoActual());

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
          console.log(`Cenad ${nombre} actualizado correctamente.`);
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
        console.error('Error actualizando Cenad:', err);
      }
    });
  }

  borrarCenad() {
    this.orquestadorService.borrarCenad(this.idCenad()).subscribe(() => {
      this.output.emit(); // notificamos al padre
    });
  }

}
