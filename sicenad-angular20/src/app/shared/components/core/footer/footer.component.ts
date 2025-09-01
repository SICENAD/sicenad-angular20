import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';

@Component({
  selector: 'app-footer',
  imports:[RouterLink, RouterLinkActive],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  readonly routesPaths = RoutesPaths;

}
