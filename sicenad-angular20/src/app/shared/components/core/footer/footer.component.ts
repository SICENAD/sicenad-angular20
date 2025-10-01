import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports:[RouterLink, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  readonly routesPaths = RoutesPaths;
}
