import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Recurso } from '@interfaces/models/recurso';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { RecursoModalComponent } from '../recursoModal/recursoModal.component';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { AuthStore } from '@stores/auth.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';

@Component({
  selector: 'app-recurso',
  imports: [FontAwesomeModule, RouterLink, RecursoModalComponent],
  templateUrl: './recurso.component.html',
  styleUrls: ['./recurso.component.css']
})
export class RecursoComponent {
  private cenadStore = inject(CenadStore);
  private iconoStore = inject(IconosStore);
  private auth = inject(AuthStore);
  private usuarioLogueado = inject(UsuarioLogueadoStore);

  recurso = input.required<Recurso>();
  faConsultar = this.iconoStore.faConsultar;
  readonly routesPaths = RoutesPaths;
  cenadVisitado = computed(() => this.cenadStore.cenadVisitado());
  idCenad = computed(() => this.cenadStore.cenadVisitado()?.idString || '');
  isAdminEsteCenad = computed(() => {
    let idCenadPropio = this.usuarioLogueado.cenadPropio() ? this.usuarioLogueado.cenadPropio()?.idString : '';
    return (this.cenadVisitado()?.idString === idCenadPropio) && (this.auth.rol() === RolUsuario.Administrador);
  });
}
