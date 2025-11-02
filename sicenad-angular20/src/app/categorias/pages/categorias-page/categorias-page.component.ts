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
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-categorias',
  imports: [RouterLink, FontAwesomeModule, ReactiveFormsModule, CategoriaComponent, CategoriaModalComponent, TranslateModule, UpperCasePipe],
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
  faSubir = this.iconoStore.faSubir;
  readonly routesPaths = RoutesPaths;

  // Estado
  categorias = computed(() => this.cenadStore.categorias());
  categoriasPadre = computed(() => this.cenadStore.categoriasPadre());
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());

  // Categoría seleccionada y subcategorías
  categoriaSeleccionada = signal<Categoria | null>(null);
  subcategorias = signal<Categoria[]>([]);

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
    this.categoriaSeleccionada.set(categoria);
    // Llamada al backend para cargar subcategorías
    this.orquestadorService.loadSubcategorias(categoria.Id).subscribe({
      next: (subcats) => {
        this.subcategorias.set(subcats ?? []);
        this.scrollToTop(); // 🔹 Mueve la vista al inicio
      },
      error: (err) => console.error(err)
    });
  }
  /** Volver a la categoría padre (subir un nivel) */
  volverCategoriaAnterior() {
    const categoriaActual = this.categoriaSeleccionada();
    if (!categoriaActual) return;
    this.orquestadorService.loadCategoriaPadre(categoriaActual.Id).subscribe({
      next: (categoriaPadre) => {
        if (categoriaPadre) {
          // Si hay categoría padre, la seleccionamos
          this.seleccionarCategoria(categoriaPadre);
        } else {
          // Si no tiene padre → volver a la vista raíz
        }
      },
      error: (err) => {
        console.error(err);
        // Si da error 502 u otro, volvemos a la vista raíz
      }
    });
  }

  /** Devuelve true si la categoría es categoriaPadre */
  esCategoriaPadre(categoria: Categoria | null): boolean {
    if (!categoria) return false; // Si no hay categoría seleccionada, no es padre
    return this.categoriasPadre().some(c => c.Id === categoria.Id);
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
    const idCategoriaPadre = categoriaPadre ? categoriaPadre.Id : '';
    this.orquestadorService
      .crearCategoria(nombre, descripcion, this.cenadVisitado()!.Id, idCategoriaPadre)
      .subscribe({
        next: (success) => {
          if (success) {
            this.categoriaForm.reset();
            // 🔹 Volver siempre a la vista inicial de categorías principales
            this.volverCategoriasPadre();
          }
        },
        error: (err) => console.error(err)
      });
  }

  /** Volver al listado de categorías padre */
  volverCategoriasPadre() {
    this.categoriaSeleccionada.set(null);
    this.subcategorias.set([]);
    this.scrollToTop(); // 🔹 También volvemos arriba
  }
}
