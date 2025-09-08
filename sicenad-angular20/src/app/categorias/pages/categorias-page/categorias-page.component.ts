import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { CategoriaComponent } from '@app/categorias/components/categoria/categoria.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { Categoria } from '@interfaces/models/categoria';
import { CategoriaModalComponent } from '@app/categorias/components/categoriaModal/categoriaModal.component';

@Component({
  selector: 'app-categorias',
  imports: [RouterLink, FontAwesomeModule, ReactiveFormsModule, CategoriaComponent, CategoriaModalComponent],
  templateUrl: './categorias-page.component.html',
  styleUrls: ['./categorias-page.component.css']
})
export class CategoriasPageComponent {
  private cenadStore = inject(CenadStore);
  private orquestadorService = inject(OrquestadorService);
  private iconoStore = inject(IconosStore);
  private fb = inject(FormBuilder);

  faVolver = this.iconoStore.faVolver;
  readonly routesPaths = RoutesPaths;

  /** Signals */
  filtro = signal<string>(''); // <- Filtro buscador

  categorias = computed(() => this.cenadStore.categorias());
  categoriasPadre = computed(() => this.cenadStore.categoriasPadre());
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());

  // Categoría seleccionada y subcategorías
  categoriaSeleccionada = signal<Categoria | null>(null);
  subcategorias = signal<Categoria[]>([]);

  // Historial para volver a categorías anteriores
  historialCategorias = signal<Categoria[]>([]);
  categoriaAnterior = computed(() => {
    const historial = this.historialCategorias();
    return historial.length > 0 ? historial[historial.length - 1] : null;
  });

  categoriaForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    categoriaPadre: [null]
  });

  get nombre() { return this.categoriaForm.get('nombre'); }
  get descripcion() { return this.categoriaForm.get('descripcion'); }
  get categoriaPadre() { return this.categoriaForm.get('categoriaPadre'); }

  /** Filtro aplicado a categorías padre */
  categoriasPadreFiltradas = computed(() => {
    const term = this.filtro().toLowerCase();
    return (this.categoriasPadre() ?? []).filter(c =>
      c.nombre.toLowerCase().includes(term)
    );
  });

  /** Seleccionar una categoría y cargar sus subcategorías */
  seleccionarCategoria(categoria: Categoria) {
    // Guardamos la categoría actual en el historial antes de cambiar
    if (this.categoriaSeleccionada()) {
      this.historialCategorias.set([...this.historialCategorias(), this.categoriaSeleccionada()!]);
    }

    this.categoriaSeleccionada.set(categoria);

    this.orquestadorService.loadSubcategorias(categoria.idString).subscribe({
      next: (subcats) => this.subcategorias.set(subcats ?? []),
      error: (err) => console.error('Error cargando subcategorías', err)
    });
  }

  /** Volver a la categoría anterior del historial */
  volverCategoriaAnterior() {
    const historial = [...this.historialCategorias()];
    if (historial.length === 0) return;

    const anterior = historial.pop()!;
    this.historialCategorias.set(historial);

    this.categoriaSeleccionada.set(anterior);

    this.orquestadorService.loadSubcategorias(anterior.idString).subscribe({
      next: (subcats) => this.subcategorias.set(subcats ?? []),
      error: (err) => console.error('Error cargando subcategorías', err)
    });
  }

  /** Crear categoría nueva */
  crearCategoria() {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }

    const { nombre, descripcion, categoriaPadre } = this.categoriaForm.value;
    const idCategoriaPadre = categoriaPadre ? categoriaPadre.idString : '';

    this.orquestadorService
      .crearCategoria(nombre, descripcion, this.cenadVisitado()!.idString, idCategoriaPadre)
      .subscribe({
        next: (success) => {
          if (success) {
            this.categoriaForm.reset();

            if (categoriaPadre) {
              // Recargar subcategorías si estamos en una categoría padre
              this.seleccionarCategoria(categoriaPadre);
            } else {
              // Recargar categorías principales

            }
          } else {
            console.error('Error al crear la categoría');
          }
        },
        error: (err) => console.error('Error en la creación de categoría', err)
      });
  }

  /** Volver al listado de categorías padre */
  volverCategoriasPadre() {
    this.categoriaSeleccionada.set(null);
    this.subcategorias.set([]);
    this.historialCategorias.set([]);
  }
}

