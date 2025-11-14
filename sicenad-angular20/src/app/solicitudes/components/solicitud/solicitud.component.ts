import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { Recurso } from '@interfaces/models/recurso';
import { Solicitud } from '@interfaces/models/solicitud';
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
  utilService = inject(UtilService);

  faEdit = this.iconoStore.faEdit;
  faConsultar = this.iconoStore.faConsultar;
  faVolver = this.iconoStore.faVolver;
  readonly routesPaths = RoutesPaths;

  recursos = computed(() => this.cenadStore.recursos());
  usuarioLogueado = computed(() => this.usuarioLogueadoStore.usuarioLogueado());
  miUnidad = computed(() => this.usuarioLogueadoStore.unidad());
  cenadVisitado = computed(() => {
    return this.cenadStore.cenadVisitado();
  });
  isGestorEsteCenad = computed(() => {
    return (
      this.usuarioLogueadoStore.cenadPropio()?.Id === this.cenadVisitado()?.Id &&
      this.auth.rol() === RolUsuario.Gestor
    );
  });
  isAdminEsteCenad = computed(() => {
    return (
      this.usuarioLogueadoStore.cenadPropio()?.Id === this.cenadVisitado()?.Id &&
      this.auth.rol() === RolUsuario.Administrador
    );
  });

  solicitud = input<Solicitud>();
  recurso = signal<Recurso | undefined>(this.solicitud()?.recurso);
  isEditable = computed(
    () =>
      this.solicitud()?.estado === 'Borrador' ||
      (this.solicitud()?.estado === 'Solicitada' &&
        (this.isAdminEsteCenad() || this.isGestorEsteCenad()))
  );
  fechaSolicitudString = computed(() =>
    this.utilService.fechaDiaMesYear(this.solicitud()?.fechaSolicitud)
  );
  fechaInicioString = computed(() =>
    this.utilService.fechaDiaMesYear(this.solicitud()?.fechaHoraInicioRecurso)
  );
  fechaFinString = computed(() =>
    this.utilService.fechaDiaMesYear(this.solicitud()?.fechaHoraFinRecurso)
  );

  constructor() {
    // Este effect ahora se ejecuta en un contexto válido
    effect(() => {
      this.recurso.set(this.solicitud()!.recurso);
    });
  }
}
