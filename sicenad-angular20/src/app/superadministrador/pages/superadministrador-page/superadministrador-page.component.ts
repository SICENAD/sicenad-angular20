import { UpperCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-superadministrador-page',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FontAwesomeModule, TranslateModule, UpperCasePipe],
  templateUrl: './superadministrador-page.component.html',
  styleUrls: ['./superadministrador-page.component.css'],
})
export class SuperadministradorPageComponent {
  private iconoStore = inject(IconosStore);

  faHome = this.iconoStore.faHome;
  readonly routesPaths = RoutesPaths;
}
