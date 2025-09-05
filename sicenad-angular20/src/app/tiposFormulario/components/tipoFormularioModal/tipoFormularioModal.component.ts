import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TipoFormulario } from '@interfaces/models/tipoFormulario';
import { OrquestadorService } from '@services/orquestadorService';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-tipoFormulario-modal',
  imports: [FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './tipoFormularioModal.component.html',
  styleUrls: ['./tipoFormularioModal.component.css']
})
export class TipoformularioModalComponent {

  private orquestadorService = inject(OrquestadorService);
  private iconos = inject(IconosStore);
  private fb = inject(FormBuilder);

  faEdit = this.iconos.faEdit;
  // --- Inputs / Outputs ---
  tipoFormulario = input<TipoFormulario>();
  output = output<void>();

  idTipoFormulario = computed(() => this.tipoFormulario()?.idString || '');
  _idModal = signal('modal-tipo-formulario-' + this.idTipoFormulario());
  _idModalEliminar = signal('modal-tipo-formulario-eliminar-' + this.idTipoFormulario());
  idModal = computed(() => this._idModal() + this.idTipoFormulario());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idTipoFormulario());
  tipoFormularioForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required]
  });

ngOnInit(): void {
    if (this.tipoFormulario()) {
      this.tipoFormularioForm.patchValue({
        nombre: this.tipoFormulario()?.nombre || '',
        descripcion: this.tipoFormulario()?.descripcion || ''
      });
    }
  }

  get nombre() { return this.tipoFormularioForm.get('nombre'); }
  get descripcion() { return this.tipoFormularioForm.get('descripcion'); }


  editarTipoFormulario() {
    if (this.tipoFormularioForm.invalid) {
      this.tipoFormularioForm.markAllAsTouched();
      return;
    }
    const { nombre, descripcion } = this.tipoFormularioForm.value;
    this.orquestadorService.actualizarTipoFormulario(nombre, descripcion, this.idTipoFormulario()).subscribe({
      next: res => {
        if (res) {
          console.log(`Tipo de formulario ${nombre} actualizado correctamente.`);
          this.output.emit(); // notificamos al padre
        }
      },
      error: (error) => {
        console.error('Error actualizando Tipo de formulario:', error);
      }
    });
  }
  borrarTipoFormulario() {
    this.orquestadorService.borrarTipoFormulario(this.idTipoFormulario()).subscribe(() => {
      this.output.emit(); // notificamos al padre
    });
  }
}
