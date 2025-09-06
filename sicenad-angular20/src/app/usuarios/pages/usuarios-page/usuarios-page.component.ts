import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthStore } from '@stores/auth.store';
import { CenadStore } from '@stores/cenad.store';
import { IconosStore } from '@stores/iconos.store';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { UsuariosSuperadministradorPageComponent } from "../usuariosSuperadministrador-page/usuariosSuperadministrador-page.component";
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';

@Component({
  selector: 'app-usuarios-page',
  imports: [RouterLink, FontAwesomeModule, UsuariosSuperadministradorPageComponent],
  templateUrl: './usuarios-page.component.html',
  styleUrls: ['./usuarios-page.component.css'],
})
export class UsuariosPageComponent {
  private auth = inject(AuthStore);
  private cenadStore = inject(CenadStore);
  private usuarioLogueado = inject(UsuarioLogueadoStore);
  private iconoStore = inject(IconosStore);

  faVolver = this.iconoStore.faVolver;
  readonly routesPaths = RoutesPaths;
  readonly misRoles = RolUsuario;
  name = computed(() => {
    return this.rol() === this.misRoles.Superadministrador ? this.routesPaths.superadministrador : this.routesPaths.cenadHome;
  });
  idCenadVisitado = computed(() => {
    return this.cenadStore.cenadVisitado()?.idString;
  });
  isMiCenad = computed(() => {
    let idCenadPropio = this.usuarioLogueado.cenadPropio() ? this.usuarioLogueado.cenadPropio()?.idString : '';
    return (this.idCenadVisitado() == idCenadPropio);
  });
  rol = signal<string | null>(this.auth.rol());
  params = computed(() => {
    return this.rol() === this.misRoles.Superadministrador ? {} : this.idCenadVisitado();
  });
}
