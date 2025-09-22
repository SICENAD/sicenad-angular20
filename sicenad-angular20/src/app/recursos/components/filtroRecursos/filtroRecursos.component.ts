import { Component, computed, inject, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { Categoria } from '@interfaces/models/categoria';
import { Recurso } from '@interfaces/models/recurso';

@Component({
  selector: 'app-filtroRecursos',
  imports: [FontAwesomeModule],
  templateUrl: './filtroRecursos.component.html',
  styleUrls: ['./filtroRecursos.component.css']
})
export class FiltroRecursosComponent {
  // Servicios y stores
  private orquestadorService = inject(OrquestadorService);
  private cenadStore = inject(CenadStore);
  private iconoStore = inject(IconosStore);

  recursosFiltradosChange = output<Recurso[]>();
  categoriaSeleccionadaChange = output<Categoria | null>();

  /** Icono FontAwesome */
  faSubir = this.iconoStore.faSubir;

  /** Signals para estados */
  recursos = computed(() => this.cenadStore.recursos());
  categorias = computed(() => this.cenadStore.categorias());
  categoriasPadre = computed(() => this.cenadStore.categoriasPadre());

  // Categoría seleccionada
  categoriaSeleccionada = signal<Categoria | null>(null);
  subcategorias = signal<Categoria[]>([]);
  recursosCategoriaSeleccionada = signal<Recurso[]>([]);

  // Filtro
  filtro = signal<string>('');

  /** Recursos filtrados en función de categoría seleccionada y texto de búsqueda */
  recursosFiltrados = computed(() => {
    const term = this.filtro().toLowerCase();
    // Base inicial
    let listaBase = this.categoriaSeleccionada()
      ? this.recursosCategoriaSeleccionada()
      : this.recursos();
    // Filtro por nombre
    if (term) {
      listaBase = listaBase.filter(r => r.nombre.toLowerCase().includes(term));
    }
    return listaBase;
  });

  /** Seleccionar una categoría para filtrar los recursos */
  seleccionarCategoria(categoria: Categoria | null) {
    if (categoria) {
      this.categoriaSeleccionada.set(categoria);
      // Cargar recursos de la categoría
      this.orquestadorService.loadRecursosDeSubcategorias(categoria.idString).subscribe({
        next: (recursos) => {
          const lista = recursos ?? [];
          this.recursosCategoriaSeleccionada.set(lista);
          // Emitir al padre el valor actualizado
          this.recursosFiltradosChange.emit(lista);
          this.categoriaSeleccionadaChange.emit(categoria);
        },
        error: (err) => {
          console.error('Error cargando recursos de la categoría', err);
          this.recursosCategoriaSeleccionada.set([]);
          this.recursosFiltradosChange.emit([]);
          this.categoriaSeleccionadaChange.emit(null);
        }
      });
      // Cargar subcategorías directas
      this.orquestadorService.loadSubcategorias(categoria.idString).subscribe({
        next: (subcats) => this.subcategorias.set(subcats ?? []),
        error: (err) => {
          console.error('Error cargando subcategorías', err);
          this.subcategorias.set([]);
          this.recursosCategoriaSeleccionada.set([]);
        }
      });
    } else {
      // Si es null, se resetea a la vista principal
      this.categoriaSeleccionada.set(null);
      this.subcategorias.set([]);
      this.recursosCategoriaSeleccionada.set([]);
    }
  }

  /** Volver a la categoría padre (subir un nivel) */
  volverCategoriaAnterior() {
    const categoriaActual = this.categoriaSeleccionada();
    if (!categoriaActual) return;
    this.orquestadorService.loadCategoriaPadre(categoriaActual.idString).subscribe({
      next: (categoriaPadre) => {
        if (categoriaPadre) {
          // Si hay categoría padre, la seleccionamos
          this.seleccionarCategoria(categoriaPadre);
        } else {
          // Si no tiene padre → volver a la vista raíz
          this.limpiarCategoria();
        }
      },
      error: (err) => {
        console.error('Error cargando la categoría padre', err);
        // Si da error 502 u otro, volvemos a la vista raíz
        this.limpiarCategoria();
      }
    });
  }

  /** Quitar la categoría seleccionada (mostrar todos los recursos) */
  limpiarCategoria() {
    this.categoriaSeleccionada.set(null);
    this.subcategorias.set([]);
    this.recursosCategoriaSeleccionada.set([]);
    this.recursosFiltradosChange.emit([]);
    this.categoriaSeleccionadaChange.emit(null);
  }

  /** Devuelve true si la categoría es categoriaPadre */
  esCategoriaPadre(categoria: Categoria | null): boolean {
    if (!categoria) return false; // Si no hay categoría seleccionada, no es padre
    return this.categoriasPadre().some(c => c.idString === categoria.idString);
  }

}
