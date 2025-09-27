import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { UsuarioComponent } from '@app/usuarios/components/usuario/usuario.component';
import { DatosPrincipalesStore } from '@stores/datosPrincipales.store';

@Component({
  selector: 'app-usuariosSuperadministrador-page',
  imports: [UsuarioComponent, RouterLink],
  templateUrl: './usuariosSuperadministrador-page.component.html',
  styleUrls: ['./usuariosSuperadministrador-page.component.css']
})
export class UsuariosSuperadministradorPageComponent {
  private datosPrincipalesStore = inject(DatosPrincipalesStore);
  usuariosSuperadministrador = computed(() => this.datosPrincipalesStore.usuariosSuperadministrador());
  readonly routesPaths = RoutesPaths;
 }
