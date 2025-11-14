import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { Recurso } from '@interfaces/models/recurso';
import { Solicitud } from '@interfaces/models/solicitud';
import { UsuarioGestor } from '@interfaces/models/usuarioGestor';
import { UsuarioNormal } from '@interfaces/models/usuarioNormal';
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
  faVolver = this.iconoStore.faVolver;
  readonly routesPaths = RoutesPaths;

  recursos = computed(() => this.cenadStore.recursos());
  usuarioLogueado = computed(() => this.usuarioLogueadoStore.usuarioLogueado());
  miUnidad = computed(() => this.usuarioLogueadoStore.unidad());
  cenadVisitado = computed(() => {
    return this.cenadStore.cenadVisitado();
  });

  isAdminEsteCenad = computed(() => {
    return (
      this.usuarioLogueadoStore.cenadPropio()?.Id === this.cenadVisitado()?.Id &&
      this.auth.rol() === RolUsuario.Administrador
    );
  });

  solicitud = input<Solicitud>();
  recurso = signal<Recurso | undefined>(this.solicitud()?.recurso);
  usuarioGestor = signal<UsuarioGestor | null>(null);
  usuarioNormal = signal<UsuarioNormal | null>(null);
  isGestorEsteRecurso = signal<boolean>(false);
  isUsuarioNormalEstaSolicitud = signal<boolean>(false);
  isEditable = computed(
    () =>
      //quiero que borrador y la solicitada la puedan editar el usuarioNormal de la solicitud y el administrador del cenad
      ((this.solicitud()?.estado === 'Borrador' || this.solicitud()?.estado === 'Solicitada') &&
        (this.isAdminEsteCenad() || this.isUsuarioNormalEstaSolicitud())) ||
      //quiero que la validada la pueda editar el administrador del cenad y el gestor del recurso
      (this.solicitud()?.estado === 'Validada' &&
        (this.isAdminEsteCenad() || this.isGestorEsteRecurso()))
    //quiero que la rechazada y la cancelada no se puedan editar
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
    effect(() => {
      this.orquestadorService.loadUsuarioGestorDeRecurso(this.recurso()!.Id).subscribe({
        next: (u) => {
          this.usuarioGestor.set(u);
        },
        error: () => {
          this.usuarioGestor.set(null);
        },
      });
    });
    effect(() => {
      this.orquestadorService.loadUsuarioNormalDeSolicitud(this.solicitud()!.Id).subscribe({
        next: (u) => {
          this.usuarioNormal.set(u);
        },
        error: () => {
          this.usuarioNormal.set(null);
        },
      });
    });
    effect(() => {
      this.isGestorEsteRecurso.set(
        this.usuarioLogueadoStore.usuarioLogueado()!.Id === this.usuarioGestor()?.Id &&
          this.auth.rol() === RolUsuario.Gestor
      );
    });
    effect(() => {
      this.isUsuarioNormalEstaSolicitud.set(
        this.usuarioLogueadoStore.usuarioLogueado()!.Id === this.usuarioNormal()?.Id &&
          this.auth.rol() === RolUsuario.Normal
      );
    });
  }
}
