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
import { FiltroRecursosComponent } from '@app/recursos/components/filtroRecursos/filtroRecursos.component';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-recursos',
  imports: [RouterLink, FontAwesomeModule, ReactiveFormsModule, RecursoComponent, FiltroRecursosComponent, TranslateModule, UpperCasePipe],
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
  readonly routesPaths = RoutesPaths;

  // Estado base
  recursos = computed(() => this.cenadStore.recursos());
  categorias = computed(() => this.cenadStore.categorias());
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
  recursosCategoriaSeleccionada = signal<Recurso[]>([]);

  actualizarRecursosFiltrados(lista: Recurso[]) {
    this.recursosCategoriaSeleccionada.set(lista);
  }

  actualizarCategoriaSeleccionada(categoria: Categoria | null) {
    this.categoriaSeleccionada.set(categoria);
  }

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
          } 
        },
        error: (err) => console.error(err)
      });
  }
}
