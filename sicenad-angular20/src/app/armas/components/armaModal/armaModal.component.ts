import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Arma } from '@interfaces/models/arma';
import { OrquestadorService } from '@services/orquestadorService';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-arma-modal',
  imports: [FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './armaModal.component.html',
  styleUrls: ['./armaModal.component.css']
})
export class ArmaModalComponent {

  private utils = inject(UtilsStore);
  private orquestadorService = inject(OrquestadorService);
  private iconos = inject(IconosStore);
  private fb = inject(FormBuilder);

  faEdit = this.iconos.faEdit;
  // --- Inputs / Outputs ---
  arma = input<Arma>();
  output = output<void>();


  // --- State ---
  tiposTiro = computed(() => this.utils.tiposTiro());
  idArma = computed(() => this.arma()?.idString || '');
  _idModal = signal('modal-arma-' + this.arma()?.idString);
  _idModalEliminar = signal('modal-arma-eliminar-' + this.arma()?.idString);
  idModal = computed(() => this._idModal() + this.idArma());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idArma());

  armaForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    tipoTiro: ['', Validators.required]
  });

  ngOnInit(): void {
    if (this.arma()) {
      this.armaForm.patchValue({
        nombre: this.arma()?.nombre || '',
        tipoTiro: this.arma()?.tipoTiro || ''
      });
    }
  }

  get nombre() { return this.armaForm.get('nombre'); }
  get tipoTiro() { return this.armaForm.get('tipoTiro'); }

  editarArma() {
    if (this.armaForm.invalid) {
      this.armaForm.markAllAsTouched();
      return;
    }
    const { nombre, tipoTiro } = this.armaForm.value;
    this.orquestadorService.actualizarArma(nombre, tipoTiro, this.idArma()).subscribe({
      next: res => {
        if (res) {
          console.log(`Arma ${nombre} actualizada correctamente.`);
          this.output.emit(); // notificamos al padre
        }
      },
      error: (error) => {
        console.error('Error actualizando Arma:', error);
      }
    });
  }
  borrarArma() {
    this.orquestadorService.borrarArma(this.idArma()).subscribe(() => {
      this.output.emit(); // notificamos al padre
    });
  }
}
