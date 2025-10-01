import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { IconosStore } from '@stores/iconos.store';

@Component({
  selector: 'app-not-found',
  imports:[FontAwesomeModule, RouterLink, TranslateModule],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {
  private iconos = inject(IconosStore);

  faHome =this.iconos.faHome;
  readonly routesPaths = RoutesPaths;
}
