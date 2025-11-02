import { UpperCasePipe } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Categoria } from '@interfaces/models/categoria';
import { TranslateModule } from '@ngx-translate/core';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-categoriaModal',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslateModule, UpperCasePipe],
  templateUrl: './categoriaModal.component.html',
  styleUrls: ['./categoriaModal.component.css']
})
export class CategoriaModalComponent {
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
  idCategoria = computed(() => this.categoria()?.Id || '');
  _idModal = signal('modal-categoria-' + this.categoria()?.Id);
  _idModalEliminar = signal('modal-categoria-eliminar-' + this.categoria()?.Id);
  idModal = computed(() => this._idModal() + this.idCategoria());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idCategoria());

  categoriaForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    categoriaPadre: [null]
  });

  get nombre() { return this.categoriaForm.get('nombre'); }
  get descripcion() { return this.categoriaForm.get('descripcion'); }
  get categoriaPadre() { return this.categoriaForm.get('categoriaPadre'); }

  constructor() {
    // Este effect ahora se ejecuta en un contexto válido
    effect(() => {
      const categorias = this.categorias();
      const categoriaActual = this.categoria();
      if (!categorias || !categoriaActual) return;
      // Cargar la categoría padre
      this.orquestadorService.loadCategoriaPadre(categoriaActual.Id).subscribe({
        next: (padre) => {
          const padreRef = padre
            ? categorias.find(c => c.Id === padre.Id) || null
            : null;
          this.categoriaForm.patchValue({ categoriaPadre: padreRef });
        },
        error: () => {
          this.categoriaForm.patchValue({ categoriaPadre: null });
        }
      });
    });
  }

  ngOnInit(): void {
    if (!this.categoria()) return;
    // Cargar los valores básicos
    this.categoriaForm.patchValue({
      nombre: this.categoria()?.nombre || '',
      descripcion: this.categoria()?.descripcion || ''
    });
  }

  editarCategoria() {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }
    const { nombre, descripcion, categoriaPadre } = this.categoriaForm.value;
    const idCategoriaPadre = categoriaPadre ? categoriaPadre.Id : '';
    this.orquestadorService.actualizarCategoria(nombre, descripcion, this.cenadVisitado()!.Id, this.idCategoria(), idCategoriaPadre).subscribe({
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
  borrarCategoria() {
    this.orquestadorService.borrarCategoria(this.idCategoria(), this.cenadVisitado()!.Id).subscribe(() => {
      this.output.emit(); // notificamos al padre
    });
  }
}
