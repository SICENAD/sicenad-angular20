import { Component, computed, inject, OnInit } from '@angular/core';
import { AuthStore } from '@stores/auth.store';
import { CargaInicialStore } from '@stores/cargaInicial.store';
import { firstValueFrom } from 'rxjs';
import { UtilsStore } from '@stores/utils.store';
import { Router, RouterLink } from '@angular/router';
import { RoutesPaths } from '@app/app.routes';


@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  auth = inject(AuthStore);
  private cargaInicial = inject(CargaInicialStore);
  private utils = inject(UtilsStore);
  private router = inject(Router);

    readonly routesPaths = RoutesPaths;

  identificacion = computed(() => {
    if (this.auth.rol() === 'Administrador' || this.auth.rol() === 'Gestor') {
      return `${this.auth.rol()} del ${this.cargaInicial.cenadPropio()?.nombre || ''}`
    } else if (this.auth.rol() === 'Normal') {
      return `${this.auth.rol()} de ${this.cargaInicial.unidad()?.nombre || ''}`
    } else {
      return this.auth.rol() || ''
    }
  })

  async ngOnInit() {
    await firstValueFrom(this.utils.cargarPropiedadesIniciales());
  }
  logout = () => {
    this.auth.logout();
    this.router.navigate(['']);
  }

}
