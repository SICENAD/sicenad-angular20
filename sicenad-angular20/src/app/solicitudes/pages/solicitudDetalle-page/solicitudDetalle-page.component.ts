import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { Recurso } from '@interfaces/models/recurso';
import { Solicitud } from '@interfaces/models/solicitud';
import { OrquestadorService } from '@services/orquestadorService';
import { UtilService } from '@services/utilService';
import { AuthStore } from '@stores/auth.store';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { UtilsStore } from '@stores/utils.store';

@Component({
  selector: 'app-solicitudDetalle',
  imports: [RouterLink, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './solicitudDetalle-page.component.html',
  styleUrls: ['./solicitudDetalle-page.component.css'],
})
export class SolicitudDetallePageComponent {

  private route = inject(ActivatedRoute);
  private auth = inject(AuthStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueadoStore = inject(UsuarioLogueadoStore);
  private iconoStore = inject(IconosStore);
  private utils = inject(UtilsStore);
  private fb = inject(FormBuilder);
  private utilService = inject(UtilService);
  private orquestadorService = inject(OrquestadorService);

  faVolver = this.iconoStore.faVolver;
  readonly routesPaths = RoutesPaths;

  estados = signal<string[]>(this.utils.estadosSolicitud());
  recursos = computed(() => this.cenadStore.recursos());
  recurso = signal<Recurso | null>(null);
  usuarioLogueado = computed(() => this.usuarioLogueadoStore.usuarioLogueado());
  cenadVisitado = computed(() => {
    return this.cenadStore.cenadVisitado();
  });

  isGestorEsteCenad = computed(() => {
    return (this.usuarioLogueadoStore.cenadPropio()?.idString === this.cenadVisitado()?.idString) && (this.auth.rol() === RolUsuario.Gestor);
  });

  isAdminEsteCenad = computed(() => {
    return (this.usuarioLogueadoStore.cenadPropio()?.idString === this.cenadVisitado()?.idString) && (this.auth.rol() === RolUsuario.Administrador);
  });
  idSolicitud = computed(() => this.route.snapshot.params['idSolicitud']);
  solicitud = signal<Solicitud | null>(null);
  isEditable = computed(() => this.solicitud()?.estado === 'Borrador' || (this.solicitud()?.estado === 'Solicitada' && (this.isAdminEsteCenad() || this.isGestorEsteCenad())));
  _idModal = signal('modal-solicitud-' + this.idSolicitud());
  _idModalEliminar = signal('modal-solicitud-eliminar-' + this.idSolicitud());
  idModal = computed(() => this._idModal() + this.idSolicitud());
  idModalEliminar = computed(() => this._idModalEliminar() + this.idSolicitud());

  solicitudForm: FormGroup = this.fb.group({
    observaciones: [''],
    observacionesCenad: [''],
    jefeUnidadUsuaria: ['', Validators.required],
    pocEjercicio: [''],
    tlfnRedactor: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    fechaSolicitud: [new Date(), Validators.required],
    fechaInicio: [new Date(), Validators.required],
    fechaFin: [new Date(), Validators.required],
    fechaFinDocumentacion: [new Date()],
    estado: [''],
  });

  get observaciones() { return this.solicitudForm.get('observaciones'); }
  get observacionesCenad() { return this.solicitudForm.get('observacionesCenad'); }
  get jefeUnidadUsuaria() { return this.solicitudForm.get('jefeUnidadUsuaria'); }
  get pocEjercicio() { return this.solicitudForm.get('pocEjercicio'); }
  get tlfnRedactor() { return this.solicitudForm.get('tlfnRedactor'); }
  get fechaSolicitud() { return this.solicitudForm.get('fechaSolicitud'); }
  get fechaInicio() { return this.solicitudForm.get('fechaInicio'); }
  get fechaFin() { return this.solicitudForm.get('fechaFin'); }
  get fechaFinDocumentacion() { return this.solicitudForm.get('fechaFinDocumentacion'); }
  get estado() { return this.solicitudForm.get('estado'); }

  constructor() {
    // Este effect ahora se ejecuta en un contexto válido
    effect(() => {
      const solicitudActual = this.solicitud();
      const recursos = this.recursos();
      if (!recursos || !solicitudActual) return;
      // Cargar el recurso de la solicitud
      this.orquestadorService.loadRecursoDeSolicitud(solicitudActual.idString).subscribe({
        next: (recurso) => {
          const recursoRef = recurso
            ? recursos.find(r => r.idString === recurso.idString) || null
            : null;
          this.recurso.set(recursoRef);
        },
        error: () => {
          this.recurso.set(null);
        }
      });
    });
    // Cargar la solicitud
    effect(() => {
      const idSol = this.idSolicitud();
      if (!idSol) return;
      this.orquestadorService.loadSolicitudSeleccionada(idSol).subscribe({
        next: (solicitud) => {
          this.solicitud.set(solicitud);
          this.cargarSolicitud();
        },
        error: () => {
          this.solicitud.set(null);
        }
      });
    });
  }

  cargarSolicitud(): void {
    if (!this.solicitud()) return;
    // Cargar los valores básicos


    this.solicitudForm.patchValue({
      observaciones: this.solicitud()?.observaciones || '',
      observacionesCenad: this.solicitud()?.observacionesCenad || '',
      jefeUnidadUsuaria: this.solicitud()?.jefeUnidadUsuaria || '',
      pocEjercicio: this.solicitud()?.pocEjercicio || '',
      tlfnRedactor: this.solicitud()?.tlfnRedactor || '',
      fechaSolicitud: this.utilService.formatDate(this.solicitud()?.fechaSolicitud?.toString()) || new Date(),
      fechaInicio: this.utilService.formatDateTime(this.solicitud()?.fechaHoraInicioRecurso?.toString()) || new Date(),
      fechaFin: this.utilService.formatDateTime(this.solicitud()?.fechaHoraFinRecurso?.toString()) || new Date(),
      fechaFinDocumentacion: this.utilService.formatDate(this.solicitud()?.fechaFinDocumentacion?.toString()) || null,
      estado: this.solicitud()?.estado || ''
    });
  }

 editarSolicitud() {
    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      return;
    }
    const { observaciones, observacionesCenad, jefeUnidadUsuaria, pocEjercicio, tlfnRedactor, fechaSolicitud, fechaInicio, fechaFin, fechaFinDocumentacion, estado } = this.solicitudForm.value;
    this.orquestadorService.actualizarSolicitud(observaciones, jefeUnidadUsuaria, pocEjercicio, tlfnRedactor, fechaInicio, fechaFin, estado, this.cenadVisitado()!.idString, this.idSolicitud(), observacionesCenad, fechaFinDocumentacion).subscribe({
      next: res => {
        if (res) {
          console.log(`Solicitud del recurso ${this.recurso()?.nombre} actualizada correctamente.`);
        }
      },
      error: (error) => {
        console.error('Error actualizando Solicitud:', error);
      }
    });
  }
  borrarSolicitud() {
    this.orquestadorService.borrarSolicitud(this.idSolicitud(), this.cenadVisitado()!.idString).subscribe(() => {
    });
  }
}
