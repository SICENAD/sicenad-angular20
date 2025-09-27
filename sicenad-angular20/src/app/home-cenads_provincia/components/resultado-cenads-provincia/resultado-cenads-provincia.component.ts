import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';

@Component({
  selector: 'app-resultado-cenads-provincia',
  imports: [RouterLink],
  templateUrl: './resultado-cenads-provincia.component.html',
  styleUrls: ['./resultado-cenads-provincia.component.css'],
})
export class ResultadoCenadsProvinciaComponent {
  readonly routesPaths = RoutesPaths;
  cenad = input.required<{ idString: string; nombre: string }>();
}
