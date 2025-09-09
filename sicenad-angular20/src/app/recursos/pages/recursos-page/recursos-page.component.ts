import { Component, computed, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { Categoria } from '@interfaces/models/categoria';
import { Recurso } from '@interfaces/models/recurso';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { RecursoComponent } from '@app/recursos/components/recurso/recurso.component';

@Component({
  selector: 'app-recursos',
  imports: [RouterLink, FontAwesomeModule, ReactiveFormsModule, RecursoComponent],
  templateUrl: './recursos-page.component.html',
  styleUrls: ['./recursos-page.component.css']
})
export class RecursosPageComponent {
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private cenadStore = inject(CenadStore);
  private orquestadorService = inject(OrquestadorService);
  private iconoStore = inject(IconosStore);
  private fb = inject(FormBuilder);

  @ViewChild('topScroll') topScroll!: ElementRef<HTMLDivElement>;

  faVolver = this.iconoStore.faVolver;
  faSubir = this.iconoStore.faSubir;
  readonly routesPaths = RoutesPaths;

  // Estado base
  recursos = computed(() => this.cenadStore.recursos());
  categorias = computed(() => this.cenadStore.categorias());
  categoriasPadre = computed(() => this.cenadStore.categoriasPadre());
  tiposFormulario = computed(() => this.datosPrincipalesStore.tiposFormulario());
  usuariosGestor = computed(() => this.cenadStore.usuariosGestor());
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());

    recursoForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    otros: [''],
    categoria: [null, Validators.required],
    tipoFormulario: [null, Validators.required],
    usuarioGestor: [null, Validators.required]
  });

  get nombre() { return this.recursoForm.get('nombre'); }
  get descripcion() { return this.recursoForm.get('descripcion'); }
  get otros() { return this.recursoForm.get('otros'); }
  get categoria() { return this.recursoForm.get('categoria'); }
  get tipoFormulario() { return this.recursoForm.get('tipoFormulario'); }
  get usuarioGestor() { return this.recursoForm.get('usuarioGestor'); }

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
        next: (recursos) => this.recursosCategoriaSeleccionada.set(recursos ?? []),
        error: (err) => {
          console.error('Error cargando recursos de la categoría', err);
          this.recursosCategoriaSeleccionada.set([]);
        }
      });
      // Cargar subcategorías directas
      this.orquestadorService.loadSubcategorias(categoria.idString).subscribe({
        next: (subcats) => this.subcategorias.set(subcats ?? []),
        error: (err) => {
          console.error('Error cargando subcategorías', err);
          this.subcategorias.set([]);
        }
      });
    } else {
      // Si es null, se resetea a la vista principal
      this.categoriaSeleccionada.set(null);
      this.subcategorias.set([]);
      this.recursosCategoriaSeleccionada.set([]);
    }
    this.scrollToTop();
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

  /** Scroll automático hacia arriba */
  private scrollToTop() {
    if (this.topScroll) {
      this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /** Quitar la categoría seleccionada (mostrar todos los recursos) */
  limpiarCategoria() {
    this.categoriaSeleccionada.set(null);
    this.subcategorias.set([]);
    this.recursosCategoriaSeleccionada.set([]);
  }

  /** Devuelve true si la categoría es categoriaPadre */
  esCategoriaPadre(categoria: Categoria | null): boolean {
    if (!categoria) return false; // Si no hay categoría seleccionada, no es padre
    return this.categoriasPadre().some(c => c.idString === categoria.idString);
  }

/** Crear recurso */
  crearRecurso() {
    if (this.recursoForm.invalid) {
      this.recursoForm.markAllAsTouched();
      return;
    }
    const { nombre, descripcion, otros, categoria, tipoFormulario, usuarioGestor } = this.recursoForm.value;
    let otrosVacio = '';
    if (otros) {
      otrosVacio = otros;
    }
    this.orquestadorService
      .crearRecurso(nombre, descripcion, otrosVacio, this.cenadVisitado()!.idString, tipoFormulario.idString, categoria.idString, usuarioGestor.idString)
      .subscribe({
        next: (success) => {
          if (success) {
            this.recursoForm.reset();
            // 🔹 Volver siempre a la vista inicial de categorías principales
            this.limpiarCategoria();
          } else {
            console.error('Error al crear la categoría');
          }
        },
        error: (err) => console.error('Error en la creación de categoría', err)
      });
  }

}
