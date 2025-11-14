import { Component, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { AuthStore } from '@stores/auth.store';
import { CenadStore } from '@stores/cenad.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';
import { OrquestadorService } from '@services/orquestadorService';
import { Categoria } from '@interfaces/models/categoria';
import { Recurso } from '@interfaces/models/recurso';
import { Solicitud } from '@interfaces/models/solicitud';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-solicitudNuevaModal',
  imports: [ReactiveFormsModule, TranslateModule, UpperCasePipe],
  templateUrl: './solicitudNuevaModal.component.html',
  styleUrls: ['./solicitudNuevaModal.component.css']
})
export class SolicitudNuevaModalComponent {

  private auth = inject(AuthStore);
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueadoStore = inject(UsuarioLogueadoStore);
  private fb = inject(FormBuilder);
  private orquestadorService = inject(OrquestadorService);

  readonly misRoles = RolUsuario;
  solicitudesChange = output<Solicitud[]>();

  unidades = computed(() => this.datosPrincipalesStore.unidades());
  categorias = computed(() => this.cenadStore.categorias());
  categoriasPadre = computed(() => this.cenadStore.categoriasPadre());
  recursos = signal<any[]>(this.cenadStore.recursos());
  usuarioLogueado = computed(() => this.usuarioLogueadoStore.usuarioLogueado());
  miUnidad = computed(() => this.usuarioLogueadoStore.unidad());
  cenadVisitado = computed(() => {
    return this.cenadStore.cenadVisitado();
  });
  isGestorEsteCenad = computed(() => {
    return (this.usuarioLogueadoStore.cenadPropio()?.Id === this.cenadVisitado()?.Id) && (this.auth.rol() === RolUsuario.Gestor);
  });
  isAdminEsteCenad = computed(() => {
    return (this.usuarioLogueadoStore.cenadPropio()?.Id === this.cenadVisitado()?.Id) && (this.auth.rol() === RolUsuario.Administrador);
  });
  loading = signal(false);
  categoriasFiltradas = signal<Categoria[]>([]);
  categoriaSeleccionada = signal<Categoria | null>(null);
  historialCategorias = signal<Categoria[]>([]);
  cacheSubcategorias = signal(new Map<string, Categoria[]>());
  cacheRecursos = signal(new Map<string, Recurso[]>());

  solicitudForm: FormGroup = this.fb.group({
    unidad: [null],
    observaciones: [''],
    jefeUnidadUsuaria: ['', Validators.required],
    pocEjercicio: ['', Validators.required],
    tlfnRedactor: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    fechaSolicitud: [this.formatDateTimeLocal(new Date()), Validators.required],
    fechaInicio: [this.formatDateTimeLocal(new Date()), Validators.required],
    fechaFin: [this.formatDateTimeLocal(new Date()), Validators.required],
    estado: ['Borrador', Validators.required],
    categoria: [null],
    recurso: [null, Validators.required],
  });

  get observaciones() { return this.solicitudForm.get('observaciones'); }
  get unidad() { return this.solicitudForm.get('unidad'); }
  get jefeUnidadUsuaria() { return this.solicitudForm.get('jefeUnidadUsuaria'); }
  get pocEjercicio() { return this.solicitudForm.get('pocEjercicio'); }
  get tlfnRedactor() { return this.solicitudForm.get('tlfnRedactor'); }
  get fechaSolicitud() { return this.solicitudForm.get('fechaSolicitud'); }
  get fechaInicio() { return this.solicitudForm.get('fechaInicio'); }
  get fechaFin() { return this.solicitudForm.get('fechaFin'); }
  get estado() { return this.solicitudForm.get('estado'); }
  get recurso() { return this.solicitudForm.get('recurso'); }
  get categoria() { return this.solicitudForm.get('categoria'); }

  ngOnInit() {
    // Si el usuario es Normal, fijamos su unidad en el formulario para que sea válida
    if (this.usuarioLogueado()?.rol === RolUsuario.Normal) {
      const m = this.miUnidad();
      if (m) this.solicitudForm.patchValue({ unidad: m });
    }
    this.cargarCategoriasPadre();
  }

  private pad2(n: number) { return n < 10 ? '0' + n : String(n); }
  private formatDateTimeLocal(d: Date): string {
    // Formato yyyy-MM-ddTHH:mm compatible con input[type=datetime-local]
    const year = d.getFullYear();
    const month = this.pad2(d.getMonth() + 1);
    const day = this.pad2(d.getDate());
    const hours = this.pad2(d.getHours());
    const minutes = this.pad2(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /** Carga inicial de categorías padre */
  cargarCategoriasPadre() {
    this.loading.set(true);
    this.categoriasFiltradas.set(this.cenadStore.categoriasPadre());
    this.categoriaSeleccionada.set(null);
    this.historialCategorias.set([]);
    this.recursos.set(this.cenadStore.recursos());
    this.loading.set(false);
  }

  /** Filtrar por categoría seleccionada con caché */
  filtrar() {
    const categoria = this.categoriaSeleccionada();
    if (!categoria) return;
    this.loading.set(true);
    const idCat = categoria.Id;
    // Añadimos la categoría al historial
    this.historialCategorias.update(historial => [...historial, categoria]);
    // Verificar si las subcategorías ya están cacheadas
    const cacheSub = this.cacheSubcategorias().get(idCat);
    if (cacheSub) {
      this.procesarSubcategorias(idCat, cacheSub);
      this.loading.set(false);
      return;
    }
    // Si no están cacheadas, cargar desde servicio
    this.orquestadorService.loadSubcategorias(idCat).subscribe({
      next: (subs) => {
        const subcategorias = subs ?? [];
        // Guardar en caché
        this.cacheSubcategorias.update(cache => {
          const nuevo = new Map(cache);
          nuevo.set(idCat, subcategorias);
          return nuevo;
        });
        // Procesar ahora que tenemos datos
        this.procesarSubcategorias(idCat, subcategorias);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
  /** Procesa subcategorías y carga recursos */
  private procesarSubcategorias(idCat: string, subcategorias: Categoria[]) {
    if (subcategorias.length === 0) {
      // No hay subcategorías, buscar recursos directos
      const cacheRec = this.cacheRecursos().get(idCat);
      if (cacheRec) {
        this.recursos.set(cacheRec);
        this.categoriasFiltradas.set([]);
        return;
      }
      this.orquestadorService.loadRecursosDeCategoria(idCat).subscribe({
        next: (rec) => {
          const recursosCat = rec ?? [];
          this.cacheRecursos.update(cache => {
            const nuevo = new Map(cache);
            nuevo.set(idCat, recursosCat);
            return nuevo;
          });
          this.recursos.set(recursosCat);
          this.categoriasFiltradas.set([]);
        }
      });
    } else {
      // Hay subcategorías
      this.categoriasFiltradas.set(subcategorias);
      const cacheRec = this.cacheRecursos().get(idCat);
      if (cacheRec) {
        this.recursos.set(cacheRec);
        return;
      }
      this.orquestadorService.loadRecursosDeSubcategorias(idCat).subscribe({
        next: (rec) => {
          const recursosCat = rec ?? [];
          this.cacheRecursos.update(cache => {
            const nuevo = new Map(cache);
            nuevo.set(idCat, recursosCat);
            return nuevo;
          });
          this.recursos.set(recursosCat);
        }
      });
    }
    this.loading.set(false);
  }

  /** Borrar filtros y volver al estado inicial */
  borrarFiltros() {
    this.cargarCategoriasPadre();
    this.solicitudForm.patchValue({ categoria: null, recurso: null });
  }

  /** Retroceder en historial de categorías */
  retroceder() {
    const historial = this.historialCategorias();
    if (historial.length === 0) return;
    this.loading.set(true);
    // Eliminamos la última categoría
    const nuevoHistorial = [...historial];
    nuevoHistorial.pop();
    this.historialCategorias.set(nuevoHistorial);
    // Si no queda historial, volvemos a categorías padre
    if (nuevoHistorial.length === 0) {
      this.solicitudForm.patchValue({ categoria: null, recurso: null });
      this.cargarCategoriasPadre();
      this.loading.set(false);
      return;
    }
    // Categoría actual (última después de retroceder)
    const ultimaCategoria = nuevoHistorial[nuevoHistorial.length - 1];
    const idCat = ultimaCategoria.Id;
    /** === SUBCATEGORÍAS === */
    const cacheSub = this.cacheSubcategorias().get(idCat);
    if (cacheSub) {
      // Si ya está en caché, la usamos directamente
      this.categoriasFiltradas.set(cacheSub);
      this.cargarRecursosRetroceso(idCat);
    } else {
      // Si no está en caché, la cargamos desde el servicio
      this.orquestadorService.loadSubcategorias(idCat).subscribe({
        next: (subcategorias) => {
          const subs = subcategorias ?? [];
          // Guardar en caché
          this.cacheSubcategorias.update(cache => {
            const nuevo = new Map(cache);
            nuevo.set(idCat, subs);
            return nuevo;
          });
          this.categoriasFiltradas.set(subs);
          // Después de cargar subcategorías, cargamos recursos
          this.cargarRecursosRetroceso(idCat);
        },
        error: () => {
          this.categoriasFiltradas.set([]);
          this.loading.set(false);
        }
      });
    }
    this.solicitudForm.patchValue({ categoria: null, recurso: null });
  }

  /** Carga recursos para retroceder en historial */
  private cargarRecursosRetroceso(idCat: string) {
    const cacheRec = this.cacheRecursos().get(idCat);
    if (cacheRec) {
      this.recursos.set(cacheRec);
      this.finalizarRetroceso();
    } else {
      this.orquestadorService.loadRecursosDeSubcategorias(idCat).subscribe({
        next: (recursos) => {
          const recursosCat = recursos ?? [];
          // Guardar en caché
          this.cacheRecursos.update(cache => {
            const nuevo = new Map(cache);
            nuevo.set(idCat, recursosCat);
            return nuevo;
          });
          this.recursos.set(recursosCat);
          this.finalizarRetroceso();
        },
        error: () => {
          this.recursos.set([]);
          this.finalizarRetroceso();
        }
      });
    }
  }

  /** Finaliza la operación de retroceso limpiando estados */
  private finalizarRetroceso() {
    this.categoriaSeleccionada.set(null);
    this.loading.set(false);
  }

  /** Obtener solicitudes por estado */
  getSolicitudes(estado: string) {
    this.orquestadorService.loadAllSolicitudes(this.cenadVisitado()!.Id).subscribe({
      next: (solicitudes) => {
          const lista = solicitudes ?? [];
          // Emitir al padre el valor actualizado
          this.solicitudesChange.emit(lista);
        },
      error: (err) => console.error(err)
    });
    this.orquestadorService.loadAllSolicitudesEstado(this.cenadVisitado()!.Id, estado).subscribe({
      error: (err) => console.error(err)
    });
  }

  /** Crear solicitud */
  crearSolicitud() {
    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      return;
    }
    if (this.usuarioLogueado()?.rol === RolUsuario.Normal) {
      this.solicitudForm.patchValue({ unidad: this.miUnidad() });
    }
    const { observaciones, unidad, jefeUnidadUsuaria, pocEjercicio, tlfnRedactor, fechaSolicitud, fechaInicio, fechaFin, estado, recurso } = this.solicitudForm.value;
    this.orquestadorService
      .crearSolicitud(observaciones,
        unidad.nombre,
        jefeUnidadUsuaria,
        pocEjercicio,
        tlfnRedactor,
        fechaSolicitud,
        fechaInicio,
        fechaFin,
        estado,
        this.cenadVisitado()!.Id,
        recurso.Id,
        this.usuarioLogueado()!.Id)
      .subscribe({
        next: (success) => {
          if (success) {
            // Usar resetForm para restablecer valores por defecto que el formulario espera
            this.resetForm();
            // 🔹 Volver siempre a la vista inicial de categorías principales
            this.getSolicitudes(estado);
          }
        },
        error: (err) => console.error(err)
      });
  }

  /** Botón Crear y Enviar */
  crearYEnviarSolicitud() {
    this.estado?.setValue('Solicitada');
    this.crearSolicitud();
  }

  /** Botón Crear Planificación */
  crearPlanificacion() {
    this.estado?.setValue('Validada');//o si ponemos un estado de Planificación...
    this.crearSolicitud();
  }

  onCategoriaChange(event: Event) {
    const categoria = this.solicitudForm.get('categoria')?.value;
    this.categoriaSeleccionada.set(categoria);
    this.filtrar();
  }

  resetForm() {
    // Restablecer campos con valores por defecto compatibles con los inputs
    const now = new Date();
    const fechaDefault = this.formatDateTimeLocal(now);
    const unidadDefault = this.usuarioLogueado()?.rol === RolUsuario.Normal ? this.miUnidad() : null;
    this.solicitudForm.reset({
      unidad: unidadDefault,
      observaciones: '',
      jefeUnidadUsuaria: '',
      pocEjercicio: '',
      tlfnRedactor: '',
      fechaSolicitud: fechaDefault,
      fechaInicio: fechaDefault,
      fechaFin: fechaDefault,
      estado: 'Borrador',
      categoria: null,
      recurso: null
    });
    // Recargar filtros y recursos
    this.cargarCategoriasPadre();
  }
}
