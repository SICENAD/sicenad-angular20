import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CategoriaFichero } from '@interfaces/models/categoriaFichero';
import { TranslateModule } from '@ngx-translate/core';
import { OrquestadorService } from '@services/orquestadorService';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-categoriaFichero-modal',
  imports: [FontAwesomeModule, ReactiveFormsModule, TranslateModule, UpperCasePipe],
  templateUrl: './categoriaFicheroModal.component.html',
  styleUrls: ['./categoriaFicheroModal.component.css']
})
export class CategoriaFicheroModalComponent {

  private orquestadorService = inject(OrquestadorService);
  private iconos = inject(IconosStore);
  private fb = inject(FormBuilder);

  faEdit = this.iconos.faEdit;
  // --- Inputs / Outputs ---
  categoriaFichero = input<CategoriaFichero>();
  output = output<void>();

  idCategoriaFichero = computed(() => this.categoriaFichero()?.idString || '');
  _idModal = signal('modal-categoriaFichero-' + this.categoriaFichero()?.idString);
  _idModalEliminar = signal('modal-categoriaFichero-eliminar-' + this.categoriaFichero()?.idString);
  idModal = computed(() => this._idModal() + this.idCategoriaFichero());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idCategoriaFichero());
  categoriaFicheroForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    tipo: [9, Validators.required],
    descripcion: ['', Validators.required],
  });

  get nombre() { return this.categoriaFicheroForm.get('nombre'); }
  get tipo() { return this.categoriaFicheroForm.get('tipo'); }
  get descripcion() { return this.categoriaFicheroForm.get('descripcion'); }

  ngOnInit(): void {
    if (this.categoriaFichero()) {
      this.categoriaFicheroForm.patchValue({
        nombre: this.categoriaFichero()?.nombre || '',
        tipo: this.categoriaFichero()?.tipo,
        descripcion: this.categoriaFichero()?.descripcion || '',
      });
    }
  }

  editarCategoriaFichero() {
    if (this.categoriaFicheroForm.invalid) {
      this.categoriaFicheroForm.markAllAsTouched();
      return;
    }
    const { nombre, tipo, descripcion } = this.categoriaFicheroForm.value;
    this.orquestadorService.actualizarCategoriaFichero(nombre, tipo, descripcion, this.idCategoriaFichero()).subscribe({
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
  borrarCategoriaFichero() {
    this.orquestadorService.borrarCategoriaFichero(this.idCategoriaFichero()).subscribe(() => {
      this.output.emit(); // notificamos al padre
    });
  }
}
