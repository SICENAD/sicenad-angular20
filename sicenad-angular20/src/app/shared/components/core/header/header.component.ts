import { Component, computed, inject } from '@angular/core';
import { AuthStore } from '@stores/auth.store';
import { Router, RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { TranslateModule } from '@ngx-translate/core';
import { IdiomasStore } from '@stores/idiomas.store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private auth = inject(AuthStore);
  private router = inject(Router);
  private usuarioLogueado = inject(UsuarioLogueadoStore);
  private idiomasStore = inject(IdiomasStore);

  readonly routesPaths = RoutesPaths;

  username = computed(() => this.auth.username());
  token = computed(() => this.auth.token());
  identificacion = computed(() => {
    if (this.auth.rol() === RolUsuario.Administrador || this.auth.rol() === RolUsuario.Gestor) {
      return `${this.auth.rol()} del ${this.usuarioLogueado.cenadPropio()?.nombre || ''}`
    } else if (this.auth.rol() === RolUsuario.Normal) {
      return `${this.auth.rol()} de ${this.usuarioLogueado.unidad()?.nombre || ''}`
    } else {
      return this.auth.rol() || ''
    }
  })

  logout = () => {
    this.auth.logout();
    this.router.navigate([this.routesPaths.home]);
  }

  // Métodos y propiedades para la gestión de idiomas
  // Idioma actual
  idiomaActual = computed(() => this.idiomasStore.idiomaActual());

  // Idiomas disponibles
  idiomasDisponibles = computed(() => this.idiomasStore.idiomasDisponibles());

  cambiarIdioma(idioma: string) {
    this.idiomasStore.cambiarIdioma(idioma);
  }

  getBandera(codigo: string) {
    return this.idiomasStore.getBandera(codigo);
  }

  getEtiqueta(codigo: string) {
    return this.idiomasStore.getEtiqueta(codigo);
  }
  mostrarAlert() {
    this.idiomasStore.mostrarAlert();
  }
}
