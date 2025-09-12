import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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

@Component({
  selector: 'app-solicitud',
  imports: [RouterLink, FontAwesomeModule],
  templateUrl: './solicitud.component.html',
  styleUrls: ['./solicitud.component.css'],
})
export class SolicitudComponent {
  private auth = inject(AuthStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueadoStore = inject(UsuarioLogueadoStore);
  private iconoStore = inject(IconosStore);
  private utilService = inject(UtilService);
  private orquestadorService = inject(OrquestadorService);

  faEdit = this.iconoStore.faEdit;
  faConsultar = this.iconoStore.faConsultar;
  readonly routesPaths = RoutesPaths;

  recursos = computed(() => this.cenadStore.recursos());
  recurso = signal<Recurso | null>(null);
  usuarioLogueado = computed(() => this.usuarioLogueadoStore.usuarioLogueado());
  miUnidad = computed(() => this.usuarioLogueadoStore.unidad());
  cenadVisitado = computed(() => {
    return this.cenadStore.cenadVisitado();
  });

  isGestorEsteCenad = computed(() => {
    return (this.usuarioLogueadoStore.cenadPropio()?.idString === this.cenadVisitado()?.idString) && (this.auth.rol() === RolUsuario.Gestor);
  });

  isAdminEsteCenad = computed(() => {
    return (this.usuarioLogueadoStore.cenadPropio()?.idString === this.cenadVisitado()?.idString) && (this.auth.rol() === RolUsuario.Administrador);
  });

  solicitud = input<Solicitud>();
  isEditable = computed(() => this.solicitud()?.estado === 'Borrador' || this.solicitud()?.estado === 'Solicitada' || this.isAdminEsteCenad() || this.isGestorEsteCenad());
  fechaSolicitudString = signal<string>(this.utilService.formatearFecha(this.solicitud()?.fechaSolicitud));
  fechaInicioString = signal<string>(this.utilService.formatearFecha(this.solicitud()?.fechaInicioRecurso));
  fechaFinString = signal<string>(this.utilService.formatearFecha(this.solicitud()?.fechaFinRecurso));

    constructor() {
    // Este effect ahora se ejecuta en un contexto válido
    effect(() => {
      const solicitudActual = this.solicitud();
      const recursos = this.recursos();
      if (!recursos  || !solicitudActual) return;

      // Cargar la categoría del recurso
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
  }
}
