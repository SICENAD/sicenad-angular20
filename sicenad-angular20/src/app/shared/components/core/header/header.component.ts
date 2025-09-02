import { Component, computed, inject } from '@angular/core';
import { AuthStore } from '@stores/auth.store';
import { Router, RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  private auth = inject(AuthStore);
  private router = inject(Router);
  private usuarioLogueado = inject(UsuarioLogueadoStore);

  readonly routesPaths = RoutesPaths;

  username = computed(() => this.auth.username());
  token = computed(() => this.auth.token());
  identificacion = computed(() => {
    if (this.auth.rol() === 'Administrador' || this.auth.rol() === 'Gestor') {
      return `${this.auth.rol()} del ${this.usuarioLogueado.cenadPropio()?.nombre || ''}`
    } else if (this.auth.rol() === 'Normal') {
      return `${this.auth.rol()} de ${this.usuarioLogueado.unidad()?.nombre || ''}`
    } else {
      return this.auth.rol() || ''
    }
  })

  logout = () => {
    this.auth.logout();
    this.router.navigate([this.routesPaths.home]);
  }

}
