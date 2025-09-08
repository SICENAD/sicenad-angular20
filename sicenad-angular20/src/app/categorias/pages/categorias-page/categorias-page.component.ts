import { Component, computed, inject, signal, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('topScroll') topScroll!: ElementRef<HTMLDivElement>; // 🔹 Para el scroll automático

  faVolver = this.iconoStore.faVolver;
  readonly routesPaths = RoutesPaths;

  // Estado
  categorias = computed(() => this.cenadStore.categorias());
  categoriasPadre = computed(() => this.cenadStore.categoriasPadre());
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());

  // Categoría seleccionada y subcategorías
  categoriaSeleccionada = signal<Categoria | null>(null);
  subcategorias = signal<Categoria[]>([]);

  // Historial para volver atrás
  categoriaAnterior = signal<Categoria | null>(null);

  // Filtro
  filtro = signal<string>('');

  categoriasPadreFiltradas = computed(() => {
    const term = this.filtro().toLowerCase();
    return this.categoriasPadre().filter(c => c.nombre.toLowerCase().includes(term));
  });

  categoriaForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    categoriaPadre: [null]
  });

  get nombre() { return this.categoriaForm.get('nombre'); }
  get descripcion() { return this.categoriaForm.get('descripcion'); }
  get categoriaPadre() { return this.categoriaForm.get('categoriaPadre'); }

  /** Seleccionar una categoría y cargar sus subcategorías */
  seleccionarCategoria(categoria: Categoria) {
    if (this.categoriaSeleccionada()) {
      this.categoriaAnterior.set(this.categoriaSeleccionada()); // Guarda la categoría actual antes de cambiar
    }

    this.categoriaSeleccionada.set(categoria);

    // Llamada al backend para cargar subcategorías
    this.orquestadorService.loadSubcategorias(categoria.idString).subscribe({
      next: (subcats) => {
        this.subcategorias.set(subcats ?? []);
        this.scrollToTop(); // 🔹 Mueve la vista al inicio
      },
      error: (err) => console.error('Error cargando subcategorías', err)
    });
  }

  /** Volver a la categoría anterior */
  volverCategoriaAnterior() {
    if (this.categoriaAnterior()) {
      this.seleccionarCategoria(this.categoriaAnterior()!);
      this.categoriaAnterior.set(null); // Limpia después de volver
    }
  }

  /** Scroll automático hacia arriba */
  private scrollToTop() {
    if (this.topScroll) {
      this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

          // 🔹 Volver siempre a la vista inicial de categorías principales
          this.volverCategoriasPadre();
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
    this.scrollToTop(); // 🔹 También volvemos arriba
  }
}
