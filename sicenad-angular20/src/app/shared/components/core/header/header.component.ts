import { Component, computed, effect, inject, signal } from '@angular/core';
import { AuthStore } from '@stores/auth.store';
import { Router, RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { UsuarioLogueadoStore } from '@stores/usuarioLogueado.store';
import { RolUsuario } from '@interfaces/enums/rolUsuario.enum';
import { TranslateModule } from '@ngx-translate/core';
import { IdiomasStore } from '@stores/idiomas.store';
import { IconosStore } from '@stores/iconos.store';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UsuarioModalComponent } from "@app/usuarios/components/usuarioModal/usuarioModal.component";
import { Usuario } from '@interfaces/models/usuario';
import { Cenad } from '@interfaces/models/cenad';
import { Unidad } from '@interfaces/models/unidad';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslateModule, FontAwesomeModule, UsuarioModalComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private auth = inject(AuthStore);
  private router = inject(Router);
  private usuarioLogueado = inject(UsuarioLogueadoStore);
  private idiomasStore = inject(IdiomasStore);
  private iconosStore = inject(IconosStore);

  readonly routesPaths = RoutesPaths;
  faEditUser = this.iconosStore.faEditUser;

  usuarioModal = signal<Usuario | undefined>(undefined);
  cenadPropioModal = signal<Cenad | undefined>(undefined);
  unidadPropiaModal = signal<Unidad | undefined>(undefined);

  usuario = computed(() => this.usuarioLogueado.usuarioLogueado()!);
  cenadPropio = computed(() => this.usuarioLogueado.cenadPropio());
  unidad = computed(() => this.usuarioLogueado.unidad());
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

constructor() {
  effect(() => {
    const u = this.usuario();
    const c = this.cenadPropio();
    const uni = this.unidad();
    // Actualizamos cada señal según exista el valor
    this.usuarioModal.set(u || undefined);
    this.cenadPropioModal.set(c || undefined);
    this.unidadPropiaModal.set(uni || undefined);
  });
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

  logout = () => {
    this.auth.logout();
    this.router.navigate([this.routesPaths.home]);
  }
}
