import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-superadministrador-page',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FontAwesomeModule],
  templateUrl: './superadministrador-page.component.html',
  styleUrls: ['./superadministrador-page.component.css'],
})
export class SuperadministradorPageComponent {
  private iconoStore = inject(IconosStore);
  private router = inject(Router);
  isCenadActive = (): boolean =>  this.router.url === this.routesPaths.superadministrador;

  faHome = this.iconoStore.faHome;
  readonly routesPaths = RoutesPaths;
}
