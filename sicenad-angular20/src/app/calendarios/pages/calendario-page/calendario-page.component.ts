import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrquestadorService } from '@services/orquestadorService';
import { CenadStore } from '@stores/cenad.store';
import { ReactiveFormsModule } from '@angular/forms';
import { IconosStore } from '@stores/iconos.store';
import { RoutesPaths } from '@app/app.routes';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { AuthStore } from '@stores/auth.store';
import { Categoria } from '@interfaces/models/categoria';
import { Recurso } from '@interfaces/models/recurso';
import { Solicitud } from '@interfaces/models/solicitud';
import { CalendarioComponent } from '@app/calendarios/components/calendario/calendario.component';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    RouterLink,
    CalendarioComponent
  ],
  templateUrl: './calendario-page.component.html',
  styleUrls: ['./calendario-page.component.css'],
  providers: [DatePipe]
})
export class CalendarioPageComponent {
  // Servicios y stores
  private orquestadorService = inject(OrquestadorService);
  private cenadStore = inject(CenadStore);
  private iconoStore = inject(IconosStore);
  private usuarioLogueadoStore = inject(UsuarioLogueadoStore);
  private auth = inject(AuthStore);

  readonly routesPaths = RoutesPaths;
  /** Icono FontAwesome */
  faVista = this.iconoStore.faVista;
  faVolver = this.iconoStore.faVolver;
  faSubir = this.iconoStore.faSubir;

  /** Signals para estados */
  recursoSeleccionado = signal<Recurso | null>(null);

  isAutenticado = signal(false);
  isUsuarioNormal = signal(false);
  isAdministrador = signal(false);
  isGestor = signal(false);
  isSuperAdmin = signal(false);

  recursos = computed(() => this.cenadStore.recursos());
  categorias = computed(() => this.cenadStore.categorias());
  categoriasPadre = computed(() => this.cenadStore.categoriasPadre());
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  solicitudes = signal<Solicitud[]>([]);


  constructor() {
    //this.initComponent();
  }

  /** Inicialización principal */
  private initComponent() {
    this.comprobarUser();
  }

  /** Comprueba la sesión del usuario */
  private comprobarUser() {
    this.isAutenticado.set(this.auth.isAuthenticated());

    if (!this.isAutenticado()) {
      this.isUsuarioNormal.set(false);
      this.isAdministrador.set(false);
      this.isGestor.set(false);
      this.isSuperAdmin.set(false);
      return;
    }

    this.isAdministrador.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol === 'Administrador');
    this.isGestor.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol === 'Gestor');
    this.isUsuarioNormal.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol === 'Normal');
    this.isSuperAdmin.set(this.usuarioLogueadoStore.usuarioLogueado()?.rol === 'Superadministrador');
  }

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
  }

  /** Devuelve true si la categoría es categoriaPadre */
  esCategoriaPadre(categoria: Categoria | null): boolean {
    if (!categoria) return false; // Si no hay categoría seleccionada, no es padre
    return this.categoriasPadre().some(c => c.idString === categoria.idString);
  }

  seleccionarRecurso(id: string) {
    const recurso = this.recursosFiltrados().find(r => r.idString === id) || null;
    this.recursoSeleccionado.set(recurso);
    this.cargarEventosDeRecurso(recurso!.idString);
  }

  cargarEventosDeRecurso(idRecurso: string) {
    this.orquestadorService.loadSolicitudesDeRecurso(idRecurso).subscribe({
      next: (solicitudes) => {
        this.solicitudes.set(solicitudes ?? []);
      },
      error: (err) => {
        console.error('Error cargando solicitudes de recurso', err);
        this.solicitudes.set([]);
      }
    });
  }

}
