import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { AuthStore } from '@stores/auth.store';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { SolicitudesEstadoPageComponent } from '../solicitudesEstado-page/solicitudesEstado-page.component';
import { SolicitudNuevaModalComponent } from "@app/solicitudes/components/solicitudNuevaModal/solicitudNuevaModal.component";

@Component({
  selector: 'app-solicitudes',
  imports: [FontAwesomeModule, RouterLink, SolicitudesEstadoPageComponent, SolicitudNuevaModalComponent],
  templateUrl: './solicitudes-page.component.html',
  styleUrls: ['./solicitudes-page.component.css']
})
export class SolicitudesPageComponent {

  private auth = inject(AuthStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueadoStore = inject(UsuarioLogueadoStore);
  private iconoStore = inject(IconosStore);

  faVolver = this.iconoStore.faVolver;
  readonly routesPaths = RoutesPaths;
  readonly misRoles = RolUsuario;

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
  estadoSolicitud = signal<any>({
    Solicitada: 'Solicitada',
    Validada: 'Validada',
    Rechazada: 'Rechazada',
    Cancelada: 'Cancelada',
    Borrador: 'Borrador'
  });

}
