import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Unidad } from '@interfaces/models/unidad';
import { OrquestadorService } from '@services/orquestadorService';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-unidad-modal',
  imports: [FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './unidadModal.component.html',
  styleUrls: ['./unidadModal.component.css']
})
export class UnidadModalComponent {

  private orquestadorService = inject(OrquestadorService);
  private iconos = inject(IconosStore);
  private fb = inject(FormBuilder);

  faEdit = this.iconos.faEdit;
  // --- Inputs / Outputs ---
  unidad = input<Unidad>();
  output = output<void>();

  idUnidad = computed(() => this.unidad()?.idString || '');
  _idModal = signal('modal-unidad-' + this.unidad()?.idString);
  _idModalEliminar = signal('modal-unidad-eliminar-' + this.unidad()?.idString);
  idModal = computed(() => this._idModal() + this.idUnidad());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idUnidad());
  unidadForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    tfno: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    direccion: ['', Validators.required],
    poc: ['', Validators.required]
  });

ngOnInit(): void {
    if (this.unidad()) {
      this.unidadForm.patchValue({
        nombre: this.unidad()?.nombre || '',
        descripcion: this.unidad()?.descripcion || '',
        email: this.unidad()?.email || '',
        tfno: this.unidad()?.tfno || '',
        direccion: this.unidad()?.direccion || '',
        poc: this.unidad()?.poc || ''
      });
    }
  }

  get nombre() { return this.unidadForm.get('nombre'); }
  get descripcion() { return this.unidadForm.get('descripcion'); }
  get email() { return this.unidadForm.get('email'); }
  get tfno() { return this.unidadForm.get('tfno'); }
  get direccion() { return this.unidadForm.get('direccion'); }
  get poc() { return this.unidadForm.get('poc'); }

  editarUnidad() {
    if (this.unidadForm.invalid) {
      this.unidadForm.markAllAsTouched();
      return;
    }
    const { nombre, descripcion, email, tfno, direccion, poc } = this.unidadForm.value;
    this.orquestadorService.actualizarUnidad(nombre, descripcion, email, tfno, direccion, poc, this.idUnidad()).subscribe({
      next: res => {
        if (res) {
          console.log(`Unidad ${nombre} actualizada correctamente.`);
          this.output.emit(); // notificamos al padre
        }
      },
      error: (error) => {
        console.error('Error actualizando Unidad:', error);
      }
    });
  }
  borrarUnidad() {
    this.orquestadorService.borrarUnidad(this.idUnidad()).subscribe(() => {
      this.output.emit(); // notificamos al padre
    });
  }
}
