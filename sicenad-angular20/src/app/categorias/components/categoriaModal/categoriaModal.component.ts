import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Categoria } from '@interfaces/models/categoria';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-categoriaModal',
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './categoriaModal.component.html',
  styleUrls: ['./categoriaModal.component.css']
})
export class CategoriaModalComponent {
    private utils = inject(UtilsStore);
  private orquestadorService = inject(OrquestadorService);
  private iconos = inject(IconosStore);
  private cenadStore = inject(CenadStore);
  private fb = inject(FormBuilder);

  faEdit = this.iconos.faEdit;
  // --- Inputs / Outputs ---
  categoria = input<Categoria>();
  output = output<void>();

  // --- State ---
  categorias = computed(() => this.cenadStore.categorias());
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  idCategoria = computed(() => this.categoria()?.idString || '');
  _idModal = signal('modal-categoria-' + this.categoria()?.idString);
  _idModalEliminar = signal('modal-categoria-eliminar-' + this.categoria()?.idString);
  idModal = computed(() => this._idModal() + this.idCategoria());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idCategoria());

  categoriaForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    categoriaPadre: [null]
  });


ngOnInit(): void {
  if (!this.categoria()) return;

  // Cargar los valores básicos
  this.categoriaForm.patchValue({
    nombre: this.categoria()?.nombre || '',
    descripcion: this.categoria()?.descripcion || '',
    categoriaPadre: null // temporalmente null hasta cargar la categoría padre real
  });

  // Intentar cargar la categoría padre desde backend
  if (this.categoria()) {
    this.orquestadorService.loadCategoriaPadre(this.categoria()!.idString).subscribe({
      next: (padre) => {
        // si hay padre, asignarlo
        this.categoriaForm.patchValue({ categoriaPadre: padre });
      },
      error: (err) => {
        if (err.status === 502) {
          // No hay categoría padre, se deja null
          this.categoriaForm.patchValue({ categoriaPadre: null });
        } else {
          console.error('Error cargando categoría padre', err);
        }
      }
    });
  }
}

  get nombre() { return this.categoriaForm.get('nombre'); }
  get descripcion() { return this.categoriaForm.get('descripcion'); }
  get categoriaPadre() { return this.categoriaForm.get('categoriaPadre'); }

  editarCategoria() {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }
    const { nombre, descripcion, categoriaPadre } = this.categoriaForm.value;
    const idCategoriaPadre = categoriaPadre ? categoriaPadre.idString : '';
    this.orquestadorService.actualizarCategoria(nombre, descripcion, this.cenadVisitado()!.idString, this.idCategoria(), idCategoriaPadre).subscribe({
      next: res => {
        if (res) {
          console.log(`Categoría ${nombre} actualizada correctamente.`);
          this.output.emit(); // notificamos al padre
        }
      },
      error: (error) => {
        console.error('Error actualizando Categoría:', error);
      }
    });
  }
  borrarCategoria() {
    this.orquestadorService.borrarCategoria(this.idCategoria(), this.cenadVisitado()!.idString).subscribe(() => {
      this.output.emit(); // notificamos al padre
    });
  }
}
